/** The right-hand inspector. One at a time, focus-trapped enough to be usable. */
import { $, clear } from './dom.js';

let lastFocus = null;

export function openDrawer(content) {
  const drawer = $('#drawer');
  const inner = $('#drawer-inner');
  const scrim = $('#scrim');

  lastFocus = document.activeElement;
  clear(inner);
  inner.append(content);
  drawer.hidden = false;
  scrim.hidden = false;
  drawer.scrollTop = 0;

  // Hold the page still behind the inspector. Reserve the scrollbar's width so
  // locking it does not shift the layout sideways.
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;

  const focusable = inner.querySelector('select, input, textarea, button');
  if (focusable) focusable.focus({ preventScroll: true });
}

export function closeDrawer() {
  $('#drawer').hidden = true;
  $('#scrim').hidden = true;
  clear($('#drawer-inner'));
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  lastFocus = null;
}

export function initDrawer() {
  $('#scrim').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer();
  });
}
