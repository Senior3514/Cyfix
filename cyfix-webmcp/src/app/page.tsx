import { LandingNav } from "@/components/landing/nav";
import { HandoffDiagram } from "@/components/landing/handoff-diagram";
import { ToolsShowcase } from "@/components/landing/tools-showcase";
import { Faq } from "@/components/landing/faq";
import { DemoVideo } from "@/components/landing/demo-video";
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
      <DemoVideo />
      <HandoffDiagram />
      <Features />
      <ToolsShowcase />
      <HowItWorks />
      <SecurityRules />
      <Faq />
      <Footer />
    </main>
  );
}
