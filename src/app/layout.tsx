import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screenplayr — Turn YouTube Videos into Screenplays",
  description:
    "Transform any YouTube video into a professionally formatted movie screenplay. AI-powered screenplay generation for content creators, filmmakers, and screenwriters.",
};

function Navbar() {
  return (
    <nav className="border-b border-[var(--border)] sticky top-0 bg-[var(--background)]/95 backdrop-blur z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[var(--primary)]">
            Screenplayr
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a
            href="/convert"
            className="text-sm text-[var(--muted)] hover:text-white transition"
          >
            Convert
          </a>
          <a
            href="/pricing"
            className="text-sm text-[var(--muted)] hover:text-white transition"
          >
            Pricing
          </a>
          <a
            href="/my-scripts"
            className="text-sm text-[var(--muted)] hover:text-white transition"
          >
            My Scripts
          </a>
          <a
            href="/convert"
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-medium text-sm px-4 py-2 rounded-lg transition"
          >
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[var(--muted)]">
          &copy; 2026 Screenplayr. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm text-[var(--muted)]">
          <a href="/pricing" className="hover:text-white transition">
            Pricing
          </a>
          <span>English only (MVP)</span>
          <span>Max 2-min videos</span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
