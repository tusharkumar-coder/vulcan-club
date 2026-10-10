import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const pages = [
  ["About", "/about"],
  ["Domains", "/domains"],
  ["Events", "/events"],
  ["Projects", "/projects"],
  ["Team", "/team"],
] as const;
const domains = [
  "Competitive programming",
  "Web development",
  "AI & machine learning",
  "Open source",
];

export function SiteFooter() {
  const socials = [
    ["GitHub", process.env.NEXT_PUBLIC_GITHUB_URL],
    ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
    ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  const email = process.env.NEXT_PUBLIC_CLUB_EMAIL;
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden="true" />
              <span>
                <span className="brand-name">VULCAN</span>
                <span className="brand-sub">Mirai School of Technology</span>
              </span>
            </Link>
            <p className="muted" style={{ maxWidth: 270, fontSize: 12, marginTop: 18 }}>
              A place to think deeply, build together, and make the next idea real.
            </p>
            <p className="micro" style={{ marginTop: 24 }}>
              Mirai School of Technology
            </p>
          </div>
          <div>
            <p className="footer-title">Explore</p>
            <div className="footer-links">
              {pages.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="footer-title">Build skills</p>
            <div className="footer-links">
              {domains.map((domain) => (
                <Link key={domain} href="/domains">
                  {domain}
                </Link>
              ))}
              <Link href="/resources">Resource library</Link>
            </div>
          </div>
          <div>
            <p className="footer-title">Connect</p>
            <div className="footer-links">
              {email && <a href={`mailto:${email}`}>{email}</a>}
              {socials.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer">
                  {label} <ArrowUpRight size={11} style={{ display: "inline" }} />
                </a>
              ))}
              <Link href="/contact">Contact the club</Link>
              <Link href="/privacy">Privacy notice</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Vulcan Club · Mirai School of Technology</span>
          <span className="mono">
            Built with curiosity <span style={{ color: "var(--orange)" }}>✳</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
