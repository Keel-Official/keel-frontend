// Generated from public/evidence by scripts/prepare-fixtures.mjs. Do not edit fixture values.
import type { components } from "../api/schema";

export const healthy: components["schemas"]["AssetRisk"] = {
  "asset": {
    "code": "USDC",
    "type": "credit_alphanum4",
    "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  "quote": {
    "code": "XLM",
    "type": "native",
    "issuer": null
  },
  "ledgerSeq": 61234567,
  "ledgerClosedAt": "2026-08-19T04:12:31Z",
  "computedAt": "2026-08-19T04:15:02Z",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "horizon",
  "midPrice": "2.8419300",
  "priceSource": "book",
  "poolSpotPrice": "2.8390000",
  "priceDivergencePct": "0.1030000",
  "spreadPct": "0.0844000",
  "depth": [
    {
      "delta": 0.02,
      "buySide": "184220.4183100",
      "sellSide": "176905.2210400",
      "fromSdex": "142880.9910200",
      "fromAmm": "41339.4272900"
    },
    {
      "delta": 0.05,
      "buySide": "441038.9920700",
      "sellSide": "428771.0044300",
      "fromSdex": "337920.1180600",
      "fromAmm": "103118.8740100"
    },
    {
      "delta": 0.1,
      "buySide": "852119.7714000",
      "sellSide": "839004.5512800",
      "fromSdex": "648221.9014000",
      "fromAmm": "203897.8700000"
    }
  ],
  "manipulationCostCombined": [
    {
      "delta": 0.5,
      "targetPrice": "4.2628950",
      "cost": "3910442.1180000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "5.6838600",
      "cost": "8422018.7710000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "31.2612300",
      "cost": "48210559.4400000",
      "reachable": true
    },
    {
      "delta": 100,
      "targetPrice": "287.0349300",
      "cost": "61044180.2200000",
      "reachable": true
    }
  ],
  "manipulationCostOrderbookOnly": [
    {
      "delta": 0.5,
      "targetPrice": "4.2628950",
      "cost": "3910442.1180000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "5.6838600",
      "cost": "8422018.7710000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "31.2612300",
      "cost": "48210559.4400000",
      "reachable": true
    },
    {
      "delta": 100,
      "targetPrice": "287.0349300",
      "cost": "61044180.2200000",
      "reachable": false
    }
  ],
  "maxReachablePrice": null,
  "costToMaxReachablePrice": null,
  "oracleResistance": {
    "criticalDelta": 0.5,
    "manipulationCost": "3910442.1180000",
    "reachable": true,
    "genuineVolume": "184402.9100000",
    "windowSeconds": 900,
    "ratio": "21.2060000",
    "totalAttackCost": "4094845.0280000"
  },
  "maxSafeCollateral": "419502.2756400",
  "maxSafeCollateralLiquidation": "419502.2756400",
  "maxSafeCollateralManipulation": "512300.0000000",
  "holderTop1Pct": "11.4200000",
  "holderTop10Pct": "38.9100000",
  "holderHhi": "0.0412000",
  "volumeToSupply": {
    "d1": "0.0184000",
    "d7": "0.1102000",
    "d30": "0.4471000"
  },
  "lastGenuineTrade": {
    "ledgerSeq": 61234559,
    "at": "2026-08-19T04:11:47Z"
  },
  "tradesExcludedPct": "2.1000000",
  "flags": [],
  "unevaluatedFlags": [],
  "band": "LOW",
  "bandConfidence": "full",
  "warnings": [
    "maxReachablePrice and costToMaxReachablePrice are null because an active pool is present: under a constant product curve the price tends to infinity as the base reserve tends to zero, so every target is reachable and a highest price has no meaning"
  ]
};

export const poolOnly: components["schemas"]["AssetRisk"] = {
  "asset": {
    "code": "RWAX",
    "type": "credit_alphanum4",
    "issuer": "GDAHBQY3L2VLORCYFFNJ4ON64RZDSMVPB32MPA6MZGY42YZD246H2FJ5"
  },
  "quote": {
    "code": "XLM",
    "type": "native",
    "issuer": null
  },
  "ledgerSeq": 61234567,
  "ledgerClosedAt": "2026-08-19T04:12:31Z",
  "computedAt": "2026-08-19T04:15:04Z",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "horizon",
  "midPrice": "0.4410000",
  "priceSource": "pool",
  "poolSpotPrice": "0.4410000",
  "priceDivergencePct": null,
  "spreadPct": null,
  "depth": [
    {
      "delta": 0.02,
      "buySide": "1092.0044000",
      "sellSide": "1103.1180000",
      "fromSdex": "0.0000000",
      "fromAmm": "1092.0044000"
    },
    {
      "delta": 0.05,
      "buySide": "2710.9910000",
      "sellSide": "2777.4420000",
      "fromSdex": "0.0000000",
      "fromAmm": "2710.9910000"
    },
    {
      "delta": 0.1,
      "buySide": "5355.8800000",
      "sellSide": "5631.0210000",
      "fromSdex": "0.0000000",
      "fromAmm": "5355.8800000"
    }
  ],
  "manipulationCostCombined": [
    {
      "delta": 0.5,
      "targetPrice": "0.6615000",
      "cost": "24418.0900000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "0.8820000",
      "cost": "45441.7700000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "4.8510000",
      "cost": "218044.1100000",
      "reachable": true
    },
    {
      "delta": 100,
      "targetPrice": "44.5410000",
      "cost": "1010288.4400000",
      "reachable": true
    }
  ],
  "manipulationCostOrderbookOnly": [
    {
      "delta": 0.5,
      "targetPrice": "0.6615000",
      "cost": "24418.0900000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "0.8820000",
      "cost": "45441.7700000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "4.8510000",
      "cost": "218044.1100000",
      "reachable": true
    },
    {
      "delta": 100,
      "targetPrice": "44.5410000",
      "cost": "1010288.4400000",
      "reachable": true
    }
  ],
  "maxReachablePrice": null,
  "costToMaxReachablePrice": null,
  "oracleResistance": {
    "criticalDelta": 0.5,
    "manipulationCost": "24418.0900000",
    "reachable": true,
    "genuineVolume": "0.0000000",
    "windowSeconds": 900,
    "ratio": null,
    "totalAttackCost": "24418.0900000"
  },
  "maxSafeCollateral": "2677.9400000",
  "maxSafeCollateralLiquidation": "2677.9400000",
  "maxSafeCollateralManipulation": null,
  "holderTop1Pct": "61.8800000",
  "holderTop10Pct": "92.4100000",
  "holderHhi": "0.4128000",
  "volumeToSupply": {
    "d1": "0.0000000",
    "d7": "0.0009000",
    "d30": "0.0041000"
  },
  "lastGenuineTrade": {
    "ledgerSeq": 61102331,
    "at": "2026-08-11T22:04:19Z"
  },
  "tradesExcludedPct": "18.4000000",
  "flags": [
    "THIN_DEPTH_5PCT",
    "HOLDER_CONCENTRATION_EXTREME",
    "NO_GENUINE_TRADE_7D",
    "HOLDER_CONCENTRATION_HIGH"
  ],
  "unevaluatedFlags": [],
  "band": "HIGH",
  "bandConfidence": "full",
  "warnings": [
    "There is no SDEX orderbook. The reference price is taken from the pool spot price.",
    "The liquidity comes from a single AMM pool.",
    "spreadPct is null because there are not two sides of a book. maxReachablePrice is null because an AMM curve has no upper price bound, so every manipulation rung is reachable and only the cost differs.",
    "There was no genuine trade within the 900 second oracle window, so the oracle resistance ratio cannot be computed."
  ]
};

export const noPrice: components["schemas"]["AssetRisk"] = {
  "asset": {
    "code": "USTRY",
    "type": "credit_alphanum12",
    "issuer": "GBTVRMGKICFP3DB2U57IHURHMTU7EVSOU5R7H47DQJZFQZLYLKSXUJZE"
  },
  "quote": {
    "code": "XLM",
    "type": "native",
    "issuer": null
  },
  "ledgerSeq": 61234567,
  "ledgerClosedAt": "2026-08-19T04:12:31Z",
  "computedAt": "2026-08-19T04:15:06Z",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "horizon",
  "midPrice": null,
  "priceSource": "none",
  "poolSpotPrice": null,
  "priceDivergencePct": null,
  "spreadPct": null,
  "depth": [
    {
      "delta": 0.02,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.05,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.1,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    }
  ],
  "manipulationCostCombined": [],
  "manipulationCostOrderbookOnly": [],
  "maxReachablePrice": null,
  "costToMaxReachablePrice": null,
  "oracleResistance": null,
  "maxSafeCollateral": null,
  "maxSafeCollateralLiquidation": null,
  "maxSafeCollateralManipulation": null,
  "holderTop1Pct": "88.2100000",
  "holderTop10Pct": "99.1400000",
  "holderHhi": "0.7821000",
  "volumeToSupply": {
    "d1": "0.0000000",
    "d7": "0.0000000",
    "d30": "0.0000000"
  },
  "lastGenuineTrade": null,
  "tradesExcludedPct": null,
  "flags": [
    "NO_EXECUTABLE_PRICE",
    "ZERO_DEPTH_2PCT",
    "NO_GENUINE_TRADE_30D",
    "NO_GENUINE_TRADE_7D",
    "HOLDER_CONCENTRATION_EXTREME",
    "HOLDER_CONCENTRATION_HIGH"
  ],
  "unevaluatedFlags": [],
  "band": "CRITICAL",
  "bandConfidence": "full",
  "warnings": [
    "There is neither an orderbook nor a pool for this pair.",
    "An asset with no executable price cannot be assessed as collateral by any method. This is a finding, not a computation failure."
  ]
};

export const brokenBook: components["schemas"]["AssetRisk"] = {
  "asset": {
    "code": "USTRY",
    "type": "credit_alphanum12",
    "issuer": "GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC"
  },
  "quote": {
    "code": "USDC",
    "type": "credit_alphanum4",
    "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
  },
  "ledgerSeq": 61340263,
  "ledgerClosedAt": "2026-02-22T00:10:21Z",
  "computedAt": "2026-08-19T04:15:08Z",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "offers-implied",
  "midPrice": "53.8971414",
  "priceSource": "book",
  "poolSpotPrice": null,
  "priceDivergencePct": null,
  "spreadPct": "196.0777141",
  "depth": [
    {
      "delta": 0.02,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.05,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.1,
      "buySide": "0.0000000",
      "sellSide": "0.0000000",
      "fromSdex": "0.0000000",
      "fromAmm": "0.0000000"
    }
  ],
  "manipulationCostCombined": [
    {
      "delta": 0.5,
      "targetPrice": "80.8457121",
      "cost": "0.0000000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "107.7942828",
      "cost": "130.0627093",
      "reachable": false
    },
    {
      "delta": 10,
      "targetPrice": "592.8685554",
      "cost": "130.0627093",
      "reachable": false
    },
    {
      "delta": 100,
      "targetPrice": "5443.6112814",
      "cost": "130.0627093",
      "reachable": false
    }
  ],
  "manipulationCostOrderbookOnly": [
    {
      "delta": 0.5,
      "targetPrice": "80.8457121",
      "cost": "0.0000000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "107.7942828",
      "cost": "130.0627093",
      "reachable": false
    },
    {
      "delta": 10,
      "targetPrice": "592.8685554",
      "cost": "130.0627093",
      "reachable": false
    },
    {
      "delta": 100,
      "targetPrice": "5443.6112814",
      "cost": "130.0627093",
      "reachable": false
    }
  ],
  "maxReachablePrice": "106.7372828",
  "costToMaxReachablePrice": "0.0000000",
  "oracleResistance": null,
  "maxSafeCollateral": "0.0000000",
  "maxSafeCollateralLiquidation": "0.0000000",
  "maxSafeCollateralManipulation": "0.0000000",
  "holderTop1Pct": null,
  "holderTop10Pct": null,
  "holderHhi": null,
  "volumeToSupply": null,
  "lastGenuineTrade": null,
  "tradesExcludedPct": null,
  "flags": [
    "ZERO_DEPTH_2PCT",
    "MANIPULATION_CHEAP",
    "SPREAD_EXTREME",
    "THIN_DEPTH_5PCT"
  ],
  "unevaluatedFlags": [
    "MANIPULATION_RATIO_LOW",
    "NO_GENUINE_TRADE_30D",
    "NO_GENUINE_TRADE_7D",
    "WASH_TRADE_SUSPECTED",
    "HOLDER_CONCENTRATION_EXTREME",
    "HOLDER_CONCENTRATION_HIGH"
  ],
  "band": "CRITICAL",
  "bandConfidence": "partial",
  "warnings": [
    "A spread of 196.0777141 percent exceeds the spreadExtremePct threshold. The midPrice of 53.8971414 is the midpoint of an ask at 106.7372828 and a bid at 1.0570000, two prices unrelated to each other. Every metric derived from midPrice, including the 2/5/10 percent depth ladder, is meaningless in this response.",
    "There is no AMM pool for this pair, so every fromAmm value is zero and maxReachablePrice is determined entirely by the orderbook.",
    "dataSource is offers-implied. The orderbook snapshot at this ledger was unavailable, so both sides of the book were reconstructed by folding the offer operations and the trades that consumed them forward to it. That is a reconstruction, so the depth figures are not a direct measurement, but it is a stronger source than trades-implied would be: an offer proves liquidity that was posted, while a trade proves only liquidity that was consumed.",
    "A cost of 0.0000000 at delta 0.5 with reachable true is the most dangerous condition Keel can report: the price 80.8457121 is attainable without paying anything to a third party. Compare that with delta 1.0, 10, and 100, whose cost is 130.0627093 but whose reachable is false; there the book runs out before the target and that cost figure does not mean the target is expensive to reach.",
    "maxSafeCollateral is 0.0000000 because the sell side depth at the liquidation delta is zero, so the first term of C_max is zero and the minimum is zero with it.",
    "Six flags could not be assessed from this snapshot because they require supply data, trade history, or trustline distribution. They are listed in unevaluatedFlags, and bandConfidence is partial as a result. The band still reads CRITICAL because two CRITICAL flags are already triggered, so the missing data does not change the conclusion here. That is a coincidence of this case and not a guarantee: partial means the band is a floor, and it can only be worse than reported.",
    "oracleResistance is null because genuine trade volume within the oracle window cannot be computed from an orderbook snapshot alone. Null means unknown, not zero."
  ]
};

export const historical: components["schemas"]["AssetRisk"] = {
  "asset": {
    "code": "USTRY",
    "type": "credit_alphanum12",
    "issuer": "GBTVRMGKICFP3DB2U57IHURHMTU7EVSOU5R7H47DQJZFQZLYLKSXUJZE"
  },
  "quote": {
    "code": "XLM",
    "type": "native",
    "issuer": null
  },
  "ledgerSeq": 60912345,
  "ledgerClosedAt": "2026-05-19T11:02:44Z",
  "computedAt": "2026-08-19T02:40:11Z",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "offers-implied",
  "midPrice": "0.0104200",
  "priceSource": "book",
  "poolSpotPrice": null,
  "priceDivergencePct": null,
  "spreadPct": "3.4100000",
  "depth": [
    {
      "delta": 0.02,
      "buySide": "41.2200000",
      "sellSide": "38.9100000",
      "fromSdex": "41.2200000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.05,
      "buySide": "104.8800000",
      "sellSide": "96.4400000",
      "fromSdex": "104.8800000",
      "fromAmm": "0.0000000"
    },
    {
      "delta": 0.1,
      "buySide": "211.0400000",
      "sellSide": "190.2200000",
      "fromSdex": "211.0400000",
      "fromAmm": "0.0000000"
    }
  ],
  "manipulationCostCombined": [
    {
      "delta": 0.5,
      "targetPrice": "0.0156300",
      "cost": "892.4100000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "0.0208400",
      "cost": "1544.8800000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "0.1146200",
      "cost": "2210.4400000",
      "reachable": false
    },
    {
      "delta": 100,
      "targetPrice": "1.0524200",
      "cost": "2210.4400000",
      "reachable": false
    }
  ],
  "manipulationCostOrderbookOnly": [
    {
      "delta": 0.5,
      "targetPrice": "0.0156300",
      "cost": "892.4100000",
      "reachable": true
    },
    {
      "delta": 1,
      "targetPrice": "0.0208400",
      "cost": "1544.8800000",
      "reachable": true
    },
    {
      "delta": 10,
      "targetPrice": "0.1146200",
      "cost": "2210.4400000",
      "reachable": false
    },
    {
      "delta": 100,
      "targetPrice": "1.0524200",
      "cost": "2210.4400000",
      "reachable": false
    }
  ],
  "maxReachablePrice": "0.0891000",
  "costToMaxReachablePrice": "2183.6500000",
  "oracleResistance": {
    "criticalDelta": 0.5,
    "manipulationCost": "892.4100000",
    "reachable": true,
    "genuineVolume": "0.0000000",
    "windowSeconds": 900,
    "ratio": null,
    "totalAttackCost": "892.4100000"
  },
  "maxSafeCollateral": "95.1100000",
  "maxSafeCollateralLiquidation": "95.1100000",
  "maxSafeCollateralManipulation": "118.4000000",
  "holderTop1Pct": "79.4400000",
  "holderTop10Pct": "96.8800000",
  "holderHhi": "0.6412000",
  "volumeToSupply": {
    "d1": "0.0000000",
    "d7": "0.0002000",
    "d30": "0.0011000"
  },
  "lastGenuineTrade": {
    "ledgerSeq": 60874120,
    "at": "2026-05-16T08:33:02Z"
  },
  "tradesExcludedPct": "64.2000000",
  "flags": [
    "MANIPULATION_CHEAP",
    "MANIPULATION_RATIO_LOW",
    "THIN_DEPTH_5PCT",
    "NO_GENUINE_TRADE_7D",
    "HOLDER_CONCENTRATION_EXTREME",
    "HOLDER_CONCENTRATION_HIGH",
    "WASH_TRADE_SUSPECTED"
  ],
  "unevaluatedFlags": [],
  "band": "CRITICAL",
  "bandConfidence": "full",
  "warnings": [
    "There was no AMM liquidity for this pair at that ledger.",
    "The delta 10 and 100 rungs were not reached. Every ask is exhausted at a price of 0.0891000. The cost of 2210.4400000 on both of those rungs is the cost of exhausting the book, not the cost of reaching the target price.",
    "There was no genuine trade within the 900 second oracle window, so the oracle resistance ratio cannot be computed.",
    "reconstructed book: 42 of 65 account walk(s) stopped at the operation floor at ledger 61300000, so an offer created before that ledger is invisible to this row",
    "reconstructed book: 3 of 65 account walk(s) reached their page cap before the account ran out of operations",
    "every gap above REMOVES offers, so this book is too THIN and never too deep: read its depth as a lower bound and its risk as an upper bound"
  ],
  "reconstruction": {
    "truncated": 3,
    "stoppedAtFloor": 42,
    "failed": 0,
    "unsizable": 0,
    "missingOffers": 0,
    "floorLedger": 61300000,
    "accountsWalked": 65
  }
};

export const market: components["schemas"]["AssetListResponse"] = {
  "total": 53,
  "limit": 3,
  "offset": 0,
  "methodologyVersion": "1.0.8-draft",
  "items": [
    {
      "asset": {
        "code": "USDC",
        "type": "credit_alphanum4",
        "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
      },
      "quote": {
        "code": "XLM",
        "type": "native",
        "issuer": null
      },
      "midPrice": "2.8419300",
      "priceSource": "book",
      "depth5PctBuySide": "441038.9920700",
      "maxSafeCollateral": "419502.2756400",
      "band": "LOW",
      "bandConfidence": "full",
      "flags": [],
      "ledgerSeq": 61234567
    },
    {
      "asset": {
        "code": "RWAX",
        "type": "credit_alphanum4",
        "issuer": "GDAHBQY3L2VLORCYFFNJ4ON64RZDSMVPB32MPA6MZGY42YZD246H2FJ5"
      },
      "quote": {
        "code": "XLM",
        "type": "native",
        "issuer": null
      },
      "midPrice": "0.4410000",
      "priceSource": "pool",
      "depth5PctBuySide": "2710.9910000",
      "maxSafeCollateral": "2677.9400000",
      "band": "HIGH",
      "bandConfidence": "full",
      "flags": [
        "THIN_DEPTH_5PCT",
        "HOLDER_CONCENTRATION_EXTREME",
        "NO_GENUINE_TRADE_7D",
        "HOLDER_CONCENTRATION_HIGH"
      ],
      "ledgerSeq": 61234567
    },
    {
      "asset": {
        "code": "USTRY",
        "type": "credit_alphanum12",
        "issuer": "GBTVRMGKICFP3DB2U57IHURHMTU7EVSOU5R7H47DQJZFQZLYLKSXUJZE"
      },
      "quote": {
        "code": "XLM",
        "type": "native",
        "issuer": null
      },
      "midPrice": null,
      "priceSource": "none",
      "depth5PctBuySide": "0.0000000",
      "maxSafeCollateral": null,
      "band": "CRITICAL",
      "bandConfidence": "full",
      "flags": [
        "NO_EXECUTABLE_PRICE",
        "ZERO_DEPTH_2PCT",
        "NO_GENUINE_TRADE_30D",
        "NO_GENUINE_TRADE_7D",
        "HOLDER_CONCENTRATION_EXTREME",
        "HOLDER_CONCENTRATION_HIGH"
      ],
      "ledgerSeq": 61234567
    }
  ]
};

export const history: components["schemas"]["HistoryResponse"] = {
  "asset": {
    "code": "USTRY",
    "type": "credit_alphanum12",
    "issuer": "GBTVRMGKICFP3DB2U57IHURHMTU7EVSOU5R7H47DQJZFQZLYLKSXUJZE"
  },
  "quote": {
    "code": "XLM",
    "type": "native",
    "issuer": null
  },
  "from": 60890000,
  "to": 60950000,
  "resolution": "day",
  "methodologyVersion": "1.0.8-draft",
  "dataSource": "hubble",
  "gaps": [
    {
      "from": 60901000,
      "to": 60903500,
      "reason": "No state snapshot is available for this ledger range"
    }
  ],
  "points": [
    {
      "ledgerSeq": 60890120,
      "ledgerClosedAt": "2026-05-17T00:04:11Z",
      "midPrice": "0.0101100",
      "depth2PctBuySide": "48.9000000",
      "depth5PctBuySide": "122.4000000",
      "depth10PctBuySide": "244.1000000",
      "manipulationCost50Pct": "1044.2000000",
      "maxSafeCollateral": "110.8000000",
      "band": "CRITICAL",
      "flags": [
        "MANIPULATION_CHEAP",
        "THIN_DEPTH_5PCT",
        "HOLDER_CONCENTRATION_EXTREME"
      ]
    },
    {
      "ledgerSeq": 60912345,
      "ledgerClosedAt": "2026-05-19T11:02:44Z",
      "midPrice": "0.0104200",
      "depth2PctBuySide": "41.2200000",
      "depth5PctBuySide": "104.8800000",
      "depth10PctBuySide": "211.0400000",
      "manipulationCost50Pct": "892.4100000",
      "maxSafeCollateral": "95.1100000",
      "band": "CRITICAL",
      "flags": [
        "MANIPULATION_CHEAP",
        "THIN_DEPTH_5PCT",
        "HOLDER_CONCENTRATION_EXTREME"
      ]
    },
    {
      "ledgerSeq": 60934000,
      "ledgerClosedAt": "2026-05-20T14:48:02Z",
      "midPrice": "1.0420000",
      "depth2PctBuySide": "39.8000000",
      "depth5PctBuySide": "99.1000000",
      "depth10PctBuySide": "198.4000000",
      "manipulationCost50Pct": "870.0000000",
      "maxSafeCollateral": "90.2000000",
      "band": "CRITICAL",
      "flags": [
        "MANIPULATION_CHEAP",
        "THIN_DEPTH_5PCT",
        "HOLDER_CONCENTRATION_EXTREME"
      ]
    }
  ]
};

export const methodology: components["schemas"]["Methodology"] = {
  "version": "1.0.8-draft",
  "documentUrl": "https://github.com/Keel-Official/keel-backend/blob/main/docs/methodology/00-overview.md",
  "calibrated": false,
  "calibrationNote": "The thresholds were chosen based on the magnitude of the Blend incident of February 2026 and on conservative judgement, not calibrated against a set of incidents. Every flag is reported separately so that consumers can apply their own thresholds.",
  "thresholds": {
    "manipulationCheapAbsolute": "10000",
    "manipulationCheapUnit": "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    "manipulationRatioLowPct": "0.1",
    "thinDepth5PctAbsolute": "50000",
    "thinDepth5PctUnit": "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    "holderTop1ExtremePct": "50",
    "holderTop10HighPct": "80",
    "genuineTradeStaleDays": 30,
    "genuineTradeWarnDays": 7,
    "washTradeSuspectedPct": "50",
    "spreadExtremePct": "20",
    "priceDivergencePct": "10",
    "oracleWindowSeconds": 900,
    "liquidationDelta": 0.1,
    "liquidationHaircut": "0.5",
    "manipulationCriticalDelta": 0.5,
    "manipulationMargin": "0.25"
  }
};

