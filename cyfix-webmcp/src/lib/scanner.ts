import "server-only";
import type { Finding, ScanResult } from "@/types";
import { buildFinding, computeScore } from "@/lib/findings";
import { uid } from "@/lib/utils";

const DEFAULT_TIMEOUT_MS = Number(process.env.SCAN_TIMEOUT_MS ?? 6000);
const USER_AGENT = "CyfixPassiveScanner/1.0 (+authorized passive security check)";

interface FetchResult {
  ok: boolean;
  status?: number;
  headers?: Headers;
  setCookies?: string[];
  body?: string;
  error?: string;
}

async function safeFetch(
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<FetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, ...(init.headers ?? {}) },
    });
    let body: string | undefined;
    try {
      body = (await res.text()).slice(0, 4000);
    } catch {
      body = undefined;
    }
    const setCookies =
      typeof (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie ===
      "function"
        ? (res.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
        : res.headers.get("set-cookie")
          ? [res.headers.get("set-cookie") as string]
          : [];
    return { ok: true, status: res.status, headers: res.headers, setCookies, body };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "request failed" };
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeHtmlShell(body?: string): boolean {
  if (!body) return false;
  const head = body.slice(0, 200).toLowerCase();
  return head.includes("<!doctype") || head.includes("<html");
}

export class ScanUnreachableError extends Error {}

export async function runPassiveScan(domain: string): Promise<ScanResult> {
  const startedAt = new Date().toISOString();
  const findings: Finding[] = [];

  const httpsRes = await safeFetch(`https://${domain}/`, { method: "GET" });
  if (!httpsRes.ok) {
    throw new ScanUnreachableError(
      `Could not establish an HTTPS connection to ${domain}. Confirm the domain is correct, publicly reachable, and that you're authorized to scan it.`,
    );
  }

  // 1. HTTPS enforcement
  const httpRes = await safeFetch(`http://${domain}/`, { method: "GET" });
  const httpRedirectsToHttps =
    httpRes.ok &&
    httpRes.status !== undefined &&
    httpRes.status >= 300 &&
    httpRes.status < 400 &&
    (httpRes.headers?.get("location") ?? "").startsWith("https://");
  const httpUnreachable = !httpRes.ok;
  findings.push(
    buildFinding(
      "https-enforced",
      httpRedirectsToHttps || httpUnreachable,
      httpRes.ok ? `HTTP ${httpRes.status}, Location: ${httpRes.headers?.get("location") ?? "none"}` : "Port 80 unreachable",
    ),
  );

  const h = httpsRes.headers!;

  // 2. HSTS
  const hsts = h.get("strict-transport-security");
  findings.push(
    buildFinding("hsts-header", !!hsts && /max-age=\d+/.test(hsts) && !/max-age=0/.test(hsts), hsts ?? "header not present"),
  );

  // 3. CSP
  const csp = h.get("content-security-policy");
  findings.push(buildFinding("csp-header", !!csp, csp ?? "header not present"));

  // 4. X-Content-Type-Options
  const xcto = h.get("x-content-type-options");
  findings.push(
    buildFinding("x-content-type-options", (xcto ?? "").toLowerCase() === "nosniff", xcto ?? "header not present"),
  );

  // 5. Clickjacking protection
  const xfo = h.get("x-frame-options");
  const frameAncestors = csp?.includes("frame-ancestors");
  findings.push(
    buildFinding(
      "frame-protection",
      !!xfo || !!frameAncestors,
      xfo ? `X-Frame-Options: ${xfo}` : frameAncestors ? "CSP frame-ancestors present" : "no protection found",
    ),
  );

  // 6. Referrer-Policy
  const referrerPolicy = h.get("referrer-policy");
  const strictReferrer =
    !!referrerPolicy &&
    !["unsafe-url", "no-referrer-when-downgrade"].includes(referrerPolicy.toLowerCase());
  findings.push(buildFinding("referrer-policy", strictReferrer, referrerPolicy ?? "header not present"));

  // 7. Permissions-Policy
  const permissionsPolicy = h.get("permissions-policy");
  findings.push(
    buildFinding("permissions-policy", !!permissionsPolicy, permissionsPolicy ?? "header not present"),
  );

  // 8. Server banner disclosure
  const serverHeader = h.get("server");
  const poweredBy = h.get("x-powered-by");
  const disclosesVersion = (!!serverHeader && /\d/.test(serverHeader)) || !!poweredBy;
  findings.push(
    buildFinding(
      "server-banner",
      !disclosesVersion,
      [serverHeader && `Server: ${serverHeader}`, poweredBy && `X-Powered-By: ${poweredBy}`]
        .filter(Boolean)
        .join(", ") || "no identifying banner",
    ),
  );

  // 9-11. Cookie flags
  const cookies = httpsRes.setCookies ?? [];
  if (cookies.length > 0) {
    const allSecure = cookies.every((c) => /;\s*secure/i.test(c));
    const allHttpOnly = cookies.every((c) => /;\s*httponly/i.test(c));
    const allSameSite = cookies.every((c) => /;\s*samesite=/i.test(c));
    findings.push(buildFinding("cookie-secure", allSecure, `${cookies.length} cookie(s) observed`));
    findings.push(buildFinding("cookie-httponly", allHttpOnly, `${cookies.length} cookie(s) observed`));
    findings.push(buildFinding("cookie-samesite", allSameSite, `${cookies.length} cookie(s) observed`));
  }

  // 12. security.txt (informational)
  const secTxt = await safeFetch(`https://${domain}/.well-known/security.txt`, { method: "GET" });
  findings.push(buildFinding("security-txt", secTxt.ok && secTxt.status === 200, secTxt.ok ? `HTTP ${secTxt.status}` : "unreachable"));

  // 13-14. Single, passive, well-known-path exposure checks (no brute force, no crawling)
  const envRes = await safeFetch(`https://${domain}/.env`, { method: "GET" });
  const envExposed = envRes.ok && envRes.status === 200 && !looksLikeHtmlShell(envRes.body);
  findings.push(buildFinding("env-file-exposure", !envExposed, envRes.ok ? `HTTP ${envRes.status}` : "unreachable"));

  const gitRes = await safeFetch(`https://${domain}/.git/config`, { method: "GET" });
  const gitExposed = gitRes.ok && gitRes.status === 200 && !looksLikeHtmlShell(gitRes.body);
  findings.push(buildFinding("git-exposure", !gitExposed, gitRes.ok ? `HTTP ${gitRes.status}` : "unreachable"));

  const finishedAt = new Date().toISOString();

  return {
    id: uid("scan"),
    domain,
    startedAt,
    finishedAt,
    score: computeScore(findings),
    findings,
  };
}
