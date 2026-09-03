/**
 * Capability matrix.
 *
 * The header tick wall and the per-row gutter encode the same variable at two
 * scales: how much of this is actually known. Unseeded rows are rendered at
 * full presence rather than hidden, because an empty matrix that looks empty
 * is the honest state — and the failure mode this whole tool exists to prevent
 * is a guess getting quoted at a customer.
 */
import { el, clear, $, toast, daysSince } from '../dom.js';
import { VERDICTS, EVIDENCE_LEVELS, SECTIONS, STALENESS_DAYS } from '../config.js';
import { state, rowState, isStale, coverage, saveMatrixRow } from '../store.js';
import { recentlyChanged } from '../realtime.js';
import { isAdmin } from '../auth.js';
import { openDrawer, closeDrawer } from '../drawer.js';

const filters = { section: 'all', only: 'all', q: '' };

const STATE_LABEL = {
  verified: 'Verified', incomplete: 'Evidence incomplete', unknown: 'Unknown',
  artefact: 'Settled — not a scoreboard result', stale: 'Stale', empty: 'Unseeded',
};

/* ───────────────────────── tick wall ───────────────────────── */

export function tickwall(rows, { compact = false, animate = false } = {}) {
  const wall = el('div.tickwall' + (compact ? '.tickwall--compact' : ''),
    animate ? { class: 'tickwall--animate' } : null);
  let prevSection = null;
  rows.forEach((row, i) => {
    const section = row.id[0];
    if (prevSection && section !== prevSection) wall.append(el('span.tick__spacer'));
    prevSection = section;
    const st = rowState(row);
    const tick = el('span.tick' + (row.priority === 'star' ? '.tick--star' : ''), {
      dataset: { state: st },
      title: `${row.id} · ${row.capability} — ${STATE_LABEL[st]}`,
    });
    if (animate) tick.style.animationDelay = `${i * 12}ms`;
    wall.append(tick);
  });
  return wall;
}

/* ───────────────────────── header ───────────────────────── */

function coverageHeader() {
  const c = coverage();
  const lead = c.starsSeeded === 0
    ? 'Nothing that decides a deal is evidenced yet.'
    : `${c.starsSeeded} of ${c.stars} deal-deciding rows carry a verdict.`;

  return el('section.coverage', null,
    el('div', null,
      el('p.eyebrow', { text: 'Coverage' }),
      el('h2.coverage__lead', { text: lead }),
      el('p.coverage__sub', {
        text: 'Each tick is one capability row, grouped A–E. Tall ticks are the ★ rows '
            + 'that decide deals. Hollow means no verdict — which is the correct state '
            + 'until evidence arrives, not a gap to paper over.',
      }),
      tickwall(state.matrix, { animate: true }),
    ),
    el('div.coverage__nums', null,
      numBlock(c.seeded, 'seeded'),
      numBlock(c.total - c.seeded, 'open'),
      numBlock(c.stale, 'stale'),
    ),
  );
}

const numBlock = (n, label) =>
  el('div.coverage__num', null, el('b', { text: String(n) }), el('span', { text: label }));

/* ───────────────────────── filters ───────────────────────── */

function filterBar(rerender) {
  const bar = el('div.filters');

  const mk = (label, key, value) => {
    const on = filters[key] === value;
    return el('button.chip' + (on ? '.is-on' : ''), {
      type: 'button', text: label,
      onclick: () => { filters[key] = value; rerender(); },
    });
  };

  bar.append(mk('All sections', 'section', 'all'));
  for (const k of Object.keys(SECTIONS)) bar.append(mk(k, 'section', k));
  bar.append(el('span.filters__spacer'));
  bar.append(mk('Everything', 'only', 'all'));
  bar.append(mk('★ only', 'only', 'star'));
  bar.append(mk('Unseeded', 'only', 'empty'));
  bar.append(mk('Stale', 'only', 'stale'));

  const search = el('input', {
    type: 'text', placeholder: 'Filter by capability or question…',
    value: filters.q, 'aria-label': 'Filter rows',
    oninput: (e) => { filters.q = e.target.value; rerender({ keepFocus: true }); },
  });
  bar.append(search);
  return { bar, search };
}

function visibleRows() {
  const q = filters.q.trim().toLowerCase();
  return state.matrix.filter((r) => {
    if (filters.section !== 'all' && r.id[0] !== filters.section) return false;
    if (filters.only === 'star' && r.priority !== 'star') return false;
    if (filters.only === 'empty' && r.verdict) return false;
    if (filters.only === 'stale' && !(r.verdict && isStale(r))) return false;
    if (q && !(`${r.id} ${r.capability} ${r.question} ${r.notes}`.toLowerCase().includes(q))) return false;
    return true;
  });
}

/* ───────────────────────── table ───────────────────────── */

function table(rows, rerender) {
  if (!rows.length) {
    return el('div.empty', null,
      el('h3', { text: 'No rows match those filters.' }),
      el('p', { text: 'Widen the filter, or clear the search box.' }));
  }

  const tbody = el('tbody');
  let prevSection = null;

  for (const row of rows) {
    const section = row.id[0];
    if (section !== prevSection) {
      prevSection = section;
      tbody.append(el('tr.sectionrow', null,
        el('td', { colspan: 6, text: `${section} — ${SECTIONS[section] ?? ''}` })));
    }

    const st = rowState(row);
    const age = daysSince(row.last_verified);

    const tr = el('tr', {
      dataset: { state: st, id: row.id },
      tabindex: '0',
      class: recentlyChanged.has(row.id) ? 'is-flash' : null,
      onclick: () => openRow(row, rerender),
      onkeydown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRow(row, rerender); }
      },
    });

    tr.append(el('td.gut', null, el('i')));
    tr.append(el('td.cell-id', null, row.id,
      row.priority === 'star' ? el('span.star', { text: '★' }) : null));
    tr.append(el('td', null,
      el('span.cell-cap', { text: row.capability }),
      el('span.cell-q', { text: row.question })));
    tr.append(el('td', null,
      el('span.verdict', {
        dataset: { state: st === 'stale' ? 'incomplete' : st },
        text: row.verdict || 'No verdict — unseeded',
      })));
    tr.append(el('td', null, el('div', { style: 'display:flex;gap:5px;flex-wrap:wrap' },
      row.evidence_level ? el('span.flag.flag--lvl', { text: row.evidence_level }) : null,
      row.distribution === 'internal'
        ? el('span.flag.flag--internal', { text: 'internal' })
        : null,
      st === 'stale' ? el('span.flag.flag--stale', { text: `${age}d` }) : null)));
    tr.append(el('td.cell-when', {
      text: row.last_verified ? row.last_verified : '—',
    }));

    tbody.append(tr);
  }

  const head = el('thead', null, el('tr', null,
    el('th', { 'aria-label': 'Confidence' }),
    el('th', { text: 'Row' }),
    el('th', { text: 'Capability & the question behind it' }),
    el('th', { text: 'Verdict' }),
    el('th', { text: 'Evidence' }),
    el('th', { text: 'Verified' })));

  return el('div.tablewrap', null, el('table.grid', null, head, tbody));
}

/* ───────────────────────── row inspector ───────────────────────── */

function openRow(row, rerender) {
  const admin = isAdmin();
  const body = el('div');
  const st = rowState(row);
  const age = daysSince(row.last_verified);

  body.append(el('div.drawer__head', null,
    el('div', null,
      el('span.drawer__id', { text: `${row.id}${row.priority === 'star' ? ' ★' : ''} · ${SECTIONS[row.id[0]]}` }),
      el('h2.drawer__title', { text: row.capability })),
    el('button.btn.btn--ghost.btn--sm', { type: 'button', text: 'Close', onclick: closeDrawer })));

  body.append(el('p.drawer__q', { text: row.question }));

  if (st === 'stale') {
    body.append(el('div.readonly-note', {
      text: `Verified ${age} days ago, past the ${STALENESS_DAYS}-day staleness rule. `
          + 'Say so before using this row, and re-verify if the answer matters.',
    }));
  }
  if (row.distribution === 'internal') {
    body.append(el('div.readonly-note', {
      text: 'Internal distribution. This row may not appear in customer-facing material.',
    }));
  }

  body.append(el('div.subhead', { text: 'Positions' }));
  body.append(el('dl.dl', null,
    ...pair('Pairing', row.pairing || '—'),
    ...pair('SailPoint ISC', row.sailpoint_isc || '—'),
    ...pair('IdentityIQ', row.sailpoint_iiq || '—'),
    ...pair('Saviynt EIC', row.saviynt_eic || '—'),
    ...pair('RSA G&L', row.rsa_gl || '—')));

  if (row.notes) {
    body.append(el('div.subhead', { text: 'Analytical note' }));
    body.append(el('p', { text: row.notes, style: 'font-size:13px;color:var(--muted);margin:0' }));
  }

  body.append(el('div.subhead', { text: admin ? 'Verdict — editable' : 'Verdict' }));

  if (!admin) {
    body.append(el('div.readonly-note', {
      text: 'You have viewer access. Verdicts are written by an admin.',
    }));
    body.append(el('dl.dl', null,
      ...pair('Verdict', row.verdict || 'Unseeded'),
      ...pair('Evidence', row.evidence_level || '—'),
      ...pair('Distribution', row.distribution),
      ...pair('Last verified', row.last_verified || '—'),
      ...pair('Sources', row.sources || '—'),
      ...pair('Falsifier', row.falsifier || '—')));
    openDrawer(body);
    return;
  }

  /* ---- editor ---- */
  const fVerdict = el('select', { name: 'verdict' },
    el('option', { value: '', text: '— no verdict (unseeded) —' }),
    ...VERDICTS.map((v) => el('option', { value: v, text: v, selected: row.verdict === v })));

  const fLevel = el('select', { name: 'evidence_level' },
    el('option', { value: '', text: '—' }),
    ...EVIDENCE_LEVELS.map((v) => el('option', {
      value: v, text: `${v} — ${levelBlurb(v)}`, selected: row.evidence_level === v })));

  const fDist = el('select', { name: 'distribution' },
    ...['external', 'internal'].map((v) => el('option', {
      value: v, text: v, selected: row.distribution === v })));

  const fDate = el('input', { type: 'date', name: 'last_verified', value: row.last_verified || '' });
  const fSources = el('textarea', { name: 'sources', text: row.sources || '',
    placeholder: 'Direct links. First-party preferred.' });
  const fFals = el('textarea', { name: 'falsifier', text: row.falsifier || '',
    placeholder: 'What evidence would change this verdict?' });
  const fNotes = el('textarea', { name: 'notes', text: row.notes || '' });

  const warn = el('p.hint.hint--warn', { hidden: true });

  // Class E is internal by definition — mirror the DB constraint in the UI so
  // the rule is visible at the point of decision, not just at the point of save.
  const syncE = () => {
    if (fLevel.value === 'E') {
      fDist.value = 'internal';
      fDist.disabled = true;
      warn.textContent = 'Class E is practitioner-verified, so this row is internal by definition.';
      warn.hidden = false;
    } else {
      fDist.disabled = false;
      warn.hidden = true;
    }
  };
  fLevel.addEventListener('change', syncE);
  syncE();

  const form = el('div.formgrid', null,
    field('Verdict', fVerdict, 'Controlled vocabulary. The database rejects anything else.'),
    el('div.formrow2', null,
      field('Evidence level', fLevel),
      field('Distribution', fDist)),
    warn,
    field('Last verified', fDate, `Rows older than ${STALENESS_DAYS} days are flagged stale.`),
    field('Sources', fSources),
    field('Falsifier', fFals, 'Mandatory once a verdict is set. A row without one is an opinion.'),
    field('Analytical note', fNotes));

  const saveBtn = el('button.btn.btn--primary', { type: 'button', text: 'Save row' });
  const status = el('span.hint');

  saveBtn.addEventListener('click', async () => {
    const patch = {
      verdict: fVerdict.value || null,
      evidence_level: fLevel.value || null,
      distribution: fDist.value,
      last_verified: fDate.value || null,
      sources: fSources.value.trim(),
      falsifier: fFals.value.trim(),
      notes: fNotes.value.trim(),
    };

    if (patch.verdict && (!patch.falsifier || !patch.last_verified || !patch.evidence_level)) {
      status.textContent = 'A verdict needs an evidence level, a verified date and a falsifier.';
      status.className = 'hint hint--warn';
      return;
    }

    saveBtn.disabled = true;
    status.className = 'hint';
    status.textContent = 'Saving…';
    try {
      await saveMatrixRow(row.id, patch);
      toast(`${row.id} saved`);
      closeDrawer();
      rerender();
    } catch (err) {
      status.className = 'hint hint--warn';
      status.textContent = friendly(err);
      saveBtn.disabled = false;
    }
  });

  body.append(form);
  body.append(el('div.drawer__actions', null, saveBtn,
    el('button.btn', { type: 'button', text: 'Cancel', onclick: closeDrawer }), status));

  openDrawer(body);
}

const pair = (k, v) => [el('dt', { text: k }), el('dd', { text: v })];

function field(label, control, hint) {
  return el('label.field', null,
    el('span.field__label', { text: label }), control,
    hint ? el('span.hint', { text: hint }) : null);
}

const levelBlurb = (v) => ({
  A: 'first-party technical source',
  B: 'company announcement / two independent sources',
  C: 'partner, SI or analyst — qualify inline',
  D: 'watchlist only, never sole evidence',
  E: 'practitioner-verified, internal only',
}[v] ?? '');

function friendly(err) {
  const m = err?.message ?? String(err);
  if (m.includes('imi_matrix_verdict_requires_provenance')) {
    return 'The database refused this: a verdict needs a falsifier, a date and an evidence level.';
  }
  if (m.includes('violates row-level security') || m.includes('permission denied')) {
    return 'Your account does not have write access to the matrix.';
  }
  if (m.includes('imi_matrix_rows_verdict_check')) {
    return 'That verdict is not in the controlled vocabulary.';
  }
  return m;
}

/* ───────────────────────── mount ───────────────────────── */

export function render(stage) {
  const rerender = (opts = {}) => {
    const active = document.activeElement;
    const wasSearch = active && active.type === 'text';
    const caret = wasSearch ? active.selectionStart : null;
    render(stage);
    if (opts.keepFocus && wasSearch) {
      const next = $('.filters input[type="text"]', stage);
      if (next) { next.focus(); next.setSelectionRange(caret, caret); }
    }
  };

  clear(stage);

  if (!state.loaded.matrix) {
    stage.append(el('p.skel', { text: 'Loading matrix…' }));
    return;
  }

  stage.append(coverageHeader());
  const { bar } = filterBar(rerender);
  stage.append(bar);
  stage.append(table(visibleRows(), rerender));
}

export const meta = {
  title: 'Capability matrix',
  sub: 'RSA G&L · SailPoint ISC / IdentityIQ · Saviynt EIC',
};
