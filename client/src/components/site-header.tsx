"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Home", "/"],
  ["Events", "/events"],
  ["Leaderboards", "/leaderboards"],
  ["Resources", "/resources"],
  ["Team", "/team"],
  ["Contact", "/contact"],
  ["Coding Practice", "/competitive-programming"],
] as const;

const isCurrentPage = (pathname: string, href: string) =>
  href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }
  return (
    <header className="header">
      <div className="shell header-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Vulcan Club home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <span className="brand-name">VULCAN</span>
            <span className="brand-sub">Mirai School of Technology</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrentPage(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link className="header-action" href="/join">
            Join Vulcan <span aria-hidden="true">↗</span>
          </Link>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={17} /> : <Menu size={17} />}
          <span className="micro">Menu</span>
        </button>
      </div>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrentPage(pathname, href) ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link className="header-action" href="/join" onClick={() => setOpen(false)}>
            Join Vulcan <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      )}
    </header>
  );
}
