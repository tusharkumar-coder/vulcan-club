import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "Vulcan Club — Build what’s next", template: "%s | Vulcan Club" },
  description:
    "The developer community at Mirai School of Technology. Think deeply, build together, and make the next idea real.",
  openGraph: {
    type: "website",
    siteName: "Vulcan Club",
    title: "Vulcan Club — Build what’s next",
    description: "A community of problem solvers, builders, and open-source enthusiasts.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vulcan Club",
    description: "We don't just code. We forge what's next.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080b12", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-wrap">
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
