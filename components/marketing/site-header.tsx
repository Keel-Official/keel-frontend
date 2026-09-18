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

/**
 * The instrument bar. It states what this is and what data is on screen before the
 * page says anything else, so a recorded sample cannot be mistaken for a live feed
 * by a reader who only glances at the top of the window.
 */
export function Masthead() {
  return (
    <div className="masthead">
      <div className="container">
        <span className="masthead-left">
          <strong>KEEL</strong> · liquidity instrument · Stellar
        </span>
        <span className="masthead-right">
          <i aria-hidden="true" />
          read-only · sample data
        </span>
      </div>
    </div>
  );
}

const links = [
  { href: '#markets', label: 'markets' },
  { href: '#engine', label: 'method' },
  { href: '#risk', label: 'finding' },
  { href: '#case-study', label: 'case' },
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
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
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
