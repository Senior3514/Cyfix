import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SecurityRules } from "@/components/landing/security-rules";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-graphite-950">
      <LandingNav />
      <Hero />
      <Features />
      <HowItWorks />
      <SecurityRules />
      <Footer />
    </main>
  );
}
