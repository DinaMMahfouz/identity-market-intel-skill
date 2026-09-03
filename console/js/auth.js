/**
 * Authentication.
 *
 * Magic-link only. Nothing here ever handles a password, so there is no
 * password to leak from a static bundle.
 *
 * Roles are assigned by the database, not by this file: a trigger on
 * auth.users writes public.profiles and grants `admin` to the configured
 * owner address. The client only *reads* the role, to decide what to render.
 * Every write is independently gated by RLS, so a tampered client gets a
 * policy violation rather than an escalated session.
 */
import { supabase } from './supabase-client.js';

/** @type {{user: object|null, profile: object|null}} */
export const session = { user: null, profile: null };

export const isAdmin = () => session.profile?.role === 'admin';

export async function sendMagicLink(email) {
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

async function loadProfile(user) {
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle();
  if (error) {
    console.warn('[auth] profile read failed:', error.message);
    return { id: user.id, email: user.email, role: 'viewer' };
  }
  // The signup trigger writes this row. If we got here before it committed,
  // fall back to the least privilege rather than assuming anything.
  return data ?? { id: user.id, email: user.email, role: 'viewer' };
}

/**
 * Subscribe to auth state. Fires immediately with the restored session,
 * then on every sign-in / sign-out / token refresh.
 * @param {(s: typeof session) => void} onChange
 */
export function watchAuth(onChange) {
  supabase.auth.onAuthStateChange(async (_event, s) => {
    session.user = s?.user ?? null;
    session.profile = await loadProfile(session.user);
    onChange(session);
  });

  // onAuthStateChange fires INITIAL_SESSION on its own, but getSession()
  // resolves the URL hash on a magic-link return before that lands.
  supabase.auth.getSession().then(async ({ data }) => {
    if (data.session?.user && !session.user) {
      session.user = data.session.user;
      session.profile = await loadProfile(session.user);
      onChange(session);
    }
  });
}

/** Strip the auth fragment so a refresh does not replay the token. */
export function cleanAuthUrl() {
  if (window.location.hash.includes('access_token') || window.location.search.includes('code=')) {
    history.replaceState({}, '', window.location.origin + window.location.pathname);
  }
}
