import type { components } from './schema';

/**
 * Names for the generated schemas, so components never reach into
 * `components['schemas'][...]` by hand. Everything here is a re-export: there is no
 * hand-written contract in this codebase, and a type that drifts from
 * `docs/api/keel-openapi.yaml` is a bug in the generator input, not something to
 * patch downstream.
 */

type Schemas = components['schemas'];

export type Asset = Schemas['Asset'];
export type AssetRisk = Schemas['AssetRisk'];
export type AssetSummary = Schemas['AssetSummary'];
export type AssetListResponse = Schemas['AssetListResponse'];
export type DepthPoint = Schemas['DepthPoint'];
export type ManipulationCost = Schemas['ManipulationCost'];
export type OracleResistance = Schemas['OracleResistance'];
export type VolumeToSupply = Schemas['VolumeToSupply'];
export type LastGenuineTrade = Schemas['LastGenuineTrade'];
export type PairSummary = Schemas['PairSummary'];
export type HistoryPoint = Schemas['HistoryPoint'];
export type HistoryResponse = Schemas['HistoryResponse'];
export type Health = Schemas['Health'];
export type Methodology = Schemas['Methodology'];
export type KeelError = Schemas['Error'];
