/**
 * Realtime synchronisation.
 *
 * One channel, three tables. Postgres RLS is applied to the replication
 * stream too, so a viewer never receives an internal-distribution row here
 * either — the same policy protects the socket and the REST read.
 */
import { supabase } from './supabase-client.js';
import { applyMatrixRow, applyFinding, removeById, emit } from './store.js';

let channel = null;

/** Ids that changed since the last render, so a view can flash them. */
export const recentlyChanged = new Set();

function markChanged(id) {
  recentlyChanged.add(id);
  setTimeout(() => recentlyChanged.delete(id), 1500);
}

/**
 * @param {(status: 'live'|'connecting'|'error') => void} onStatus
 */
export function connect(onStatus) {
  if (channel) return channel;

  channel = supabase
    .channel('imi-console')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'imi_matrix_rows' },
      (payload) => {
        if (payload.eventType === 'DELETE') removeById('matrix', payload.old?.id);
        else { markChanged(payload.new.id); applyMatrixRow(payload.new); }
      })
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'imi_findings' },
      (payload) => {
        if (payload.eventType === 'DELETE') removeById('findings', payload.old?.id);
        else { markChanged(payload.new.id); applyFinding(payload.new); }
      })
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'imi_sources' },
      () => emit('sources'))
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') onStatus('live');
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onStatus('error');
      else onStatus('connecting');
    });

  return channel;
}

export async function disconnect() {
  if (!channel) return;
  await supabase.removeChannel(channel);
  channel = null;
}
