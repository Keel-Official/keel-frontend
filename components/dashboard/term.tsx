import { TERMS, type TermKey } from '@/lib/keel/format/glossary';
import { cn } from '@/lib/keel/utils';

/**
 * A label with the one sentence that explains it.
 *
 * Every piece of vocabulary this dashboard cannot avoid — band, executable depth, max
 * safe collateral, confidence, reachability — carries one of these. The sentence lives
 * in `lib/keel/format/glossary.ts` so that the wording is written once and cannot drift
 * between the overview, the drill-down, and the detail page.
 *
 * WHY A BUTTON AND NOT A `title` ATTRIBUTE. A native tooltip cannot be opened by touch,
 * cannot be reliably reached by keyboard, and is skipped by several screen readers. A
 * definition only a mouse user on a desktop can reach is not one the newcomer this page
 * is built for will ever see.
 *
 * WHY A BUTTON AND NOT `<details>`. A disclosure was the first build and it was wrong:
 * `<details>` is flow content, so it is invalid inside a `<p>`, a `<span>`, a `<th>` or
 * a heading — which is everywhere a term label actually appears. Browsers recover by
 * closing the paragraph early, the server and client trees then disagree, and React
 * discards and re-renders the subtree. Everything here is phrasing content, so it nests
 * wherever a word does.
 *
 * THE DEFINITION IS THE BUTTON'S OWN NAME, rather than a separate element referenced by
 * `aria-describedby`. A reference needs a unique id per instance, and these are server
 * components rendering the same term in several places on one page, so ids would either
 * collide or have to be threaded through from every call site. Putting the sentence in
 * the accessible name says the same thing with nothing to keep in sync, and leaves the
 * visible panel purely decorative.
 *
 * There is no JavaScript here and none is needed: the panel is revealed by `:hover` and
 * `:focus-within`, so it works on the server-rendered HTML exactly as it does after
 * hydration.
 */

export interface TermProps {
  /** Which entry in the glossary explains this label. */
  name: TermKey;
  /**
   * The label itself. Defaults to the glossary's own term, which is what most callers
   * want; a column heading that has to read "Depth, 5% buy" passes its own.
   */
  children?: React.ReactNode;
  /** Anchors the panel to the right edge, for a label near the end of a row. */
  align?: 'start' | 'end';
  className?: string;
}

export function Term({
  name,
  children,
  align = 'start',
  className,
}: TermProps) {
  return (
    <span className={cn('keel-term', className)}>
      <span>{children ?? TERMS[name].term}</span>
      <TermMark name={name} align={align} />
    </span>
  );
}

/**
 * The same explanation without a visible label, for a place that already has one — a
 * chart legend, or a figure whose name is set in its own element.
 */
export function TermMark({
  name,
  align = 'start',
  className,
}: {
  name: TermKey;
  align?: 'start' | 'end';
  className?: string;
}) {
  const { term, definition } = TERMS[name];

  return (
    <span className={cn('keel-term-disclosure', className)}>
      <button
        type="button"
        className="keel-term-button"
        // The whole definition, because this control IS the definition. A name of
        // "question mark" would announce the affordance and withhold the content.
        aria-label={`${term}. ${definition}`}
      >
        <span aria-hidden="true">?</span>
      </button>
      {/* Decorative: the sentence is already on the button above, and announcing it
          twice would make every term read twice. */}
      <span aria-hidden="true" className="keel-term-panel" data-align={align}>
        <strong>{term}</strong>
        {definition}
      </span>
    </span>
  );
}
