/**
 * The two palettes, and how a reader's choice between them travels.
 *
 * This is a plain module on purpose, with no directive of its own, imported by both the
 * server layout that reads the choice and the client control that writes it. These used
 * to live beside the toggle, which carries `'use client'`. Nothing observably broke, but
 * a constant that both sides depend on should not be reached through a module the
 * bundler treats as a client boundary: the cookie name is the contract between a writer
 * in the browser and a reader on the server, and a contract belongs where neither side
 * owns it.
 */

export type Theme = 'dark' | 'light';

/**
 * Where the choice is kept.
 *
 * A cookie rather than `localStorage`, because the SERVER has to know: the palette is
 * applied by an attribute on the html element, so it must be right in the first byte of
 * HTML. Storage is browser-only, which is why sites that use it need an inline script in
 * the head to re-apply the theme before paint — a script React warns about inside a
 * component, and one that still leaves a frame of the wrong colour if it is deferred.
 * A cookie travels with the request, so there is no flash to suppress and no script to
 * ship.
 */
export const THEME_COOKIE = 'keel-theme';

/** A year, so the choice outlives the session that made it. */
export const THEME_COOKIE_MAX_AGE = 31_536_000;

/**
 * Light is the served default, and only an explicit `dark` takes the attribute away.
 * The stylesheet is unchanged by that: `:root` still carries the dark set and light is
 * still reached by `data-theme="light"`, so the default is expressed by the PRESENCE of
 * the attribute rather than by re-deriving a palette. Absence stays the dark case, which
 * keeps it two states rather than three — a reader who has never chosen gets light, the
 * surface the marketing site hands them on the way in.
 */
export function themeAttribute(
  cookieValue: string | undefined,
): 'light' | undefined {
  return cookieValue === 'dark' ? undefined : 'light';
}
