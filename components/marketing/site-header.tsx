import Link from "next/link";

function BrandMark() {
  return (
    <svg
      aria-hidden="true"
      className="brand-mark"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="1" width="28" height="28" rx="7" fill="var(--keel-brand-deep)" />
      <path d="M8 20.5L14.4 8H17.2L10.8 20.5H8Z" fill="var(--keel-accent)" />
      <path d="M14.2 20.5L20.6 8H23.4L17 20.5H14.2Z" fill="var(--keel-white)" />
    </svg>
  );
}

const navItems = [
  { href: "#product", label: "Product" },
  { href: "/assets", label: "Assets" },
  { href: "/case-study/ustry", label: "Case study" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteHeader() {
  return (
    <header className="site-header" aria-label="Site header">
      <div className="header-inner">
        <Link className="brand-lockup" href="/" aria-label="Keel home">
          <BrandMark />
          <span>Keel</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="button button-primary header-cta" href="/assets">
            Explore assets <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <details className="mobile-nav">
          <summary className="mobile-nav-summary">
            <span className="sr-only">Open navigation</span>
            <span className="menu-glyph" aria-hidden="true" />
          </summary>
          <nav className="mobile-nav-panel" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="button button-primary" href="/assets">
              Explore assets <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
