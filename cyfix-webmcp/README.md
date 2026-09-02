# Cyfix

**Fix web security with humans and agents together.**

Cyfix is an agent-native web security app: a human enters an authorized domain, Cyfix runs a
safe **passive-only** scan, and both the human and an AI agent can explore findings, get
plain-language explanations, generate remediations, and export a report — with the agent acting
directly on the page through **WebMCP** (`document.modelContext.registerTool`).

Built for the [OpenAI WebMCP Challenge](https://webmcp.devpost.com/).

**Live app: [cyfix.vercel.app](https://cyfix.vercel.app)** — [instant offline demo](https://cyfix.vercel.app/app?demo=1).

---

## Table of contents

- [Core flow](#core-flow)
- [The workspace](#the-workspace)
- [WebMCP tools](#webmcp-tools)
- [Security rules](#security-rules)
- [Tech stack](#tech-stack)
- [Local setup](#local-setup)
- [Deploying to a VPS](#deploying-to-a-vps)
- [Project structure](#project-structure)
- [Demo script](#demo-script-for-judges)
- [Challenge submission checklist](#challenge-submission-checklist)
- [License](#license)

## Core flow

1. **Enter a domain & confirm authorization.** Nothing runs until you check the on-page
   authorization box.
2. **Cyfix runs a safe, passive scan.** HTTPS enforcement, security headers, cookie flags, and a
   short list of well-known public exposure checks (`/.env`, `/.git/config`, `security.txt`).
3. **Review findings.** Each result is scored by severity (critical → info) with plain-language
   impact and a copy-paste remediation snippet.
4. **Let an agent take the wheel.** Any AI agent embedded in the browser can call Cyfix's WebMCP
   tools directly from the page — every call is authorization-gated and logged.
5. **Export a report.** Download a clean JSON or Markdown report, or print it to PDF.

## The workspace

`/app` is laid out as an application, not a page: a persistent left rail carries the sections
(Overview, New Scan, Findings, Fix & Verify, Agent Console, Scan History, Audit Log), tracks which
one you are reading via an `IntersectionObserver`, and pins the current target and score at the
bottom. The mark at the top of the rail returns to the landing page, and the rail collapses to an
icon strip whose state survives a reload. Below `lg` the rail becomes a drawer and a horizontal
pill nav takes over, so the same structure holds on a phone.

The top bar carries a live **tool-status pill** — how many WebMCP tools are registered on
`document.modelContext` right now, and whether that landed on the browser's native implementation
or on Cyfix's polyfill. It answers the first question anyone evaluating the app has without a
devtools detour.

## WebMCP tools

Cyfix registers seven tools on `document.modelContext` (using
[`registerTool`](https://github.com/webmachinelearning/webmcp)) from every page — the landing page
included — so an agent arriving at the site can discover them immediately.
If the browser doesn't yet implement `document.modelContext` natively, `src/lib/webmcp.ts`
installs a same-shape polyfill so the tools are always present and testable — visible live in the
dashboard's **Agent Console**, where you can simulate any agent tool call by hand.

| Tool | Description |
| --- | --- |
| `prepare_scan` | Proposes a domain to the human: writes it into the dashboard field, navigates there if the human is elsewhere, and deliberately leaves the authorization checkbox unticked. The agent's way to *ask*. |
| `scan_domain` | Runs the passive scan for a domain. **Only executes if a human has already checked the authorization box for that exact domain** — this is enforced in the tool itself, not just the UI. |
| `list_findings` | Returns compact finding records (id, title, severity, category, passed), filterable by severity or narrowed to failures only. |
| `explain_finding` | Returns a plain-language explanation of a specific finding's real-world impact. |
| `generate_fix` | Returns copy-pasteable remediation snippets (headers/config) for a finding. |
| `verify_fix` | Re-runs the scan and reports whether a specific finding is now resolved, so a remediation is confirmed against the live site rather than assumed. Human-gated like any scan. |
| `export_report` | Builds a JSON or Markdown report of the current scan and triggers a download. |

Authorization is tracked **per domain**: retargeting the scan to a different domain automatically
revokes it, so approval for one host can never be reused against another.

Every tool call — human or agent — is appended to the **Audit Log** with a timestamp, actor,
input, and outcome.

## Security rules

Cyfix is deliberately limited to **passive, authorized reconnaissance**:

- ✅ Passive HTTP/HTTPS checks only (headers, TLS redirect behavior, cookie attributes)
- ✅ A handful of single, well-known-path GET requests (no crawling, no brute force)
- ✅ Explicit human authorization required before every scan, enforced server-side and in the
  WebMCP tool itself
- ✅ Full audit log of every human and agent action
- ❌ No exploit code or vulnerability exploitation
- ❌ No brute forcing of credentials, directories, or parameters
- ❌ No port scanning or network mapping
- ❌ No destructive or state-changing actions against the target

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** (custom graphite/black/teal dark theme)
- **Zustand** for lightweight client state (scan results, audit log)
- **lucide-react** icons
- Zero required external services or API keys — the scan engine and finding
  explanations/remediations are fully self-contained

## Local setup

```bash
cd cyfix-webmcp
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click **Try Demo** to explore the full
product instantly with canned data (no network calls), or **Launch App** to run a real passive
scan against a domain you're authorized to test.

### Build for production

```bash
npm run build
npm run start
```

## Deploying to a VPS

1. Clone the repo onto your VPS and `cd cyfix-webmcp`.
2. Copy `.env.example` to `.env` and adjust `PORT`, `SCAN_TIMEOUT_MS`, `RATE_LIMIT_MAX` as needed.
3. Run the deploy script — it installs dependencies, builds, and starts/reloads the app under
   [PM2](https://pm2.keymetrics.io/):

   ```bash
   ./deploy.sh
   ```

4. Put nginx (or your preferred reverse proxy) in front of it, for example:

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;

     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

5. Terminate TLS at nginx (e.g. via `certbot`) so Cyfix itself is only ever reached over HTTPS.

Re-run `./deploy.sh` any time you want to pull and ship the latest changes.

## Project structure

```
cyfix-webmcp/
  src/
    app/
      page.tsx              # Landing page
      app/page.tsx           # App dashboard
      api/scan/route.ts      # Passive scan API endpoint
      layout.tsx, globals.css
    components/
      landing/                # Hero, features, how-it-works, security rules, footer
      dashboard/               # App shell (sidebar, tool-status pill, empty state), domain form,
                                 findings table, finding detail, agent console, audit log,
                                 report modal, score summary, section rail
      ui/                      # Button, Card, Badge, Modal
      logo.tsx
    lib/
      sections.ts              # Dashboard section registry + active-section tracking
      scanner.ts               # Server-side passive scan engine
      findings.ts               # Finding catalog: severity, explanations, remediations
      webmcp.ts                 # document.modelContext registration + polyfill + tool logic
      stores.ts                 # Zustand stores (scan state, audit log)
      demo-data.ts               # Canned scan result for demo mode
      report.ts                  # JSON/Markdown report builders
      rate-limit.ts               # In-memory per-IP rate limiter
    types/index.ts
  deploy.sh
  ecosystem.config.js
  .env.example
```

## Demo script (for judges)

No setup required beyond `npm install && npm run dev` — the demo path never touches the network.

1. Open the landing page — note the tagline, branding, and the **Security rules** section
   explaining what Cyfix will and won't do.
2. Click **Try Demo for Judges**. The dashboard loads instantly with a realistic canned scan of
   `demo.cyfix.app` (score, findings, mixed pass/fail).
3. Click a failing finding (e.g. *Content-Security-Policy header*) — see the AI explanation,
   impact, and a ready-to-use remediation snippet.
4. Open the **Agent Console** and expand `explain_finding` or `generate_fix` — pick a finding
   from the dropdown and click **Run tool**. This calls the exact same
   `document.modelContext.registerTool` function an embedded AI agent would call.
5. Expand `scan_domain` — notice it's gated on the authorization checkbox; this is the
   human-approval boundary enforced inside the tool itself, not just the form.
6. Click **Export Report** — toggle between Markdown/JSON, download, or print to PDF.
7. Scroll the **Audit Log** — every action from steps 2–6 is recorded with actor, tool, and
   outcome.
8. Optionally, run a real scan: go back to the dashboard root, enter a domain you're authorized
   to test, check the authorization box, and click **Run Passive Scan**.

## Challenge submission checklist

- [x] End-to-end product: landing page → authorized passive scan → findings → agent tools →
      report export
- [x] WebMCP tools registered via `document.modelContext.registerTool` with a safe fallback
      polyfill
- [x] Four tools implemented: `scan_domain`, `explain_finding`, `generate_fix`, `export_report`
- [x] Passive-only scanning with no exploits, brute force, or port scanning
- [x] Human-authorization gate enforced both in the UI and inside the WebMCP tool logic
- [x] Full audit log of human + agent actions
- [x] Demo mode requiring zero setup or network access
- [x] Premium dark graphite/teal UI, custom SVG logo
- [x] MIT license, README, `.env.example`, `deploy.sh`, PM2 config
- [ ] Record a short demo video walking through the script above
- [ ] Deploy a live instance and link it in the submission

## License

[MIT](./LICENSE)
