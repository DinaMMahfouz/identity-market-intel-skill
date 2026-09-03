/**
 * Data access + in-memory cache.
 *
 * Everything the views render comes from here. Views never touch Supabase
 * directly, so realtime updates and local edits converge on one code path.
 */
import { supabase } from './supabase-client.js';
import { STALENESS_DAYS } from './config.js';
import { daysSince } from './dom.js';

export const state = {
  matrix: [],
  findings: [],
  sources: [],
  loaded: { matrix: false, findings: false, sources: false },
};

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit(what) { for (const fn of listeners) fn(what); }

/* ────────────────────────── derived state ────────────────────────── */

/**
 * Map a row to its epistemic state — the single variable the whole UI is
 * coloured by. Staleness outranks the verdict: a verified row nobody has
 * re-checked in 90 days is not currently knowledge.
 */
export function rowState(row) {
  if (!row.verdict) return 'empty';
  const age = daysSince(row.last_verified);
  if (age !== null && age > STALENESS_DAYS) return 'stale';
  const v = row.verdict;
  if (v.endsWith('verified')) return 'verified';
  if (v.startsWith('Deployment-model artefact')) return 'artefact';
  if (v === 'Different implementation approach') return 'artefact';
  if (v.startsWith('Unknown')) return 'unknown';
  return 'incomplete';
}

export function isStale(row) {
  const age = daysSince(row.last_verified);
  return age !== null && age > STALENESS_DAYS;
}

export function coverage() {
  const rows = state.matrix;
  const stars = rows.filter((r) => r.priority === 'star');
  return {
    total: rows.length,
    seeded: rows.filter((r) => r.verdict).length,
    stars: stars.length,
    starsSeeded: stars.filter((r) => r.verdict).length,
    stale: rows.filter((r) => r.verdict && isStale(r)).length,
    internal: rows.filter((r) => r.distribution === 'internal').length,
  };
}

/* ────────────────────────── reads ────────────────────────── */

export async function loadMatrix() {
  const { data, error } = await supabase
    .from('imi_matrix_rows')
    .select('*')
    .order('id');
  if (error) throw error;
  state.matrix = data;
  state.loaded.matrix = true;
  emit('matrix');
  return data;
}

export async function loadFindings() {
  const { data, error } = await supabase
    .from('imi_findings')
    .select('*')
    .order('discovery_date', { ascending: false })
    .limit(300);
  if (error) throw error;
  state.findings = data;
  state.loaded.findings = true;
  emit('findings');
  return data;
}

export async function loadSources() {
  const { data, error } = await supabase
    .from('imi_sources')
    .select('*')
    .order('tier')
    .order('vendor');
  if (error) throw error;
  state.sources = data;
  state.loaded.sources = true;
  emit('sources');
  return data;
}

/* ────────────────────────── writes ────────────────────────── */

export async function saveMatrixRow(id, patch) {
  const { data, error } = await supabase
    .from('imi_matrix_rows')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  applyMatrixRow(data);
  return data;
}

export async function createFinding(record) {
  const { data, error } = await supabase
    .from('imi_findings')
    .insert(record)
    .select()
    .single();
  if (error) throw error;
  applyFinding(data);
  return data;
}

export async function touchSource(id, patch) {
  const { data, error } = await supabase
    .from('imi_sources')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  const i = state.sources.findIndex((s) => s.id === id);
  if (i >= 0) state.sources[i] = data;
  emit('sources');
  return data;
}

/* ─────────────────── realtime reconciliation ─────────────────── */

export function applyMatrixRow(row) {
  const i = state.matrix.findIndex((r) => r.id === row.id);
  if (i >= 0) state.matrix[i] = row;
  else { state.matrix.push(row); state.matrix.sort((a, b) => a.id.localeCompare(b.id)); }
  emit('matrix');
}

export function applyFinding(row) {
  const i = state.findings.findIndex((r) => r.id === row.id);
  if (i >= 0) state.findings[i] = row;
  else state.findings.unshift(row);
  emit('findings');
}

export function removeById(collection, id) {
  const arr = state[collection];
  const i = arr.findIndex((r) => r.id === id);
  if (i >= 0) { arr.splice(i, 1); emit(collection); }
}
