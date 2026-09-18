type ClassValue = string | false | null | undefined;

/**
 * Joins optional utility-class fragments without requiring a runtime helper package.
 * Dashboard class names are composed from strings and conditional strings only; keeping
 * this tiny helper local also makes the CSS surface resilient to package-manager
 * symlink resolution differences in development.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
