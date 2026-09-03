/**
 * Deployment configuration.
 *
 * The publishable key is designed to ship in client code — it identifies the
 * project, it does not authorise anything. Every table is protected by Row
 * Level Security, so what a visitor can read or write is decided by Postgres
 * policies against their signed-in identity, not by keeping this string secret.
 * Never put the service_role key here.
 */
export const SUPABASE_URL = 'https://yiiegrgxycbrihlhpuba.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SmTgTuhNop6lksrsFVpOjA_jRyOOx97';

/** Rows older than this are stale and must be re-verified before use. */
export const STALENESS_DAYS = 90;

/** The controlled vocabulary. Copy verbatim — the database CHECK enforces it. */
export const VERDICTS = [
  'RSA advantage — verified',
  'Competitor advantage — verified',
  'Broad parity — verified',
  'Different implementation approach',
  'Deployment-model artefact — not a capability gap',
  'Potential competitor advantage — evidence incomplete',
  'Potential RSA advantage — evidence incomplete',
  'Possible gap — RSA validation required',
  'Unknown / insufficient current evidence',
];

export const EVIDENCE_LEVELS = ['A', 'B', 'C', 'D', 'E'];

export const EVIDENCE_TYPES = [
  'verified-fact', 'vendor-claim', 'third-party-observation',
  'reasoned-inference', 'unconfirmed', 'conflicting',
];

export const FINDING_STATUSES = [
  'GA', 'staged-rollout', 'preview', 'roadmap',
  'deprecated', 'EOS-announced', 'fixed', 'known-issue',
];

export const ACTIONS = [
  'know', 'validate', 'test', 'ask-engineering', 'battlecard', 'monitor', 'ignore',
];

export const SECTIONS = {
  A: 'Architecture & deployment',
  B: 'Connectivity',
  C: 'Governance core',
  D: 'The 2026 battlegrounds',
  E: 'Ecosystem & commercial',
};
