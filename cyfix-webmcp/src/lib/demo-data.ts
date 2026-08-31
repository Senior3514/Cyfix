import type { ScanResult } from "@/types";
import { buildFinding, computeScore } from "@/lib/findings";
import { uid } from "@/lib/utils";

export const DEMO_DOMAIN = "demo.cyfix.app";

/**
 * A realistic, fixed mix of passed/failed checks so judges can explore
 * every part of the product (findings table, explain panel, remediation,
 * export) with zero network access and zero setup.
 */
export function buildDemoResult(): ScanResult {
  const startedAt = new Date(Date.now() - 4200).toISOString();
  const finishedAt = new Date().toISOString();

  const findings = [
    buildFinding("https-enforced", true, "HTTP 301, Location: https://demo.cyfix.app/"),
    buildFinding("hsts-header", true, "max-age=63072000; includeSubDomains; preload"),
    buildFinding("csp-header", false, "header not present"),
    buildFinding("x-content-type-options", true, "nosniff"),
    buildFinding("frame-protection", false, "no protection found"),
    buildFinding("referrer-policy", true, "strict-origin-when-cross-origin"),
    buildFinding("permissions-policy", false, "header not present"),
    buildFinding("server-banner", false, "Server: nginx/1.18.0"),
    buildFinding("cookie-secure", true, "2 cookie(s) observed"),
    buildFinding("cookie-httponly", false, "2 cookie(s) observed"),
    buildFinding("cookie-samesite", true, "2 cookie(s) observed"),
    buildFinding("security-txt", false, "unreachable"),
    buildFinding("env-file-exposure", true, "HTTP 404"),
    buildFinding("git-exposure", true, "HTTP 404"),
  ];

  return {
    id: uid("demo"),
    domain: DEMO_DOMAIN,
    startedAt,
    finishedAt,
    score: computeScore(findings),
    findings,
    isDemo: true,
  };
}
