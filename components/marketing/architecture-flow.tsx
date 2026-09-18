'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Activity, Droplets, ListOrdered, type LucideIcon } from 'lucide-react';
import { EngineReading, type EngineReadingKind } from './engine-reading';

type Source = {
  name: string;
  reads: string;
  icon: LucideIcon;
  reading: EngineReadingKind;
  /** What the engine does with this input, in the terms the methodology uses. */
  does: string;
  /** The response field each output takes from this input, in `OUTPUTS` order;
      null where this input does not reach that output. */
  feeds: (string | null)[];
};

const SOURCES: Source[] = [
  {
    name: 'SDEX',
    reads: 'Orderbook liquidity',
    icon: ListOrdered,
    reading: 'orderbook',
    does: 'Absorbs asks to the target',
    feeds: [
      'fromSdex',
      'orderbook-only',
      'manipulation term',
      'checks SPREAD_EXTREME',
    ],
  },
  {
    name: 'AMM pools',
    reads: 'Pool reserves',
    icon: Droplets,
    reading: 'pool',
    does: 'Swaps along the pool curve',
    feeds: [
      'fromAmm',
      'combined',
      'liquidation term',
      'checks PRICE_SOURCE_CONFLICT',
    ],
  },
  {
    name: 'Market observations',
    reads: 'Trades & supporting data',
    icon: Activity,
    reading: 'trades',
    does: 'Keeps genuine trades in the window',
    feeds: [null, 'vs genuine volume', null, 'checks WASH_TRADE_SUSPECTED'],
  },
];

const OUTPUTS = [
  'Executable depth',
  'Manipulation cost',
  'Safe collateral',
  'Flags & confidence',
];

/* Each source is drawn twice so a card can leave one edge of the rail while its
   twin enters the other; the wrap happens off-screen, never across the slot. */
const CARDS = [...SOURCES, ...SOURCES];
const STEP_MS = 4200;

/** Which rail position a card sits in, from -2 (gone) through 0 (in the slot) to 3. */
function slotOf(card: number, active: number) {
  const offset =
    (((card - active) % CARDS.length) + CARDS.length) % CARDS.length;
  return offset > CARDS.length / 2 ? offset - CARDS.length : offset;
}

export function ArchitectureFlow() {
  const [active, setActive] = useState(0);
  const flowRef = useRef<HTMLDivElement>(null);
  const source = SOURCES[active % SOURCES.length];
  const SourceIcon = source.icon;

  useEffect(() => {
    const flow = flowRef.current;
    if (!flow || !window.IntersectionObserver) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');

    let visible = false;
    let hovered = false;
    let timer: number | undefined;
    const sync = () => {
      const run =
        visible && !hovered && !document.hidden && !preference.matches;
      if (run && timer === undefined) {
        timer = window.setInterval(
          () => setActive((index) => (index + 1) % CARDS.length),
          STEP_MS,
        );
      } else if (!run && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.3 },
    );
    observer.observe(flow);
    const onEnter = () => {
      hovered = true;
      sync();
    };
    const onLeave = () => {
      hovered = false;
      sync();
    };
    flow.addEventListener('pointerenter', onEnter);
    flow.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', sync);
    preference.addEventListener('change', sync);
    return () => {
      observer.disconnect();
      if (timer !== undefined) window.clearInterval(timer);
      flow.removeEventListener('pointerenter', onEnter);
      flow.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', sync);
      preference.removeEventListener('change', sync);
    };
  }, []);

  return (
    <section
      className="section engine-section"
      id="engine"
      aria-labelledby="engine-title"
    >
      <div className="container">
        <h2 id="engine-title">From Stellar liquidity to risk calculations.</h2>
        <p className="intro">
          Keel combines orderbook offers and pool reserves, then calculates
          depth, price targets, and collateral limits.
        </p>
        <div
          ref={flowRef}
          className="architecture-flow"
          role="group"
          aria-label="Stellar market sources feed the Keel engine, producing depth, manipulation, collateral and flag outputs for dashboards, APIs and backtests"
        >
          <ul className="sr-only">
            {SOURCES.map((item) => (
              <li key={item.name}>
                Input: {item.name}, {item.reads}. The engine{' '}
                {item.does.toLowerCase()}, feeding{' '}
                {OUTPUTS.flatMap((output, index) =>
                  item.feeds[index]
                    ? [`${output.toLowerCase()} (${item.feeds[index]})`]
                    : [],
                ).join(', ')}
                .
              </li>
            ))}
          </ul>
          <div className="flow-sources" aria-hidden="true">
            <div className="flow-slot" />
            {CARDS.map((item, card) => {
              const slot = slotOf(card, active);
              return (
                <div
                  key={card}
                  className="flow-source"
                  data-current={slot === 0 || undefined}
                  data-hidden={Math.abs(slot) > 1 || undefined}
                  style={{ '--slot': slot } as CSSProperties}
                >
                  <span className="n-k">Input</span>
                  <strong>{item.name}</strong>
                </div>
              );
            })}
          </div>
          <div className="flow-link" aria-hidden="true">
            <i />
            <b key={active} />
          </div>
          <div className="flow-event" aria-hidden="true">
            <span key={active} className="flow-event-body">
              <span className="flow-event-icon">
                <SourceIcon size={16} strokeWidth={1.75} />
              </span>
              {source.reads}
            </span>
          </div>
          <div className="flow-link" aria-hidden="true">
            <i />
            <b key={active} />
          </div>
          <div className="engine-core node">
            <span className="n-k">Process</span>
            <EngineReading
              key={source.reading}
              kind={source.reading}
              caption={source.does}
            />
            <strong>Keel engine</strong>
            <small>Depth simulation &amp; risk rules</small>
          </div>
          <div className="flow-results">
            <b key={active} className="flow-stub-pulse" aria-hidden="true" />
            <ul className="flow-outputs">
              {OUTPUTS.map((output, index) => {
                const field = source.feeds[index];
                return (
                  <li
                    key={output}
                    data-reached={field ? true : undefined}
                    style={{ '--i': index } as CSSProperties}
                  >
                    {output}
                    <span
                      key={`field-${active}`}
                      className="flow-output-field"
                      aria-hidden="true"
                    >
                      {field ?? 'not from this input'}
                    </span>
                    {field ? (
                      <i
                        key={`arrival-${active}`}
                        className="flow-output-arrival"
                        aria-hidden="true"
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
