import { Ban, CheckCircle2 } from "lucide-react";

const ALLOWED = [
  "Passive HTTP/HTTPS checks only",
  "Single, well-known-path exposure checks (no crawling)",
  "Explicit human authorization before every scan",
  "Full audit log of every human & agent action",
];

const FORBIDDEN = [
  "No exploit code or vulnerability exploitation",
  "No brute forcing of credentials or paths",
  "No port scanning or network mapping",
  "No destructive or state-changing actions",
];

export function SecurityRules() {
  return (
    <section id="security" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white">Built to stay in bounds</h2>
        <p className="mt-4 text-graphite-500">
          Cyfix is intentionally limited to passive, authorized reconnaissance — for humans and
          agents alike.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-6">
          <h3 className="font-display flex items-center gap-2 text-sm font-semibold text-teal-300">
            <CheckCircle2 size={16} /> What Cyfix does
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-graphite-400">
            {ALLOWED.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-teal-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-severity-critical/30 bg-severity-critical/5 p-6">
          <h3 className="font-display flex items-center gap-2 text-sm font-semibold text-severity-critical">
            <Ban size={16} /> What Cyfix never does
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-graphite-400">
            {FORBIDDEN.map((item) => (
              <li key={item} className="flex gap-2.5">
                <Ban size={15} className="mt-0.5 shrink-0 text-severity-critical" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
