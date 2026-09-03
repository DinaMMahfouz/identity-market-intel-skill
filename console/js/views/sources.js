/**
 * Source registry. Walked in tier order A → C; open web search is the last
 * pass, not the first. "Checked today" writes last_checked so source coverage
 * can be reported honestly rather than reconstructed from memory.
 */
import { el, clear, toast, isoDate, daysSince } from '../dom.js';
import { state, touchSource } from '../store.js';
import { isAdmin } from '../auth.js';

const ACCESS_LABEL = {
  open: 'publicly readable',
  partial: 'index readable, detail needs login',
  auth: 'login required',
  unknown: 'not yet tested',
};

export function render(stage) {
  clear(stage);

  if (!state.loaded.sources) {
    stage.append(el('p.skel', { text: 'Loading sources…' }));
    return;
  }

  const byVendor = new Map();
  for (const s of state.sources) {
    if (!byVendor.has(s.vendor)) byVendor.set(s.vendor, []);
    byVendor.get(s.vendor).push(s);
  }

  stage.append(el('p.coverage__sub', {
    style: 'margin:0 0 18px',
    text: 'Tier A first-party sources are fetched and read before any open web search. '
        + 'A search snippet from a page that could not be opened is logged as inaccessible, '
        + 'never quoted as though it were read.',
  }));

  const tbody = el('tbody');

  for (const [vendor, list] of byVendor) {
    tbody.append(el('tr.sectionrow', null,
      el('td', { colspan: 5, text: `${vendor} — tier ${list[0].tier}` })));

    for (const s of list) {
      const age = daysSince(s.last_checked);
      const stale = age === null || age > 7;

      const checkBtn = isAdmin()
        ? el('button.btn.btn--sm', {
            type: 'button',
            text: s.last_checked ? 'Re-check' : 'Mark checked',
            onclick: async (e) => {
              e.stopPropagation();
              const btn = e.currentTarget;
              btn.disabled = true;
              try {
                await touchSource(s.id, { last_checked: isoDate() });
                toast(`${s.label} marked checked`);
                render(stage);
              } catch (err) {
                toast(err.message ?? String(err), 'error');
                btn.disabled = false;
              }
            },
          })
        : el('span.cell-when', { text: s.last_checked || 'never' });

      tbody.append(el('tr', { dataset: { state: stale ? 'empty' : 'verified' } },
        el('td.gut', null, el('i')),
        el('td', null,
          el('span.cell-cap', null,
            el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.label })),
          el('span.cell-q', { text: s.notes || s.url })),
        el('td', null, el('span.flag.flag--lvl', { text: ACCESS_LABEL[s.access] ?? s.access })),
        el('td.cell-when', { text: s.last_checked ? `${age}d ago` : '—' }),
        el('td', null, checkBtn)));
    }
  }

  stage.append(el('div.tablewrap', null, el('table.grid', null,
    el('thead', null, el('tr', null,
      el('th', { 'aria-label': 'Freshness' }),
      el('th', { text: 'Source' }),
      el('th', { text: 'Access' }),
      el('th', { text: 'Last checked' }),
      el('th', { text: '' }))),
    tbody)));
}

export const meta = {
  title: 'Source registry',
  sub: 'Tier A → C. Open web search is the third pass, never the first.',
};
