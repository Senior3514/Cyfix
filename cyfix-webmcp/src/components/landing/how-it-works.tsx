const STEPS = [
  {
    n: "01",
    title: "Enter a domain & confirm authorization",
    body: "You provide the domain and explicitly confirm you're authorized to test it. No scan runs without this step.",
  },
  {
    n: "02",
    title: "Cyfix runs a safe, passive scan",
    body: "HTTPS enforcement, security headers, cookie flags, and a small set of well-known exposure checks — nothing active or destructive.",
  },
  {
    n: "03",
    title: "Review findings, impact & remediation",
    body: "Every result is scored by severity with a plain-language explanation and a copy-paste fix.",
  },
  {
    n: "04",
    title: "Let an agent take the wheel",
    body: "An AI agent can call scan_domain, explain_finding, generate_fix, and export_report directly via WebMCP — every call is logged.",
  },
  {
    n: "05",
    title: "Export the report",
    body: "Download a clean JSON or Markdown report of the scan, findings, and remediations to share with your team.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-graphite-800/80 bg-graphite-900/40">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h2 className="font-display text-center text-3xl font-bold tracking-tight text-white">
          How it works
        </h2>
        <div className="mt-14 space-y-10">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-6">
              <div className="font-mono text-2xl font-bold text-teal-500/40">{s.n}</div>
              <div>
                <h3 className="font-display text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-graphite-500">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
