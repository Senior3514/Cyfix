import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// next/font self-hosts these at build time — no request ever leaves for a font
// CDN, which keeps the CSP at font-src 'self' and costs no round trip.
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});
import { WebMcpProvider } from "@/components/webmcp-provider";

// A nonce is generated per request, so the HTML carrying it cannot be a build
// time artifact. Cyfix renders no per-user data, so the only cost is rendering
// on request instead of serving prebuilt HTML.
export const dynamic = "force-dynamic";

const DESCRIPTION =
  "Cyfix lets a human and an AI agent inspect and improve an authorized website together: a passive security scan, plain-language findings, remediations, and seven WebMCP tools an agent can call directly from the page.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cyfix.vercel.app"),
  title: "Cyfix — Fix web security with humans and agents together",
  description: DESCRIPTION,
  applicationName: "Cyfix",
  keywords: [
    "WebMCP",
    "document.modelContext",
    "AI agents",
    "web security",
    "security headers",
    "passive scanning",
    "human in the loop",
  ],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: "https://cyfix.vercel.app",
    siteName: "Cyfix",
    title: "Cyfix — Fix web security with humans and agents together",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyfix — Fix web security with humans and agents together",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Deliberately not capping maximumScale — pinch-zoom stays available.
  themeColor: "#0a0e12",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen font-sans antialiased">
        <WebMcpProvider />
        {children}
      </body>
    </html>
  );
}
