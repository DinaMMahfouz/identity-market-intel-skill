# Identity Market Intel Console

A static web console for the `identity-market-intel` skill: the capability matrix
of RSA Governance & Lifecycle against SailPoint (ISC, IdentityIQ) and Saviynt
(EIC), the findings log, and the source registry.

No build step, no framework. Plain HTML, native ES modules, and the Supabase
JavaScript client from a CDN. Deployable to any static host.

---

## What it does

**Matrix** — 38 capability rows, grouped A–E. Each row carries the question a
customer actually asks, the position of each product, and a verdict drawn from a
nine-string controlled vocabulary. Rows go stale after 90 days and say so.

**Findings** — the scan log. Dated, sourced, deduplicated, with the evidence
class recorded per finding.

**Sources** — the registry, walked in tier order A → C. "Checked today" stamps
`last_checked` so source coverage can be reported honestly.

**Method** — the rules the database enforces, stated plainly.

### The tick wall

The header of the matrix is one tick per capability row, grouped A–E. Tall ticks
are the ten ★ rows that decide deals. Filled means a verdict backed by evidence
and a falsifier; hollow means unseeded; hatched means the verdict has gone stale.

Hollow ticks render at full presence rather than being hidden, because a matrix
that is mostly unseeded *is* the honest early state, and the failure this whole
tool exists to prevent is a guess getting quoted at a customer.

---

## Architecture

```
index.html            markup + the sign-in gate
css/console.css       one stylesheet, theme-aware (light/dark/system)
js/
  config.js           project URL, publishable key, controlled vocabularies
  supabase-client.js  the single shared client, imported from jsDelivr
  auth.js             magic-link sign-in; reads role, never grants it
  store.js            data access, cache, derived state (rowState, coverage)
  realtime.js         one channel, three tables
  drawer.js           the row inspector
  dom.js              element helpers, toasts, date maths
  views/
    matrix.js  findings.js  sources.js  method.js
  app.js              routing, theme, boot/teardown
data/matrix-seed.json demo dataset, generated from the skill's matrix-seed.csv
supabase/migrations/  the schema, verbatim
```

Views never touch Supabase directly. Everything goes through `store.js`, so a
local edit and a realtime event from another browser converge on one code path.

---

## Database

Project: `yiiegrgxycbrihlhpuba` (live-artifacts, eu-central-1).

| Table | Purpose |
|---|---|
| `imi_matrix_rows` | the capability matrix — 38 rows |
| `imi_findings` | scan findings |
| `imi_sources` | source registry |

It reuses infrastructure already present in the project rather than duplicating it:

- `public.profiles` — id, email, role
- `private.handle_new_user()` — trigger on `auth.users`; assigns `admin` to
  `dinamamdouhhh@gmail.com` on signup and `viewer` to everyone else
- `private.is_admin()` — `SECURITY DEFINER`, used by every policy

### Constraints that carry meaning

The skill's rules are enforced in Postgres, not just in the UI:

- `verdict` is a `CHECK` against the nine controlled-vocabulary strings. A
  paraphrase is rejected, so it cannot become a row nobody can filter for.
- `imi_matrix_verdict_requires_provenance` — a verdict requires a falsifier, a
  `last_verified` date and an evidence level. "A row without a falsifier is an
  opinion wearing a verdict's clothes," enforced.
- `imi_findings_class_e_provenance` — class E requires `verified_by`,
  `verified_date`, `version_tested` and `method`. Class E without a version is
  a memory.
- `imi_findings_class_e_internal` — class E is internal distribution, always.

### Row Level Security

Every table has RLS enabled. Policies are `to authenticated`, so an anonymous
visitor reads zero rows — verified, not assumed.

| | viewer | admin |
|---|---|---|
| read `external` rows | yes | yes |
| read `internal` rows | **no** | yes |
| write anything | no | yes |

The distribution rule is therefore structural. An internal-distribution row
cannot reach customer-facing material through this app, because the database
does not send it to a viewer — over REST or over the realtime socket, which is
subject to the same policies.

### Realtime

One channel, `postgres_changes` on all three tables, `REPLICA IDENTITY FULL` so
RLS can be evaluated against the old row on updates and deletes. A row changed
in another browser flashes in this one.

---

## Running it

Any static server. From the repository root:

```bash
python -m http.server 4331 --directory identity-intel-console
```

Then open <http://localhost:4331>.

ES modules require HTTP — opening `index.html` from the filesystem will not work.

## Deploying

Upload the directory as-is. No build, no environment variables, no server.

For the magic link to return people to the right place, add the deployed origin
to **Authentication → URL Configuration → Redirect URLs** in the Supabase
dashboard. `emailRedirectTo` is set to the page's own origin at runtime, so it
follows wherever you host it.

### About the key in `config.js`

`SUPABASE_PUBLISHABLE_KEY` is meant to ship in client code. It identifies the
project; it authorises nothing. Access is decided by RLS policies against the
signed-in identity. Never put the `service_role` key in this file — that one
bypasses RLS entirely.

## Signing in

Magic link only. Nothing in this codebase handles a password, so there is no
password to leak from a static bundle. The first sign-in from
`dinamamdouhhh@gmail.com` gets `admin` automatically via the database trigger;
everyone else gets `viewer` and read-only access to external rows.
