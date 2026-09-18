'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';

import {
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type Theme,
} from '@/lib/keel/design/theme';
import { cn } from '@/lib/keel/utils';

/**
 * Switches between the two validated palettes.
 *
 * Dark is the product's surface and is what the server renders; this exists so that a
 * reader who needs the light one — a bright room, a projector, a printed review — can
 * have it without losing the page. Both palettes were selected against their own
 * surface and both pass `scripts/check-token-contrast.mjs`, so neither is a degraded
 * copy of the other.
 *
 * The cookie and the reasoning behind it are in `lib/keel/design/theme.ts`, which both
 * this control and the server layout import.
 *
 * WHY THIS IS THE ONE PIECE OF READER STATE NOT IN THE URL. Everything else a reader
 * chooses — band, flag, search, sort, which asset is open — is a query parameter,
 * because a view a reviewer is looking at has to be something they can send to someone
 * else. A theme is the opposite kind of choice: it belongs to the reader rather than to
 * the view, and putting it in the query string would paste a personal preference into
 * every shared link.
 *
 * The applied theme is read from the document rather than mirrored into React state.
 * The inline script has already set it before React runs, so the document element is
 * the source of truth and a second copy could only ever disagree with it.
 * `useSyncExternalStore` is how a component subscribes to something outside React: it
 * renders the server snapshot during hydration — null, because the server cannot know
 * what is in a reader's storage — and re-renders with the real one immediately after,
 * so the button never announces the wrong state to a screen reader.
 */

/** Subscribers to the applied theme. Only this module changes it, so this is the set. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function appliedTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/** Rendered before the client knows anything, so the button waits rather than guesses. */
function serverTheme(): null {
  return null;
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, appliedTheme, serverTheme);

  function choose(next: Theme) {
    const root = document.documentElement;

    // Transitions off for the swap. Several controls animate their colours for hover
    // feedback, and a theme change makes every one of them interpolate between the two
    // palettes for the length of that transition. The in-between values belong to
    // neither palette and are not validated by anything: an axe scan run during the
    // swap caught a tab at 4.44:1 on a colour that measures 5.24:1 once it settles.
    // Nobody should be reading a page mid-swap, but "briefly below AA" is not a state
    // to ship on purpose when suppressing it costs two frames.
    root.dataset.themeSwitching = '';

    // Applied here rather than left to a reload: the palette is pure CSS variables, so
    // flipping the attribute repaints instantly, and the cookie only has to be right
    // for the NEXT request. Dark is the default and is expressed by the ABSENCE of the
    // attribute, which keeps the stylesheet's `:root` the dark case rather than a
    // third state.
    if (next === 'dark') delete root.dataset.theme;
    else root.dataset.theme = 'light';

    // Two frames: one for the new colours to be applied, one for them to paint. A
    // single frame can still land inside the same style recalculation.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        delete root.dataset.themeSwitching;
      });
    });

    // `SameSite=Lax` because nothing here needs to travel on a cross-site request. It
    // is a display preference, carries nothing about the reader, and is not a session.
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;

    for (const listener of listeners) listener();
  }

  if (theme === null) {
    // A placeholder of the button's own size, so the header does not jump on mount.
    return (
      <span
        aria-hidden="true"
        className={cn('inline-block size-9', className)}
      />
    );
  }

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      aria-label={`Switch to the ${next} theme`}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border border-[var(--keel-border-strong)]',
        'text-[var(--keel-muted)] transition-colors hover:border-[var(--keel-accent)] hover:text-[var(--keel-accent)]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--keel-accent)]',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}
