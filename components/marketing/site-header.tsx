'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { KeelMark } from '../brand/keel-mark';
import { dashboardCopy, dashboardLinks } from '../../lib/dashboard';

export function BrandMark() {
  return (
    <span className="brand">
      <KeelMark />
      <span>keel</span>
    </span>
  );
}

const links = [
  { href: '#markets', label: 'markets' },
  { href: '#engine', label: 'method' },
  { href: '#risk', label: 'finding' },
  { href: '#case-study', label: 'case' },
];

/**
 * The section links are anchors on the landing page. Any other page passes `/` as
 * `sectionBase`, so they lead back to the landing section rather than to an anchor
 * that page does not have.
 */
export function SiteHeader({ sectionBase = '' }: { sectionBase?: '' | '/' }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link
          href="/"
          className="brand-link"
          aria-label="Keel home"
          aria-current={sectionBase === '' ? 'page' : undefined}
        >
          <BrandMark />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <a href={sectionBase + link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="button button-small header-action"
          href={dashboardLinks.assets}
        >
          {dashboardCopy.nav}
        </a>
        <button
          ref={button}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map((link) => (
          <a
            key={link.href}
            href={sectionBase + link.href}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <a href={dashboardLinks.assets} onClick={() => setOpen(false)}>
          {dashboardCopy.nav}
        </a>
      </nav>
    </header>
  );
}
