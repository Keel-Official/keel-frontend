/**
 * The Keel mark: a `k` monogram cut entirely at 45 degrees, with an amber
 * counter that reads as a depth pointer.
 *
 * The teal strokes take `currentColor` rather than a brand token so the mark
 * survives an inverted surface — the lockup's colour is set once on the element
 * around it (`--brand` here, `--keel-logo` on the dashboard), and a dark theme
 * overrides that rather than the mark. The counter keeps the literal brand amber,
 * which holds its contrast on light and dark alike, so it is the one fixed colour
 * here.
 *
 * The viewBox is 64x100, so callers set a height and leave the width to the
 * aspect ratio; a square box would letterbox the mark.
 */
export function KeelMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M0 0h13.2v100H0z M39.4 19.9H64L40.2 43.7v-9.2L13.2 61.5V46.1z M18.6 100V65.1l13.3-13.3L64 83.9H46.1L31.5 69.3V100z"
      />
      <path fill="var(--brand-amber, #e49f37)" d="M41 51.9 59.8 33.1v37.6z" />
    </svg>
  );
}
