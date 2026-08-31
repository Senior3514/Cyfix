import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-graphite-800/80">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Logo size={24} />
        <p className="text-xs text-graphite-500">
          MIT licensed · Built for the OpenAI WebMCP Challenge
        </p>
        <Link href="/app?demo=1" className="text-xs text-teal-400 hover:text-teal-300">
          Try the demo →
        </Link>
      </div>
    </footer>
  );
}
