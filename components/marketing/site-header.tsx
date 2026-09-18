'use client';

import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { dashboardCopy, dashboardLinks } from '../../lib/dashboard';

export function BrandMark() {
  return (
    <span className="brand">
      <svg aria-hidden="true" viewBox="0 0 32 32" fill="none">
        <path d="M6 6h7v9L23 6h9L18 19l12 7H17L6 19V6Z" fill="currentColor" />
        <path d="M6 23v7h7v-3l-7-4Z" fill="var(--accent)" />
      </svg>
      <span>keel</span>
    </span>
  );
}

const links = [
  { href: '#markets', label: 'Markets' },
  { href: '#metrics', label: 'Product' },
  { href: '#case-study', label: 'Case study' },
];

export function SiteHeader() {
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
          aria-current="page"
        >
          <BrandMark />
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="button button-small header-action"
          href={dashboardLinks.assets}
        >
          {dashboardCopy.nav} <ArrowUpRight size={16} />
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
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
            <ArrowUpRight size={16} />
          </a>
        ))}
        <a href={dashboardLinks.assets} onClick={() => setOpen(false)}>
          {dashboardCopy.nav}
          <ArrowUpRight size={16} />
        </a>
      </nav>
    </header>
  );
}
