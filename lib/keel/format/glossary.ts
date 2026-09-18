/**
 * What every term and every flag on the dashboard means, in one sentence each.
 *
 * This closes the three TODO-COPY markers that stood in `flags.ts`, `flag-groups.tsx`
 * and `value.tsx`: until now the overview printed `THIN_DEPTH_5PCT` at a reader and
 * left them to work it out.
 *
 * TWO RULES HOLD EVERY STRING IN THIS FILE.
 *
 * 1. No threshold is written here. `GET /methodology` serves nineteen of them and they
 *    move without a major version bump, so a sentence saying "below 50,000 USDC" would
 *    be a second source of truth that goes stale silently. Each flag names the
 *    threshold KEY it is judged against instead, and a surface that wants the number
 *    reads it from the served methodology and interpolates it. `thresholdKey` is null
 *    where the engine exposes no single key for the check.
 *
 * 2. No flag is given a severity. `band` is the worst LEVEL that fired, but the API
 *    does not publish which level each flag sits at, so ranking them here would invent
 *    a methodology statement. The band is the engine's answer; a flag list is evidence
 *    for it, not a scoring input.
 *
 * The plain label leads and the enum value follows it as the secondary reading, so a
 * newcomer can read the row and an engineer can still grep the code they will see in
 * the API response.
 */

import type { Flag } from './flags';

export interface FlagCopy {
  /** What a reader sees first. Sentence case, no jargon, no threshold. */
  readonly label: string;
  /** What the check being triggered implies, for someone setting a collateral limit. */
  readonly meaning: string;
  /** The key under `thresholds` at `GET /methodology` this check is judged against. */
  readonly thresholdKey: string | null;
}

/**
 * The twelve-value `Flag` enum, in the order the contract declares it. `satisfies`
 * keeps this exhaustive: adding a flag to the contract and regenerating the schema
 * fails the build here until its sentence is written.
 */
export const FLAG_COPY = {
  NO_EXECUTABLE_PRICE: {
    label: 'No executable price',
    meaning:
      'Neither the order book nor any pool could produce a price, so there is nothing to lend against and every figure derived from a price is missing rather than low.',
    thresholdKey: null,
  },
  ZERO_DEPTH_2PCT: {
    label: 'Nothing tradable within 2%',
    meaning:
      'No volume at all can be absorbed before the price moves two per cent, so even a small position cannot be entered or unwound at anything near the quoted price.',
    thresholdKey: null,
  },
  MANIPULATION_CHEAP: {
    label: 'Cheap to move the price',
    meaning:
      'Pushing the price to the critical target costs less than the methodology allows for, so an attacker can move the reference an oracle reads without spending much.',
    thresholdKey: 'manipulationCheapAbsolute',
  },
  MANIPULATION_RATIO_LOW: {
    label: 'Cheap next to real trading',
    meaning:
      'The cost of moving the price is small relative to the genuine volume it would have to hide inside, so an attack would not stand out as unusual activity.',
    thresholdKey: 'manipulationRatioLowPct',
  },
  NO_GENUINE_TRADE_30D: {
    label: 'No genuine trade in 30 days',
    meaning:
      'Nothing survived the genuine-trade filter for a month, so the quoted price reflects posted offers rather than anyone actually transacting.',
    thresholdKey: 'genuineTradeStaleDays',
  },
  NO_GENUINE_TRADE_7D: {
    label: 'No genuine trade in 7 days',
    meaning:
      'Nothing survived the genuine-trade filter for a week, which is the earlier warning that trading has stopped.',
    thresholdKey: 'genuineTradeWarnDays',
  },
  HOLDER_CONCENTRATION_EXTREME: {
    label: 'One holder owns most of it',
    meaning:
      'A single account holds a share of supply past the extreme threshold, so that one account can decide what the market does.',
    thresholdKey: 'holderTop1ExtremePct',
  },
  HOLDER_CONCENTRATION_HIGH: {
    label: 'Supply is concentrated',
    meaning:
      'The largest ten accounts hold a share of supply past the high threshold, so the depth on screen depends on a small number of parties continuing to behave as they have.',
    thresholdKey: 'holderTop10HighPct',
  },
  THIN_DEPTH_5PCT: {
    label: 'Thin depth at 5%',
    meaning:
      'Less volume can be absorbed before a five per cent move than the methodology treats as a usable market, so a position of ordinary size moves the price itself.',
    thresholdKey: 'thinDepth5PctAbsolute',
  },
  WASH_TRADE_SUSPECTED: {
    label: 'Volume may be wash traded',
    meaning:
      'Enough reported volume was excluded as self-dealing that the remaining trading is not a reliable measure of genuine interest.',
    thresholdKey: 'washTradeSuspectedPct',
  },
  SPREAD_EXTREME: {
    label: 'Extreme spread',
    meaning:
      'The gap between the best bid and the best ask is past the threshold at which the engine stops treating the mid price as meaningful, so the depth ladder derived from it describes a market that is not there.',
    thresholdKey: 'spreadExtremePct',
  },
  PRICE_SOURCE_CONFLICT: {
    label: 'Price sources disagree',
    meaning:
      'The order book mid and the pool spot price differ by more than the methodology allows, so the two venues are quoting different markets and the pool reading was preferred.',
    thresholdKey: 'priceDivergencePct',
  },
} as const satisfies Record<Flag, FlagCopy>;

export function flagCopy(flag: Flag): FlagCopy {
  return FLAG_COPY[flag];
}

/**
 * Definitions for the terms the dashboard cannot avoid using.
 *
 * Each is one sentence, written for someone who has never traded. They are attached to
 * the label they explain rather than collected on a help page, because a reader meeting
 * "executable depth" for the first time is looking at a column heading, not at a
 * glossary.
 */
export interface TermCopy {
  /** The heading of the explanation. Usually the term as it appears on screen. */
  readonly term: string;
  readonly definition: string;
}

export const TERMS = {
  band: {
    term: 'Risk band',
    definition:
      'Keel’s overall verdict on an asset — low, medium, high or critical. It is the worst level of check that fired, not an average or a score.',
  },
  confidence: {
    term: 'Confidence',
    definition:
      'Whether the band rests on a complete check. Full means every severe check could be evaluated; partial means at least one could not, so the band is a floor and the real risk may be worse.',
  },
  partial: {
    term: 'Partial confidence',
    definition:
      'At least one high-severity check could not be evaluated, so the band shown is the best case. The real risk can only be worse than this, never better.',
  },
  depth: {
    term: 'Executable depth',
    definition:
      'How much value can actually be traded before the price moves by a given amount. A price with no depth behind it is a quote nobody can fill.',
  },
  depthBuySide: {
    term: 'Buy-side depth',
    definition:
      'How much can be bought before the price rises past the limit. This is the side an attacker uses to push an oracle up.',
  },
  depthSellSide: {
    term: 'Sell-side depth',
    definition:
      'How much can be sold before the price falls past the limit. This is the side that decides whether collateral can be liquidated in time.',
  },
  collateral: {
    term: 'Max safe collateral',
    definition:
      'The largest position this market could support without the act of unwinding it moving the price against you. It is the lower of a liquidation limit and a manipulation limit.',
  },
  flags: {
    term: 'Triggered flag',
    definition:
      'A named check that fired on this asset. Flags are reported one by one so you can apply your own policy instead of only trusting the band.',
  },
  unevaluated: {
    term: 'Not evaluated',
    definition:
      'A check that could not run because the data it needs was unavailable. It is not a check that came back clear, and it is why an asset can show no triggered flags and still not be safe.',
  },
  manipulation: {
    term: 'Manipulation cost',
    definition:
      'What it would cost someone to push the price to a chosen target by buying up everything offered below it. A low cost means the price is cheap to fake.',
  },
  reachable: {
    term: 'Reachability',
    definition:
      'Whether the target price can actually be reached by buying step by step. When it cannot, the cost shown is where the market ran out, not the price of getting there.',
  },
  venues: {
    term: 'SDEX and AMM',
    definition:
      'The two places depth comes from on Stellar: SDEX is the order book of posted offers, AMM is the automated pools. Keel measures both and reports how much each contributed.',
  },
  priceSource: {
    term: 'Price source',
    definition:
      'Where the reference price came from — the order book, a pool, or nowhere at all. “None” is a real result and means the asset has no executable price.',
  },
  spread: {
    term: 'Spread',
    definition:
      'The gap between the best price to buy and the best price to sell. A very wide gap means the midpoint between them describes no real market.',
  },
  ledger: {
    term: 'Ledger',
    definition:
      'The Stellar ledger these figures were computed at. Stellar closes one roughly every five seconds, so it is the exact moment this reading describes.',
  },
  staleness: {
    term: 'Age',
    definition:
      'How many seconds have passed since the engine computed these figures. Markets move; this says how old the answer is.',
  },
  methodology: {
    term: 'Methodology version',
    definition:
      'The version of the definitions and thresholds behind every figure here. It is served by the engine, never fixed in this dashboard.',
  },
  quote: {
    term: 'Quote asset',
    definition:
      'The unit every value on the row is measured in. Figures are never silently converted to dollars, so the quote code always travels with the number.',
  },
} as const satisfies Record<string, TermCopy>;

export type TermKey = keyof typeof TERMS;
