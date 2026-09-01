import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-graphite-800/80 bg-graphite-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-graphite-500 lg:flex">
          <a href="#tools" className="hover:text-white">
            The 7 tools
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#security" className="hover:text-white">
            What it never does
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/app?demo=1">
            <Button variant="secondary" size="sm">
              Demo
            </Button>
          </Link>
          <Link href="/app">
            <Button size="sm">Launch App</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
