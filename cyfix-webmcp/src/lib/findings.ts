import type {
  Finding,
  FindingCategory,
  FindingExplanation,
  RemediationSnippet,
  Severity,
} from "@/types";

export interface FindingDef {
  id: string;
  category: FindingCategory;
  title: string;
  severity: Severity;
  descriptionPass: string;
  descriptionFail: string;
  impact: string;
  explanation: string;
  remediation: string;
  snippets: RemediationSnippet[];
}

/**
 * The full catalog of passive checks Cyfix knows how to run and explain.
 * Kept as static, deterministic content so explain_finding/generate_fix
 * work instantly with zero external API calls/keys.
 */
export const FINDING_CATALOG: Record<string, FindingDef> = {
  "https-enforced": {
    id: "https-enforced",
    category: "transport",
    title: "HTTPS enforced for all traffic",
    severity: "critical",
    descriptionPass: "Plain HTTP requests are redirected to HTTPS.",
    descriptionFail: "The site serves content over plain HTTP without redirecting to HTTPS.",
    impact:
      "Traffic (including cookies and form submissions) can be intercepted or altered in transit by anyone on the network path, e.g. on public Wi-Fi.",
    explanation:
      "When a site accepts HTTP without forcing a redirect to HTTPS, an attacker positioned on the network (a coffee-shop Wi-Fi, a compromised router) can read or tamper with everything exchanged before TLS ever kicks in. This is one of the highest-impact, cheapest-to-fix issues in web security.",
    remediation:
      "Redirect all HTTP requests to HTTPS at the edge (load balancer, CDN, or web server) and enable HSTS so browsers remember to always use HTTPS for this host.",
    snippets: [
      {
        label: "nginx",
        language: "nginx",
        code: `server {\n  listen 80;\n  server_name example.com;\n  return 301 https://$host$request_uri;\n}`,
      },
      {
        label: "Next.js middleware",
        language: "ts",
        code: `export function middleware(req: NextRequest) {\n  if (req.headers.get("x-forwarded-proto") === "http") {\n    const url = req.nextUrl.clone();\n    url.protocol = "https:";\n    return NextResponse.redirect(url, 308);\n  }\n}`,
      },
    ],
  },
  "hsts-header": {
    id: "hsts-header",
    category: "headers",
    title: "Strict-Transport-Security header",
    severity: "high",
    descriptionPass: "Strict-Transport-Security is present with a meaningful max-age.",
    descriptionFail: "Strict-Transport-Security header is missing or weak.",
    impact:
      "Without HSTS, a user's very first request (or one after an expired policy) can still be downgraded to HTTP by an on-path attacker (SSL-stripping).",
    explanation:
      "HSTS tells browsers 'never talk to this host over plain HTTP again, even if a link or redirect asks you to.' Without it, the very first connection — and any time a user types the bare domain — is vulnerable to being silently downgraded to HTTP.",
    remediation:
      "Send a Strict-Transport-Security header with a long max-age, includeSubDomains, and consider HSTS preload once you're confident every subdomain supports HTTPS.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`,
      },
      {
        label: "nginx",
        language: "nginx",
        code: `add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;`,
      },
    ],
  },
  "csp-header": {
    id: "csp-header",
    category: "headers",
    title: "Content-Security-Policy header",
    severity: "high",
    descriptionPass: "A Content-Security-Policy header is present.",
    descriptionFail: "No Content-Security-Policy header was found.",
    impact:
      "Without CSP, a successful injection of attacker-controlled markup (XSS) has far fewer restrictions on what scripts, styles, or connections it can make.",
    explanation:
      "CSP is a browser-enforced allowlist for where scripts, styles, images, and connections may load from. It doesn't prevent an XSS bug from existing, but it dramatically limits what an attacker can do with one — a strong safety net behind your input handling.",
    remediation:
      "Start with a strict default-src and explicitly allow only the origins your app actually needs; use nonces or hashes for inline scripts instead of 'unsafe-inline'.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'`,
      },
    ],
  },
  "x-content-type-options": {
    id: "x-content-type-options",
    category: "headers",
    title: "X-Content-Type-Options header",
    severity: "medium",
    descriptionPass: "X-Content-Type-Options: nosniff is set.",
    descriptionFail: "X-Content-Type-Options header is missing.",
    impact:
      "Browsers may MIME-sniff a response into an executable type, letting an attacker turn an upload or misconfigured route into script execution.",
    explanation:
      "Without 'nosniff', some browsers try to guess a response's content type rather than trusting the declared one. An attacker who can control part of a response (e.g. a file upload) can sometimes get it interpreted as HTML/JS instead of the harmless type it was meant to be.",
    remediation: "Send X-Content-Type-Options: nosniff on every response.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `X-Content-Type-Options: nosniff`,
      },
    ],
  },
  "frame-protection": {
    id: "frame-protection",
    category: "headers",
    title: "Clickjacking protection (X-Frame-Options / CSP frame-ancestors)",
    severity: "medium",
    descriptionPass: "The response restricts framing via X-Frame-Options or CSP frame-ancestors.",
    descriptionFail: "No clickjacking protection header (X-Frame-Options or frame-ancestors) was found.",
    impact:
      "The page can be embedded in a hidden iframe on a malicious site, tricking users into clicking real buttons on your site without knowing it (clickjacking).",
    explanation:
      "Clickjacking overlays your real page in an invisible iframe under attacker-controlled UI, so a user thinks they're clicking a game or button when they're actually clicking a button on your site (e.g. 'Transfer funds').",
    remediation:
      "Set X-Frame-Options: DENY (or SAMEORIGIN if you legitimately frame your own pages), or the equivalent CSP frame-ancestors directive.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `X-Frame-Options: DENY\nContent-Security-Policy: frame-ancestors 'none'`,
      },
    ],
  },
  "referrer-policy": {
    id: "referrer-policy",
    category: "headers",
    title: "Referrer-Policy header",
    severity: "low",
    descriptionPass: "A restrictive Referrer-Policy is set.",
    descriptionFail: "No Referrer-Policy header was found.",
    impact:
      "Full URLs (which can include tokens, IDs, or search terms) may leak to third-party sites via the Referer header on outbound links.",
    explanation:
      "By default, browsers send the full referring URL to any site you link to. If your URLs ever contain sensitive query parameters, that leaks them to whatever site the user clicks through to.",
    remediation: "Set a conservative Referrer-Policy such as strict-origin-when-cross-origin.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `Referrer-Policy: strict-origin-when-cross-origin`,
      },
    ],
  },
  "permissions-policy": {
    id: "permissions-policy",
    category: "headers",
    title: "Permissions-Policy header",
    severity: "low",
    descriptionPass: "A Permissions-Policy header restricts powerful browser features.",
    descriptionFail: "No Permissions-Policy header was found.",
    impact:
      "Powerful browser APIs (camera, microphone, geolocation, USB) remain available to any script running on the page, including third-party scripts you embed.",
    explanation:
      "Permissions-Policy lets you turn off browser features you don't use. If a third-party script you embed (an ad, a widget) is later compromised, a locked-down policy stops it from silently requesting camera/mic/location access.",
    remediation:
      "Disable features you don't use, e.g. deny camera, microphone, and geolocation by default.",
    snippets: [
      {
        label: "HTTP header",
        language: "http",
        code: `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
      },
    ],
  },
  "server-banner": {
    id: "server-banner",
    category: "disclosure",
    title: "Server/technology banner disclosure",
    severity: "low",
    descriptionPass: "The Server header does not reveal detailed version information.",
    descriptionFail: "The Server or X-Powered-By header discloses specific software/version details.",
    impact:
      "Version fingerprints make it faster for an attacker to look up known vulnerabilities for your exact stack.",
    explanation:
      "Headers like 'Server: nginx/1.18.0' or 'X-Powered-By: Express' hand an attacker a head start: they can go straight to the CVE list for that exact version instead of guessing.",
    remediation:
      "Strip or generalize the Server and X-Powered-By headers at the reverse proxy.",
    snippets: [
      {
        label: "nginx",
        language: "nginx",
        code: `server_tokens off;\nmore_clear_headers 'X-Powered-By';`,
      },
    ],
  },
  "cookie-secure": {
    id: "cookie-secure",
    category: "cookies",
    title: "Cookies use the Secure flag",
    severity: "high",
    descriptionPass: "All observed cookies set the Secure flag.",
    descriptionFail: "One or more cookies are missing the Secure flag.",
    impact:
      "Without Secure, a cookie can be sent over an accidental plain-HTTP request and captured in transit.",
    explanation:
      "The Secure flag tells the browser 'only ever send this cookie over HTTPS.' Without it, if a user ever hits an HTTP URL for your domain (an old link, a typo), the cookie — potentially a session token — goes out in the clear.",
    remediation: "Set the Secure attribute on every cookie that carries session or auth state.",
    snippets: [
      {
        label: "Set-Cookie",
        language: "http",
        code: `Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax; Path=/`,
      },
    ],
  },
  "cookie-httponly": {
    id: "cookie-httponly",
    category: "cookies",
    title: "Cookies use the HttpOnly flag",
    severity: "high",
    descriptionPass: "All observed cookies set the HttpOnly flag.",
    descriptionFail: "One or more cookies are missing the HttpOnly flag.",
    impact:
      "A cookie without HttpOnly can be read by JavaScript, so a single XSS bug becomes a full session-token theft instead of a contained annoyance.",
    explanation:
      "HttpOnly hides a cookie from document.cookie / JavaScript entirely. It's cheap insurance: even if an XSS bug slips through, the attacker's injected script still can't read the session cookie.",
    remediation: "Set HttpOnly on every cookie that doesn't need to be read by client-side JS.",
    snippets: [
      {
        label: "Set-Cookie",
        language: "http",
        code: `Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax; Path=/`,
      },
    ],
  },
  "cookie-samesite": {
    id: "cookie-samesite",
    category: "cookies",
    title: "Cookies use a SameSite attribute",
    severity: "medium",
    descriptionPass: "Observed cookies set a SameSite attribute (Lax or Strict).",
    descriptionFail: "One or more cookies are missing a SameSite attribute.",
    impact:
      "Without SameSite, cookies are attached to cross-site requests, which is what makes cross-site request forgery (CSRF) attacks work.",
    explanation:
      "SameSite tells the browser whether to attach a cookie when the request originated from another site. Lax/Strict closes off most CSRF attack paths for free, at the cost of very few legitimate cross-site use cases.",
    remediation:
      "Set SameSite=Lax (or Strict for highly sensitive cookies) on all session cookies.",
    snippets: [
      {
        label: "Set-Cookie",
        language: "http",
        code: `Set-Cookie: session=<value>; Secure; HttpOnly; SameSite=Lax; Path=/`,
      },
    ],
  },
  "env-file-exposure": {
    id: "env-file-exposure",
    category: "exposure",
    title: "Publicly accessible .env file",
    severity: "critical",
    descriptionPass: "No .env file is publicly reachable at the web root.",
    descriptionFail: "A .env file appears to be publicly reachable at the web root.",
    impact:
      "A public .env file commonly leaks database credentials, API keys, and signing secrets — a direct path to full compromise.",
    explanation:
      "This checks a single well-known path (GET /.env) the way a browser would — it does not guess variations or brute-force paths. If it's reachable, secrets meant to stay server-side are sitting in plain text for anyone who requests the URL.",
    remediation:
      "Remove .env files from the web root entirely, or explicitly deny access to dotfiles at the web server level; rotate any credentials that may have been exposed.",
    snippets: [
      {
        label: "nginx",
        language: "nginx",
        code: `location ~ /\\.(env|git) {\n  deny all;\n  return 404;\n}`,
      },
    ],
  },
  "git-exposure": {
    id: "git-exposure",
    category: "exposure",
    title: "Publicly accessible .git directory",
    severity: "critical",
    descriptionPass: "No .git/config file is publicly reachable at the web root.",
    descriptionFail: "A .git/config file appears to be publicly reachable at the web root.",
    impact:
      "An exposed .git directory lets anyone reconstruct your source history, including past secrets and internal logic, using standard tools.",
    explanation:
      "This is a single passive GET to /.git/config, mirroring what any visitor's browser would see — not a scan of the repository. A reachable .git directory means your entire commit history, including anything ever committed and later 'removed', can be pulled down.",
    remediation:
      "Never deploy the .git directory to the web root; explicitly block dotfile access at the web server, and rotate any secrets that ever touched the repo history.",
    snippets: [
      {
        label: "nginx",
        language: "nginx",
        code: `location ~ /\\.git { deny all; return 404; }`,
      },
    ],
  },
  "security-txt": {
    id: "security-txt",
    category: "exposure",
    title: "security.txt disclosure policy",
    severity: "info",
    descriptionPass: "A /.well-known/security.txt file was found.",
    descriptionFail: "No /.well-known/security.txt file was found.",
    impact:
      "Without a published security contact, researchers who find a real issue have no clear, safe way to report it to you.",
    explanation:
      "security.txt (RFC 9116) is a standard, low-effort way to tell security researchers how to responsibly report issues to you, before they end up on Twitter or a bug bounty platform you're not monitoring.",
    remediation: "Publish a security.txt file describing a contact and disclosure policy.",
    snippets: [
      {
        label: "/.well-known/security.txt",
        language: "text",
        code: `Contact: mailto:security@example.com\nExpires: 2027-01-01T00:00:00.000Z\nPreferred-Languages: en`,
      },
    ],
  },
};

export function buildFinding(kind: string, passed: boolean, evidence?: string): Finding {
  const def = FINDING_CATALOG[kind];
  if (!def) throw new Error(`Unknown finding kind: ${kind}`);
  return {
    id: def.id,
    category: def.category,
    title: def.title,
    severity: def.severity,
    description: passed ? def.descriptionPass : def.descriptionFail,
    impact: def.impact,
    evidence,
    passed,
  };
}

export function explainFinding(finding: Pick<Finding, "id">): FindingExplanation {
  const def = FINDING_CATALOG[finding.id];
  if (!def) {
    return {
      explanation: "No further detail is available for this finding.",
      remediation: "",
      snippets: [],
    };
  }
  return { explanation: def.explanation, remediation: def.remediation, snippets: def.snippets };
}

export function generateFix(finding: Pick<Finding, "id">): RemediationSnippet[] {
  const def = FINDING_CATALOG[finding.id];
  return def ? def.snippets : [];
}

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 4,
  info: 0,
};

export function computeScore(findings: Finding[]): number {
  const penalty = findings
    .filter((f) => !f.passed)
    .reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}
