/**
 * Findings log.
 *
 * The class-E provenance fields appear only when class E is selected, and the
 * database rejects a class-E finding missing any of them. The rule from
 * evidence-rules.md — "class E without a version is a memory" — is enforced in
 * three places on purpose: the form, the CHECK constraint, and the reader's eye.
 */
import { el, clear, toast, isoDate } from '../dom.js';
import { EVIDENCE_LEVELS, EVIDENCE_TYPES, FINDING_STATUSES, ACTIONS } from '../config.js';
import { state, createFinding } from '../store.js';
import { isAdmin } from '../auth.js';
import { openDrawer, closeDrawer } from '../drawer.js';

function findingCard(f) {
  const lvl = f.evidence_level;
  return el('tr', { dataset: { state: lvl === 'E' ? 'unknown' : 'verified' } },
    el('td.gut', null, el('i')),
    el('td.cell-id', { text: f.vendor }),
    el('td', null,
      el('span.cell-cap', { text: f.technical_change || f.finding_id }),
      el('span.cell-q', {
        text: [f.product, f.version, f.classification].filter(Boolean).join(' · ') || '—',
      })),
    el('td', null, el('div', { style: 'display:flex;gap:5px;flex-wrap:wrap' },
      el('span.flag.flag--lvl', { text: lvl }),
      f.status ? el('span.flag.flag--lvl', { text: f.status }) : null,
      f.distribution === 'internal' ? el('span.flag.flag--internal', { text: 'internal' }) : null)),
    el('td.cell-when', { text: f.effective_date || f.publication_date || f.discovery_date }));
}

function newFindingForm(rerender) {
  const body = el('div');
  body.append(el('div.drawer__head', null,
    el('div', null,
      el('span.drawer__id', { text: 'New finding' }),
      el('h2.drawer__title', { text: 'Log a change' })),
    el('button.btn.btn--ghost.btn--sm', { type: 'button', text: 'Close', onclick: closeDrawer })));

  const f = {
    finding_id: el('input', { type: 'text', placeholder: 'sp-isc-2026-09-03-connector-x' }),
    vendor: el('select', null, ...['SailPoint', 'Saviynt', 'RSA', 'other']
      .map((v) => el('option', { value: v, text: v }))),
    product: el('input', { type: 'text', placeholder: 'Identity Security Cloud' }),
    version: el('input', { type: 'text' }),
    classification: el('input', { type: 'text', placeholder: 'Connector change' }),
    status: el('select', null, el('option', { value: '', text: '—' }),
      ...FINDING_STATUSES.map((v) => el('option', { value: v, text: v }))),
    publication_date: el('input', { type: 'date' }),
    effective_date: el('input', { type: 'date' }),
    evidence_level: el('select', null,
      ...EVIDENCE_LEVELS.map((v) => el('option', { value: v, text: v, selected: v === 'A' }))),
    evidence_type: el('select', null,
      ...EVIDENCE_TYPES.map((v) => el('option', { value: v, text: v }))),
    distribution: el('select', null,
      ...['external', 'internal'].map((v) => el('option', { value: v, text: v }))),
    canonical_source_url: el('input', { type: 'text', placeholder: 'https://…' }),
    technical_change: el('textarea', { placeholder: 'Precise delta. No marketing language.' }),
    who_is_affected: el('textarea'),
    implementation_impact: el('textarea', { placeholder: 'Action, testing, or "no action required".' }),
    action: el('select', null, el('option', { value: '', text: '—' }),
      ...ACTIONS.map((v) => el('option', { value: v, text: v }))),
    verified_by: el('input', { type: 'text' }),
    verified_date: el('input', { type: 'date' }),
    version_tested: el('input', { type: 'text', placeholder: 'exact build' }),
    method: el('select', null, el('option', { value: '', text: '—' }),
      ...['lab test', 'authenticated documentation', 'internal engineering confirmation']
        .map((v) => el('option', { value: v, text: v }))),
  };

  const classE = el('div', { hidden: true },
    el('div.subhead', { text: 'Class E provenance — all four required' }),
    el('div.readonly-note', {
      text: 'Practitioner-verified evidence is real evidence, but it is internal and it '
          + 'must be traceable. Class E without a version is a memory.',
    }),
    el('div.formgrid', null,
      el('div.formrow2', null, fld('Verified by', f.verified_by), fld('Verified date', f.verified_date)),
      el('div.formrow2', null, fld('Version tested', f.version_tested), fld('Method', f.method))));

  const syncE = () => {
    const isE = f.evidence_level.value === 'E';
    classE.hidden = !isE;
    if (isE) { f.distribution.value = 'internal'; f.distribution.disabled = true; }
    else f.distribution.disabled = false;
  };
  f.evidence_level.addEventListener('change', syncE);

  body.append(
    el('div.subhead', { text: 'Identity' }),
    el('div.formgrid', null,
      fld('Finding id', f.finding_id, 'Stable, unique. Used for deduplication.'),
      el('div.formrow2', null, fld('Vendor', f.vendor), fld('Product', f.product)),
      el('div.formrow2', null, fld('Version', f.version), fld('Classification', f.classification)),
      el('div.formrow2', null, fld('Status', f.status), fld('Action', f.action))),
    el('div.subhead', { text: 'Dates — never collapse them' }),
    el('div.formrow2', null,
      fld('Published', f.publication_date),
      fld('Effective', f.effective_date, 'Blank means not publicly specified.')),
    el('div.subhead', { text: 'Evidence' }),
    el('div.formgrid', null,
      el('div.formrow2', null, fld('Level', f.evidence_level), fld('Type', f.evidence_type)),
      fld('Distribution', f.distribution),
      fld('Canonical source', f.canonical_source_url)),
    classE,
    el('div.subhead', { text: 'Substance' }),
    el('div.formgrid', null,
      fld('Technical change', f.technical_change),
      fld('Who is affected', f.who_is_affected),
      fld('Implementation impact', f.implementation_impact)));

  const status = el('span.hint');
  const save = el('button.btn.btn--primary', { type: 'button', text: 'Log finding' });

  save.addEventListener('click', async () => {
    const record = {
      finding_id: f.finding_id.value.trim(),
      vendor: f.vendor.value,
      product: f.product.value.trim(),
      version: f.version.value.trim(),
      classification: f.classification.value.trim(),
      status: f.status.value || null,
      publication_date: f.publication_date.value || null,
      effective_date: f.effective_date.value || null,
      discovery_date: isoDate(),
      evidence_level: f.evidence_level.value,
      evidence_type: f.evidence_type.value,
      distribution: f.evidence_level.value === 'E' ? 'internal' : f.distribution.value,
      canonical_source_url: f.canonical_source_url.value.trim(),
      technical_change: f.technical_change.value.trim(),
      who_is_affected: f.who_is_affected.value.trim(),
      implementation_impact: f.implementation_impact.value.trim(),
      action: f.action.value || null,
      verified_by: f.verified_by.value.trim(),
      verified_date: f.verified_date.value || null,
      version_tested: f.version_tested.value.trim(),
      method: f.method.value,
    };

    if (!record.finding_id) { fail('Give the finding a stable id.'); return; }
    if (!record.technical_change) { fail('State the technical change.'); return; }

    save.disabled = true;
    status.className = 'hint';
    status.textContent = 'Saving…';
    try {
      await createFinding(record);
      toast('Finding logged');
      closeDrawer();
      rerender();
    } catch (err) {
      fail(explain(err));
      save.disabled = false;
    }

    function fail(msg) { status.className = 'hint hint--warn'; status.textContent = msg; }
  });

  body.append(el('div.drawer__actions', null, save,
    el('button.btn', { type: 'button', text: 'Cancel', onclick: closeDrawer }), status));

  openDrawer(body);
}

const fld = (label, control, hint) => el('label.field', null,
  el('span.field__label', { text: label }), control,
  hint ? el('span.hint', { text: hint }) : null);

function explain(err) {
  const m = err?.message ?? String(err);
  if (m.includes('imi_findings_class_e_provenance')) {
    return 'Class E needs all four: who verified it, when, which build, and by what method.';
  }
  if (m.includes('imi_findings_class_e_internal')) return 'A class E finding is always internal.';
  if (m.includes('duplicate key')) return 'That finding id already exists — this may be a duplicate.';
  if (m.includes('row-level security') || m.includes('permission denied')) {
    return 'Your account does not have write access to findings.';
  }
  return m;
}

export function render(stage) {
  const rerender = () => render(stage);
  clear(stage);

  if (!state.loaded.findings) {
    stage.append(el('p.skel', { text: 'Loading findings…' }));
    return;
  }

  if (isAdmin()) {
    stage.append(el('div.filters', null,
      el('button.btn.btn--primary.btn--sm', {
        type: 'button', text: 'Log a finding', onclick: () => newFindingForm(rerender),
      })));
  }

  if (!state.findings.length) {
    stage.append(el('div.empty', null,
      el('h3', { text: 'No findings logged.' }),
      el('p', {
        text: 'A no-change scan is a successful scan. This stays empty until something '
            + 'genuinely qualified — an advisory, a deprecation, a breaking API change.',
      })));
    return;
  }

  const tbody = el('tbody');
  state.findings.forEach((f) => tbody.append(findingCard(f)));

  stage.append(el('div.tablewrap', null, el('table.grid', null,
    el('thead', null, el('tr', null,
      el('th', { 'aria-label': 'Evidence' }),
      el('th', { text: 'Vendor' }),
      el('th', { text: 'Change' }),
      el('th', { text: 'Evidence' }),
      el('th', { text: 'Effective' }))),
    tbody)));
}

export const meta = {
  title: 'Findings',
  sub: 'Dated, sourced, deduplicated. Advisories and deprecations first.',
};
