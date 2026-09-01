import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size={30} />
      <div>
        <p className="text-5xl font-bold text-white">404</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-graphite-400">
          That page doesn&apos;t exist. Cyfix only has two: the overview, and the dashboard where
          scans actually run.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-graphite-600 bg-graphite-800 px-5 text-sm font-medium text-white hover:border-teal-500/60"
        >
          Overview
        </Link>
        <Link
          href="/app"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal-500 px-5 text-sm font-medium text-graphite-950 hover:bg-teal-400"
        >
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
