import type { CSSProperties } from 'react';

/*
 * What the engine does with each input, drawn schematically. None of these carry
 * figures: they show the operation, never a reading, so no number here can be
 * mistaken for an engine result.
 */

export type EngineReadingKind = 'orderbook' | 'pool' | 'trades';

const delay = (index: number) => ({ '--i': index }) as CSSProperties;

/* SDEX: asks are absorbed level by level until the target price is reached. */
function OrderbookWalk() {
  const asks = [
    { y: 40, width: 64 },
    { y: 30, width: 96 },
    { y: 20, width: 52 },
    { y: 10, width: 120 },
  ];
  const bids = [
    { y: 56, width: 80 },
    { y: 66, width: 60 },
    { y: 76, width: 108 },
  ];
  return (
    <>
      {bids.map((bid) => (
        <rect
          key={bid.y}
          className="ev-track"
          x="16"
          y={bid.y}
          width={bid.width}
          height="6"
          rx="1.5"
        />
      ))}
      {asks.map((ask) => (
        <rect
          key={ask.y}
          className="ev-track"
          x="16"
          y={ask.y}
          width={ask.width}
          height="6"
          rx="1.5"
        />
      ))}
      {asks.slice(0, 3).map((ask, index) => (
        <rect
          key={ask.y}
          className="ev-absorb"
          style={delay(index)}
          x="16"
          y={ask.y}
          width={ask.width}
          height="6"
          rx="1.5"
        />
      ))}
      <line className="ev-mid" x1="12" x2="178" y1="51" y2="51" />
      <line className="ev-target" x1="12" x2="178" y1="18" y2="18" />
      <rect className="ev-walk" x="183" y="18" width="2" height="33" />
      <circle className="ev-dot" cx="184" cy="51" r="2.5" />
    </>
  );
}

/* AMM pools: a swap moves along the pool curve, and the reserves shift with it. */
const curveX = (a: number) => 20 + a * 34;
const curveY = (a: number) => 84 - 25 / a;
function curve(from: number, to: number, steps = 24) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const a = from + ((to - from) * index) / steps;
    return `${index ? 'L' : 'M'}${curveX(a).toFixed(1)} ${curveY(a).toFixed(1)}`;
  }).join('');
}
const SWAP = { from: 0.8, to: 1.6 };
const RESERVE = 28;

function PoolCurve() {
  const bars = [
    { x: 146, before: SWAP.from * RESERVE, after: SWAP.to * RESERVE },
    { x: 170, before: RESERVE / SWAP.from, after: RESERVE / SWAP.to },
  ];
  return (
    <>
      <path className="ev-axis" d="M20 8V84H128" />
      <path className="ev-curve" d={curve(0.35, 2.8)} />
      <path className="ev-trace" d={curve(SWAP.from, SWAP.to)} pathLength={1} />
      <circle
        className="ev-start"
        cx={curveX(SWAP.from)}
        cy={curveY(SWAP.from)}
        r="2.5"
      />
      <circle
        className="ev-dot ev-land"
        cx={curveX(SWAP.to)}
        cy={curveY(SWAP.to)}
        r="3"
      />
      {bars.map((bar) => (
        <g key={bar.x}>
          <rect
            className="ev-ghost"
            x={bar.x}
            y={84 - bar.before}
            width="16"
            height={bar.before}
            rx="1.5"
          />
          <rect
            className="ev-reserve"
            style={{ '--from': bar.before / bar.after } as CSSProperties}
            x={bar.x}
            y={84 - bar.after}
            width="16"
            height={bar.after}
            rx="1.5"
          />
        </g>
      ))}
      <line className="ev-axis" x1="140" x2="192" y1="84" y2="84" />
    </>
  );
}

/* Market observations: trades land in the window, non-genuine prints are set
   aside, and what is left adds up to the genuine volume. */
const PRINTS = [18, 30, 12, 26, 44, 20, 36, 58, 24, 32, 52, 28].map(
  (height, index) => ({
    x: 20 + index * 15,
    height,
    genuine: index !== 7 && index !== 10,
  }),
);
const WINDOW_X = 58;

function TradeWindow() {
  return (
    <>
      <rect
        className="ev-window"
        x={WINDOW_X}
        y="6"
        width={190 - WINDOW_X}
        height="72"
        rx="3"
      />
      <line className="ev-mid" x1={WINDOW_X} x2={WINDOW_X} y1="6" y2="78" />
      <line className="ev-axis" x1="12" x2="190" y1="78" y2="78" />
      {PRINTS.map((print, index) => (
        <g
          key={print.x}
          style={delay(index)}
          className={
            !print.genuine
              ? 'ev-print ev-rejected'
              : print.x < WINDOW_X
                ? 'ev-print ev-outside'
                : 'ev-print'
          }
        >
          <line x1={print.x} x2={print.x} y1="78" y2={78 - print.height} />
          <circle cx={print.x} cy={78 - print.height} r="2.5" />
        </g>
      ))}
      <rect
        className="ev-track"
        x={WINDOW_X}
        y="86"
        width={190 - WINDOW_X}
        height="4"
        rx="2"
      />
      <rect
        className="ev-sum"
        x={WINDOW_X}
        y="86"
        width={190 - WINDOW_X}
        height="4"
        rx="2"
      />
    </>
  );
}

export function EngineReading({
  kind,
  caption,
}: {
  kind: EngineReadingKind;
  caption: string;
}) {
  return (
    <div className="engine-reading" data-kind={kind} aria-hidden="true">
      <svg viewBox="0 0 200 96" focusable="false">
        {kind === 'orderbook' ? (
          <OrderbookWalk />
        ) : kind === 'pool' ? (
          <PoolCurve />
        ) : (
          <TradeWindow />
        )}
      </svg>
      <span className="engine-reading-caption">{caption}</span>
    </div>
  );
}
