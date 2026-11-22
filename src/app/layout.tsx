import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sadaa: AI Voice Receptionist",
  description:
    "An AI receptionist that answers every call, books appointments and takes messages for local businesses.",
  openGraph: {
    title: "Sadaa: AI Voice Receptionist",
    description:
      "An AI receptionist that answers every call, books appointments and takes messages for local businesses.",
  },
};

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Live demo", href: "#live-demo" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "FAQ", href: "#faq" },
  { label: "Pricing", href: "#pricing" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="font-display text-2xl font-semibold tracking-tight text-ink"
            >
              Sadaa
            </Link>

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-8 md:flex"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#live-demo"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
              >
                Try the live demo
              </a>
            </nav>

            <details className="group relative md:hidden">
              <summary
                aria-label="Toggle navigation menu"
                className="flex cursor-pointer list-none items-center justify-center rounded-md border border-ink/15 p-2 text-ink [&::-webkit-details-marker]:hidden"
              >
                <svg
                  className="h-5 w-5 group-open:hidden"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <svg
                  className="hidden h-5 w-5 group-open:block"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </summary>

              <nav
                aria-label="Mobile navigation"
                className="absolute right-0 mt-3 w-64 rounded-lg border border-ink/15 bg-paper p-4 shadow-lg"
              >
                <ul className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink/5"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-ink/10 pt-3">
                  <a
                    href="#live-demo"
                    className="flex w-full items-center justify-center whitespace-nowrap rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90"
                  >
                    Try the live demo
                  </a>
                </div>
              </nav>
            </details>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-ink/10 bg-paper">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <p>
              <span className="font-display text-base font-semibold text-ink">
                Sadaa
              </span>{" "}
              <span>Built by Muhammad Sarim</span>
            </p>
            <nav
              aria-label="Footer"
              className="flex flex-wrap items-center gap-5"
            >
              <a
                href="mailto:sarimarain99@gmail.com"
                className="transition-colors hover:text-ink"
              >
                Email
              </a>
              <a
                href="https://github.com/SarimArain99"
                className="transition-colors hover:text-ink"
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/muhammad-sarim-arain-b3795a2ba"
                className="transition-colors hover:text-ink"
              >
                LinkedIn
              </a>
            </nav>
            <p>&copy; {new Date().getFullYear()} Sadaa</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
