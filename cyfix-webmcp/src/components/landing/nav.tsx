import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-graphite-800/80 bg-graphite-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-graphite-500 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="#security" className="hover:text-white">
            Security rules
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/app?demo=1">
            <Button variant="secondary" size="sm">
              Try Demo
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
