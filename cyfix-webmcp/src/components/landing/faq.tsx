import { ChevronDown } from "lucide-react";

/**
 * Native <details> rather than a JS accordion: it works before hydration, is
 * keyboard and screen-reader correct for free, and needs no inline script —
 * which matters under a nonce-based CSP.
 */

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this legal to run against a site?",
    a: (
      <>
        Cyfix only makes ordinary GET requests — the same ones your browser makes when it loads a
        page. There is no exploitation, no brute force, no port scanning, and nothing that changes
        state on the target. It still requires you to confirm you are authorized, because
        authorization is about permission, not about how loud the traffic is.
      </>
    ),
  },
  {
    q: "What exactly does it check?",
    a: (
      <>
        HTTPS enforcement, HSTS, Content-Security-Policy, X-Content-Type-Options, clickjacking
        protection, Referrer-Policy, Permissions-Policy, server and framework banner disclosure,
        cookie <code className="font-mono text-teal-400">Secure</code> /{" "}
        <code className="font-mono text-teal-400">HttpOnly</code> /{" "}
        <code className="font-mono text-teal-400">SameSite</code> flags, a{" "}
        <code className="font-mono text-teal-400">security.txt</code> policy, and single requests
        to two well-known paths that should never be public:{" "}
        <code className="font-mono text-teal-400">/.env</code> and{" "}
        <code className="font-mono text-teal-400">/.git/config</code>.
      </>
    ),
  },
  {
    q: "Can the agent scan a domain without me?",
    a: (
      <>
        No. <code className="font-mono text-teal-400">scan_domain</code> reads the state of the
        authorization checkbox before it does anything, and the check lives inside the tool rather
        than in the interface around it. The agent&apos;s only move is{" "}
        <code className="font-mono text-teal-400">prepare_scan</code>, which proposes a domain and
        leaves the approval to you. Approval is also scoped to a single domain — retargeting
        revokes it automatically.
      </>
    ),
  },
  {
    q: "Why WebMCP instead of a normal API or an MCP server?",
    a: (
      <>
        Because the gate has to be somewhere the human can see it. A server-side integration would
        put the agent in a place you cannot watch, holding credentials you cannot revoke mid-task.
        WebMCP keeps the tools in the page you already have open, running with your session, so the
        agent and the human share one target, one result set, and one audit log — and the tools
        disappear when you close the tab.
      </>
    ),
  },
  {
    q: "Does it work in my browser?",
    a: (
      <>
        Yes. Where{" "}
        <code className="font-mono text-teal-400">document.modelContext</code> exists natively,
        Cyfix registers against it. Where it does not yet, Cyfix installs a same-shape polyfill so
        the tools are still registered and callable — by an agent that shims the API, or by you
        from the Agent Console, which is a real caller and not a mock.
      </>
    ),
  },
  {
    q: "Does Cyfix pass its own scan?",
    a: (
      <>
        100/100. Scan <code className="font-mono text-teal-400">cyfix.vercel.app</code> from the
        dashboard and see. It ships a nonce-based CSP with no{" "}
        <code className="font-mono text-teal-400">unsafe-inline</code> for scripts, HSTS,{" "}
        <code className="font-mono text-teal-400">nosniff</code>,{" "}
        <code className="font-mono text-teal-400">X-Frame-Options: DENY</code>, a referrer policy, a
        permissions policy, no framework banner, and a real security.txt.
      </>
    ),
  },
];

export function Faq() {
  return (
    <section className="border-t border-graphite-800/80 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-400">
            Straight answers
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The questions worth asking
          </h2>
        </div>

        <div className="mt-10 divide-y divide-graphite-800 border-y border-graphite-800">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-display text-sm font-semibold text-white sm:text-base">
                  {f.q}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-graphite-500 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-graphite-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
