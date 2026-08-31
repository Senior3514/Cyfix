import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cyfix — Fix web security with humans and agents together",
  description:
    "Cyfix lets a human and an AI agent inspect and improve an authorized website together: a passive security scan, plain-language findings, remediations, and WebMCP tools an agent can call directly from the page.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
