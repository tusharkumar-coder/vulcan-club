import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CursorGlow } from "@/components/cursor-glow";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "Vulcan Club — Build together", template: "%s | Vulcan Club" },
  description:
    "The developer community at Mirai School of Technology. Learn new skills, solve problems, and build useful things together.",
  openGraph: {
    type: "website",
    siteName: "Vulcan Club",
    title: "Vulcan Club — Build together",
    description: "A community of problem solvers, builders, and open-source enthusiasts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vulcan Club",
    description: "Build together. Grow together.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080d18", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-wrap">
          <CursorGlow />
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <div className="site-particle-rain" aria-hidden="true">
            {Array.from({ length: 24 }, (_, index) => (
              <span
                key={index}
                style={
                  {
                    left: `${(index * 41 + 9) % 100}%`,
                    height: `${24 + ((index * 13) % 34)}px`,
                    animationDuration: `${12 + ((index * 5) % 7)}s`,
                    animationDelay: `-${(index * 5 + 3) % 18}s`,
                    "--rise-drift": `${((index * 17) % 37) - 18}px`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
