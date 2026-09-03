/**
 * Entry point. Wires auth → data → realtime → views.
 *
 * Static site, no build step: every module is loaded natively by the browser.
 */
import { $, $$, el, toast } from './dom.js';
import { watchAuth, sendMagicLink, signOut, session, isAdmin, cleanAuthUrl } from './auth.js';
import { loadMatrix, loadFindings, loadSources, subscribe, state } from './store.js';
import { connect, disconnect } from './realtime.js';
import { initDrawer, closeDrawer } from './drawer.js';
import * as matrix from './views/matrix.js';
import * as findings from './views/findings.js';
import * as sources from './views/sources.js';
import * as method from './views/method.js';

const VIEWS = { matrix, findings, sources, method };
let current = 'matrix';
let booted = false;

/* ───────────────────────── theme ───────────────────────── */

function initTheme() {
  const saved = (() => { try { return localStorage.getItem('imi-theme'); } catch { return null; } })();
  if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;

  $('#theme-btn').addEventListener('click', () => {
    const now = document.documentElement.dataset.theme
      ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = now === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('imi-theme', next); } catch { /* private mode */ }
  });
}

/* ───────────────────────── routing ───────────────────────── */

function show(name) {
  if (!VIEWS[name]) name = 'matrix';
  current = name;
  closeDrawer();

  $$('.rail__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.view === name));
  $('#view-title').textContent = VIEWS[name].meta.title;
  $('#view-sub').textContent = VIEWS[name].meta.sub;
  if (location.hash.slice(1) !== name) history.replaceState({}, '', `#${name}`);

  paint();
  $('#stage').focus({ preventScroll: true });
}

function paint() { VIEWS[current].render($('#stage')); }

function initNav() {
  $$('.rail__btn').forEach((b) => b.addEventListener('click', () => show(b.dataset.view)));
  window.addEventListener('hashchange', () => show(location.hash.slice(1) || 'matrix'));

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return;
    const key = { m: 'matrix', f: 'findings', s: 'sources', r: 'method' }[e.key.toLowerCase()];
    if (key) { e.preventDefault(); show(key); }
  });
}

/* ───────────────────────── gate ───────────────────────── */

function initGate() {
  const form = $('#signin-form');
  const note = $('#gate-note');
  const btn = $('#signin-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#signin-email').value.trim();
    if (!email) return;

    btn.disabled = true;
    note.dataset.tone = '';
    note.textContent = 'Sending…';
    try {
      await sendMagicLink(email);
      note.dataset.tone = 'ok';
      note.textContent = `Link sent to ${email}. Open it on this device to sign in.`;
    } catch (err) {
      note.dataset.tone = 'error';
      note.textContent = err.message ?? String(err);
    } finally {
      btn.disabled = false;
    }
  });

  // Decorative preview of the tick wall, built from the shape of the real matrix
  // (38 rows, 10 of them ★) so the gate is honest about what is inside.
  const preview = $('#gate-tickwall');
  const shape = 'A6 B7 C9 D8 E8';
  const stars = new Set(['A1', 'B1', 'B2', 'B5', 'C2', 'D1', 'D2', 'D8', 'E5', 'E8']);
  const seeded = new Set(['A1', 'D8']);
  let first = true;
  for (const grp of shape.split(' ')) {
    if (!first) preview.append(el('span.tick__spacer'));
    first = false;
    const letter = grp[0];
    for (let i = 1; i <= Number(grp.slice(1)); i++) {
      const id = letter + i;
      preview.append(el('span.tick' + (stars.has(id) ? '.tick--star' : ''), {
        dataset: { state: seeded.has(id) ? (id === 'A1' ? 'artefact' : 'incomplete') : 'empty' },
      }));
    }
  }
}

/* ───────────────────────── boot ───────────────────────── */

async function boot() {
  if (booted) return;
  booted = true;

  $('#who').textContent = `${session.profile?.email ?? ''}${isAdmin() ? ' · admin' : ' · viewer'}`;

  try {
    await Promise.all([loadMatrix(), loadFindings(), loadSources()]);
  } catch (err) {
    toast(`Could not load data: ${err.message ?? err}`, 'error');
  }

  connect((status) => {
    const c = $('#conn');
    c.dataset.state = status;
    c.querySelector('.conn__label').textContent =
      status === 'live' ? 'live' : status === 'error' ? 'offline' : 'connecting';
  });

  show(location.hash.slice(1) || 'matrix');
}

function teardown() {
  booted = false;
  disconnect();
  state.matrix = []; state.findings = []; state.sources = [];
  state.loaded = { matrix: false, findings: false, sources: false };
}

/* ───────────────────────── start ───────────────────────── */

initTheme();
initNav();
initDrawer();
initGate();

// Repaint whenever the store changes, including from a realtime event.
subscribe(() => { if (booted) paint(); });

$('#signout-btn').addEventListener('click', async () => {
  await signOut();
  teardown();
});

watchAuth((s) => {
  const signedIn = Boolean(s.user);
  $('#gate').hidden = signedIn;
  $('#console').hidden = !signedIn;
  if (signedIn) { cleanAuthUrl(); boot(); }
});

// Show the gate immediately rather than a blank page while the session resolves.
setTimeout(() => {
  if (!session.user) { $('#gate').hidden = false; }
}, 60);
