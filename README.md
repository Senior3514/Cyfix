# Cyfix

**Fix web security with humans and agents together.**

🔗 **Live app: [cyfix.vercel.app](https://cyfix.vercel.app)** · ⚡ [Instant demo, no network needed](https://cyfix.vercel.app/app?demo=1) · 📄 [MIT licensed](./LICENSE)

Cyfix is an agent-native web security app. A human names a domain they're authorized to test;
Cyfix runs a **passive-only** scan, scores what it finds, explains each issue in plain language,
and hands over a copy-pasteable fix. An AI agent in the browser can drive the whole workflow
itself through **WebMCP** (`document.modelContext.registerTool`) — but it can never authorize a
scan on the human's behalf.

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

---

## Why WebMCP is the right fit

Security tooling is the textbook case for human-agent collaboration with a hard boundary in the
middle. An agent is genuinely good at the tedious half — reading headers, ranking severity,
drafting the exact CSP string. But "scan this domain" is an action with legal and ethical weight,
and it must stay a human decision.

WebMCP lets us put those two facts in one place. The tools live in the page the human is already
looking at, so the agent and the human share one screen, one target, and one audit log — instead
of the agent operating a headless API somewhere the human can't see. The authorization gate isn't
a prompt the agent could talk its way past; it's a checkbox in the human's UI that the tool reads
before it will do anything.

**What this makes possible that wasn't before:** you can ask an agent "check my site and fix what's
broken," and it will scan, triage, explain, and write the config — while you keep a visible,
revocable veto over the one step that actually touches someone else's server.

## The six WebMCP tools

Registered on `document.modelContext` from **every page** (landing page included), so an agent can
discover them the moment it arrives. Where a browser doesn't implement `document.modelContext`
natively yet, Cyfix installs a same-shape polyfill so the tools always exist and stay testable
from the on-page **Agent Console**.

| Tool | What it does |
| --- | --- |
| `prepare_scan` | Proposes a domain to the human — fills the dashboard field, navigates there if needed, and deliberately leaves the authorization box unticked. |
| `scan_domain` | Runs the passive scan. **Refuses unless a human ticked the authorization box for that exact domain** — enforced inside the tool, not just in the UI. |
| `list_findings` | Returns compact findings (id, title, severity, category), filterable by severity or to failures only. |
| `explain_finding` | Explains one finding's real-world impact in plain language. |
| `generate_fix` | Returns a copy-pasteable remediation snippet (header or config) for a finding. |
| `export_report` | Builds a JSON or Markdown report and triggers a download for the human. |

Every call — human or agent — lands in the **Audit Log** with timestamp, actor, input, and outcome.

### The authorization gate, concretely

```
agent → scan_domain("acme.com")
      ← "Human authorization required. Call prepare_scan…"
agent → prepare_scan("acme.com")        # fills the field, cannot tick the box
human → ✅ "I confirm I am authorized to test this domain"
agent → scan_domain("acme.com")         # now it runs
```

Authorization is granted **per domain**. Retargeting to a different domain automatically revokes
it, so an approval for `acme.com` can never be reused to scan `example.com`.

## Cyfix scores 100/100 on itself

The obvious first thing to do with a security scanner is point it at the scanner. So we did, and
fixed everything it found — a nonce-based CSP (no `unsafe-inline` for scripts), HSTS, `nosniff`,
`X-Frame-Options: DENY`, a referrer policy, a permissions policy, no framework banner, and a real
`/.well-known/security.txt`.

Scan `cyfix.vercel.app` from the dashboard and check.

## Try it in 60 seconds

1. Open **[cyfix.vercel.app](https://cyfix.vercel.app)** → **Open Dashboard**.
2. Enter a domain you own (or `example.com`) and tick the authorization box.
3. **Run Passive Scan** → real findings, scored by severity, in a couple of seconds.
4. Scroll to **Agent Console** — the six live WebMCP tools, callable by hand exactly as an agent
   would call them. Try `list_findings` → `generate_fix`.
5. **Export Report** → JSON, Markdown, or print to PDF.

No API keys, no signup, nothing to install. In a hurry?
**[cyfix.vercel.app/app?demo=1](https://cyfix.vercel.app/app?demo=1)** loads a full scan offline.

## What Cyfix does — and never does

Cyfix is deliberately limited to **passive, authorized reconnaissance**.

| ✅ Does | ❌ Never does |
| --- | --- |
| Passive HTTP/HTTPS checks (headers, redirect behavior, cookie attributes) | No exploitation of any vulnerability |
| Single GETs to a few well-known paths (`/.env`, `/.git/config`, `security.txt`) | No brute forcing of credentials, directories, or parameters |
| Requires explicit human authorization before every scan | No port scanning or network mapping |
| Logs every human and agent action | No destructive or state-changing requests |

The whole scan is a handful of ordinary GET requests — the same ones any browser makes.

## What it actually checks

Real checks against the live target, not mocked: HTTPS enforcement · HSTS · CSP ·
`X-Content-Type-Options` · clickjacking protection · `Referrer-Policy` · `Permissions-Policy` ·
server banner disclosure · cookie `Secure` / `HttpOnly` / `SameSite` · `security.txt` ·
exposed `.env` · exposed `.git/config`.

## Repository layout

```
Cyfix/
├── README.md              # you are here
├── LICENSE                # MIT
└── cyfix-webmcp/          # the Next.js application
    ├── src/lib/webmcp.ts  # ← the six WebMCP tool definitions + polyfill
    ├── src/lib/scanner.ts # ← the passive scan engine
    ├── src/app/           # landing page, dashboard, /api/scan
    └── README.md          # full developer & deployment docs
```

## Run it locally

```bash
git clone https://github.com/Senior3514/Cyfix.git
cd Cyfix/cyfix-webmcp
npm install
npm run dev            # http://localhost:3000
```

Full setup, environment variables, deployment and architecture notes:
**[cyfix-webmcp/README.md](./cyfix-webmcp/README.md)**.

## Tech stack

Next.js 15 (App Router) · React 18 · TypeScript · Tailwind CSS · Zustand · WebMCP
(`document.modelContext`) · deployed on Vercel.

## License

[MIT](./LICENSE)
