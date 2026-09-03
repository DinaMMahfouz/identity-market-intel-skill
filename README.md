# identity-market-intel

Competitive and market intelligence on **RSA Governance & Lifecycle** against
**SailPoint** (ISC, IdentityIQ) and **Saviynt** (EIC), plus the Saudi Arabia
cybersecurity, AI and public-tender landscape.

Two things live here: the Claude Code skill that does the analysis, and a static
web console that holds its output.

```
skill/     the identity-market-intel Claude Code skill
console/   static web console — HTML + ES modules + Supabase
```

---

## The idea

The job is not to summarise vendor news. It is to maintain one durable asset — a
defensible capability matrix — and keep it current with dated, sourced evidence.

**Reports are disposable. The matrix is the product.**

Which means the interesting engineering is all about *epistemic honesty*: making
the difference between "we verified this" and "we are guessing" impossible to
miss, and impossible to accidentally launder into a customer conversation.

---

## `skill/`

A Claude Code skill with four modes:

| Mode | For |
|---|---|
| **SCAN** | what changed with SailPoint or Saviynt since the last run |
| **MATRIX** | where we win, where we lose, battlecard and objection material |
| **SEED** | filling a matrix row with actual evidence |
| **SAUDI** | regulators (NCA, SAMA, SDAIA, DGA, CST), Etimad tenders, channel |

Install it by copying `skill/` to `~/.claude/skills/identity-market-intel/`.
State lives outside the skill folder, at `~/.claude/identity-market-intel/`, so
reinstalling never destroys accumulated work.

### The rules it enforces

- **Deployment-model normalisation.** Compare G&L on-prem to IdentityIQ, and G&L
  Cloud to ISC or EIC. A gap caused by deployment model is an artefact, not a
  capability gap.
- **Absence of RSA public evidence is not an RSA gap.** A failed search produces
  `Possible gap — RSA validation required`, never "RSA does not support X".
- **Practitioner evidence is real, but internal.** Class E is admissible and
  never customer-facing.
- **Date discipline.** Publication date is not effective date. Rows go stale at
  90 days and say so.
- **Silence is a valid output.** A no-change scan is a successful scan.

---

## `console/`

A static site — no build step, no framework — that reads and writes the matrix.

Plain HTML, native ES modules, and the Supabase JavaScript client from a CDN.
Magic-link authentication, PostgreSQL persistence, Row Level Security, realtime
sync, and automatic admin assignment on first sign-in.

The skill's rules are enforced as **database constraints**, not UI conventions:

- `verdict` is a `CHECK` against nine controlled-vocabulary strings — a
  paraphrase is rejected.
- A verdict requires a falsifier, a date and an evidence level. *A row without a
  falsifier is an opinion wearing a verdict's clothes*, enforced in Postgres.
- Class E requires who verified it, when, which build, and by what method.
- Class E is internal distribution, always.
- RLS hides internal-distribution rows from viewer accounts, over REST and over
  the realtime socket alike.

See [`console/README.md`](console/README.md) for the schema, the policies and
deployment.

### The tick wall

The header of the matrix is one tick per capability row, grouped A–E. Tall ticks
are the ten ★ rows that decide deals. Filled means evidenced; hollow means
unseeded; hatched means stale.

Hollow ticks render at full height rather than being hidden, because a matrix
that is mostly unseeded *is* the honest early state — and the failure this whole
thing exists to prevent is a guess getting quoted at a customer.

---

## Status

38 capability rows. Two carry a verdict. Thirty-six are deliberately empty.

That is not an unfinished project; it is the starting state the method requires.
A matrix pre-filled with guesses is worse than an empty one, because the guesses
get quoted.
