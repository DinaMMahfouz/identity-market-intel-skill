/**
 * Method. The rules the rest of the console enforces, stated plainly so the
 * colour coding is readable without a legend hunt.
 */
import { el, clear } from '../dom.js';
import { VERDICTS, STALENESS_DAYS } from '../config.js';
import { rowState } from '../store.js';

const LEVELS = [
  ['A', '<b>First-party technical source.</b> Documentation, release notes, security advisory, lifecycle notice, API reference, official GitHub release, regulator publication, tender portal, investor filing. May enter executive conclusions.'],
  ['B', '<b>Official company announcement</b> or engineering blog or verified product-leader statement — <i>or</i> two independent credible sources agreeing.'],
  ['C', '<b>Credible partner, SI, analyst or practitioner</b> with partial confirmation. Usable, with the qualification stated inline.'],
  ['D', '<b>Forum, social, aggregator, SEO or training-vendor content.</b> Watchlist only. Can raise a question; can never answer one.'],
  ['E', '<b>Practitioner-verified, internal.</b> Verified in a live or lab RSA environment, or against authenticated content. Requires who, when, which build, and by what method — or it is not class E.'],
];

export function render(stage) {
  clear(stage);

  const prose = el('div.prose');

  prose.append(
    el('h2', { text: 'The verdict vocabulary' }),
    el('p', {
      text: 'Nine strings, copied character for character. The database rejects anything '
          + 'else, so a paraphrase cannot quietly become a row nobody can filter for.',
    }));

  const vocab = el('div.vocab');
  for (const v of VERDICTS) {
    const st = rowState({ verdict: v, last_verified: null });
    vocab.append(el('div.vocab__row', null,
      el('span.vocab__swatch', { style: `background:var(--sig-${st === 'empty' ? 'empty' : st})` }),
      el('span', { text: v })));
  }
  prose.append(vocab);

  prose.append(
    el('h2', { text: 'Evidence levels' }));
  const levels = el('div.levels');
  for (const [k, v] of LEVELS) {
    levels.append(el('div.levels__row', null,
      el('div.levels__k', { text: k }),
      el('div.levels__v', { html: v })));
  }
  prose.append(levels);

  prose.append(
    el('h2', { text: 'The rules this console enforces' }),
    el('ol', null,
      el('li', { html: '<strong>Deployment-model normalisation.</strong> Compare G&amp;L on-prem to IdentityIQ, and G&amp;L Cloud to ISC or EIC. A gap caused by deployment model is labelled an artefact, not a capability gap.' }),
      el('li', { html: '<strong>Absence of RSA public evidence is not an RSA gap.</strong> A failed search produces "Possible gap — RSA validation required", never "RSA does not support X".' }),
      el('li', { html: '<strong>Practitioner evidence is real, but internal.</strong> Class E rows are readable only by an admin. Row Level Security enforces that, so an internal row cannot reach customer-facing material through this app.' }),
      el('li', { html: `<strong>Date discipline.</strong> Publication date is not effective date. Rows unverified for ${STALENESS_DAYS} days are flagged stale before use.` }),
      el('li', { html: '<strong>Silence is a valid output.</strong> An empty findings log after a real scan is a successful scan, not a missing report.' })),

    el('h2', { text: 'Reading the ticks' }),
    el('p', {
      text: 'The wall at the top of the matrix is one tick per capability row, grouped A–E. '
          + 'Tall ticks are the ten ★ rows that decide deals. Filled means a verdict backed '
          + 'by evidence and a falsifier; hollow means unseeded; hatched means the verdict '
          + 'exists but has gone stale. The point of showing hollow ticks at full height is '
          + 'that an honest matrix looks mostly empty for a long time.',
    }),

    el('h2', { text: 'What this console will not do' }),
    el('p', {
      text: 'It will not let you save a verdict without a falsifier and a date, it will not '
          + 'accept a verdict outside the controlled vocabulary, and it will not show an '
          + 'internal-distribution row to a viewer account. Those are database constraints '
          + 'and policies, not client-side conventions — bypassing the interface does not '
          + 'bypass them.',
    }));

  stage.append(prose);
}

export const meta = {
  title: 'Method',
  sub: 'Evidence classes, verdict vocabulary, and the rules the database enforces.',
};
