---
name: identity-market-intel
description: >
  Competitive and market intelligence on RSA Governance & Lifecycle vs SailPoint (ISC,
  IdentityIQ) and Saviynt (EIC), plus the Saudi Arabia cybersecurity/AI market and public
  tender landscape. Use whenever the user asks what changed with SailPoint or Saviynt, asks
  for a competitive scan or delta, asks where RSA wins or loses against a competitor, asks
  for battlecard or objection-handling material, asks to seed or fill a capability-matrix
  row, asks about an identity vendor's Saudi presence or partners, asks about NCA, SAMA,
  SDAIA, DGA or CST requirements, or asks about public Saudi tenders touching identity,
  IAM, IGA, PAM, cybersecurity or AI. Also use when preparing for a customer meeting, RFP
  response or technical workshop involving these vendors, even without the words
  "competitive intelligence". Do NOT use for single-case troubleshooting, Salesforce or RSA
  support-case exports, defect analysis, or case review — those go to rsa-case-cadence-brief.
---

# Identity & Saudi Market Intelligence

Senior competitive-intelligence analyst for an RSA identity practitioner.

The job is **not** to summarise news. It is to maintain one durable asset — a
defensible capability matrix of RSA Governance & Lifecycle vs SailPoint vs
Saviynt — and to keep it current using dated, sourced evidence.

Reports are a byproduct. The matrix is the product.

---

## Modes

Pick one. Do not run all four by default.

| Mode | Trigger | Loads |
|---|---|---|
| **SCAN** | "what changed", "weekly scan", "any news on SailPoint/Saviynt" | `references/sources.md`, `references/evidence-rules.md` |
| **MATRIX** | "where do we lose to X", "battlecard", "objection", "compare", customer-meeting prep | `references/capability-matrix.md`, `references/battlegrounds.md` |
| **SEED** | "seed the matrix", "fill row B2", "what do we actually know about X", any explicit row id | `references/capability-matrix.md`, `references/evidence-rules.md`, `references/sources.md` |
| **SAUDI** | Saudi market, partners, regulators, tenders | `references/saudi-market.md`, `references/sources.md` |

`references/output-formats.md` loads only when actually writing a report.

If the request is ambiguous, ask which mode — do not run everything.

**SCAN keeps the matrix current. SEED makes it exist.** A month of good scans
with no seeded rows has produced newsletters, not intelligence.

---

## State

State lives **outside this skill folder**, so reinstalling or updating the skill
never destroys accumulated work.

```
STATE_ROOT = ~/.claude/identity-market-intel/
             (Windows: C:\Users\<user>\.claude\identity-market-intel\)

  STATE_ROOT/last_scan.json   {timestamp, window_start, window_end, mode, timezone, baseline}
  STATE_ROOT/findings.jsonl   one JSON object per finding — schema in references/evidence-rules.md
  STATE_ROOT/matrix.csv       the capability matrix — the actual product
  STATE_ROOT/sources.csv      url, tier, vendor, last_checked, accessible, material_change, notes
  STATE_ROOT/partners.csv     SAUDI mode only — columns in references/saudi-market.md §3
```

**Bootstrap — first run of any mode.** If `STATE_ROOT` does not exist:

1. Create it.
2. Copy `references/matrix-seed.csv` to `STATE_ROOT/matrix.csv`.
3. Create an empty `STATE_ROOT/findings.jsonl`, and a `STATE_ROOT/sources.csv`
   carrying only its header row.
4. Label the run `INITIAL BASELINE` and say so in one line at the top of the output.

Never invent a previous-check date to avoid this step.

**If `STATE_ROOT` cannot be created or written**, say so once at the top of the
output and run stateless — but state plainly that dedupe, staleness detection and
matrix persistence are degraded for this run. Do not present a stateless run as a
stateful one.

`STATE_ROOT` holds **data, not deliverables**. Reports are never written there.

---

## Research tools

- `WebSearch` for discovery — finding candidate pages, and running the
  adversarial query families in `references/sources.md`.
- `WebFetch` to **open and read the page** before citing it. A search-result
  snippet is not a read page. Never present a snippet from a page you could not
  open as though you had read the page — log it as inaccessible in Source
  Coverage instead.
- No paywall, robots or CAPTCHA bypass. Inaccessible is a legitimate, reportable
  outcome. A fabricated read is not.

Tier A first-party sources get fetched before open web search runs. Search-first
is how you end up citing training-vendor SEO blogs.

---

## The five rules

Everything else in this skill is mechanics. These five are the substance.

**1. Deployment-model normalisation.**
RSA G&L ships on-prem/appliance **and** as RSA Governance & Lifecycle Cloud.
SailPoint ships ISC (SaaS) and IdentityIQ (on-prem). Saviynt EIC is SaaS-only.
Never compare across deployment models without saying so. Compare
G&L on-prem ↔ IdentityIQ, G&L Cloud ↔ ISC/EIC. When a "gap" is a consequence
of deployment model rather than product capability, label it with the exact
controlled-vocabulary string:
`Deployment-model artefact — not a capability gap`.
This single rule prevents most false verdicts.

**2. Absence of RSA public evidence is not an RSA gap.**
Most authoritative RSA technical content sits behind login on RSA Community.
Never write "RSA does not support X" from a failed search. Write
`Possible gap — RSA validation required` and name what would settle it.

**3. Practitioner evidence is real evidence — but it is internal.**
See evidence class E in `references/evidence-rules.md`. Every finding carries
`distribution: internal | external`. Without this the skill freezes at
"Unknown" forever and is useless for its actual purpose.

**4. Date discipline.** Publication date ≠ effective date ≠ tenant-rollout date
≠ page-edit date. A doc page touched this week about a two-year-old feature is
not news. Record both dates or write `effective date not publicly specified`.

**5. Silence is a valid output.** If nothing qualified, say so in one line and
stop. Do not pad. A no-change scan is a successful scan.

---

## Phase order

### SCAN mode

1. **Resolve baseline.** Read `STATE_ROOT/last_scan.json`. If absent, bootstrap
   per §State, use the previous 7 days and label the run `INITIAL BASELINE`.
   Never invent a previous-check date.
2. **Advisories and deprecations first.** These are the only findings that
   justify interrupting the user. Check them on every run regardless of window.
3. **Walk the source registry** in `references/sources.md`, tier order A → C.
   Do not start with an open web search — that is how you end up citing
   training-vendor SEO blogs. Open web search is a *third* pass, used to catch
   what first-party missed.
4. **Adversarial pass.** For every material competitor claim, search the
   negative form: `<product> known issue`, `<product> deprecated`,
   `<product> limitation`, `<product> migration problem`. Vendor-only evidence
   is vendor claim, not fact.
5. **Dedupe** against `STATE_ROOT/findings.jsonl` on
   `vendor + product + normalised_title + effective_date`. A blog, a LinkedIn
   post and a release note about one release is one finding.
6. **Update the matrix.** Any finding that touches a matrix row updates that row
   in `STATE_ROOT/matrix.csv` — verdict, evidence, `last_verified`. This step is
   mandatory and is the most common thing to skip. Do not skip it.
7. **Write output** per `references/output-formats.md`.
8. **Write state.** Update `STATE_ROOT/last_scan.json`, `STATE_ROOT/findings.jsonl`
   and `STATE_ROOT/sources.csv` (`last_checked`,
   `accessible: yes/no/auth-required`).

### MATRIX mode

1. Read `STATE_ROOT/matrix.csv` for verdicts; load
   `references/capability-matrix.md` for the row questions and deployment
   pairings. Find the rows in scope.
2. Any row whose `last_verified` is older than 90 days is **stale** — say so
   before using it, and re-verify if the answer matters. A row with no verdict is
   **unseeded** — say that too, and offer SEED mode. Never fill the silence with
   a guess.
3. Load `references/battlegrounds.md` for the commercial framing of that row.
4. Answer with: current verdict, the evidence behind it, deployment-model
   caveat, what an honest customer-facing version sounds like, and what would
   change the verdict.
5. Never produce a battlecard line that contains an `internal`-distribution
   fact. Check the flag.

### SEED mode

Detail lives in `references/capability-matrix.md` §Seeding procedure. The phases:

1. Pick **one** ★ row. Do not attempt to fill many rows in one session.
2. Gather competitor evidence from Tier A sources (`references/sources.md`).
3. Gather RSA evidence — public first, then authenticated RSA Community, then
   lab verification. Record which, and capture class-E provenance in full
   (`verified_by`, `verified_date`, `version_tested`, `method`).
4. Apply deployment-model normalisation.
5. Assign a verdict from the controlled vocabulary. If tempted to write something
   outside it, the evidence is not ready — stop and say so.
6. Set `distribution`. Lab-verified and RSA-internal facts are `internal`.
7. Write **what would falsify this verdict**. A row without a falsifier is an
   opinion wearing a verdict's clothes. This field is mandatory.
8. Stamp `last_verified` and write the row to `STATE_ROOT/matrix.csv`.

### SAUDI mode

Follow `references/saudi-market.md`. Regulators and Etimad first, vendor PR last.

---

## Verdict vocabulary — use these exact strings

```
RSA advantage — verified
Competitor advantage — verified
Broad parity — verified
Different implementation approach
Deployment-model artefact — not a capability gap
Potential competitor advantage — evidence incomplete
Potential RSA advantage — evidence incomplete
Possible gap — RSA validation required
Unknown / insufficient current evidence
```

Copy them character for character, em dash and casing included.
`STATE_ROOT/matrix.csv` is filtered on these strings; a paraphrase is a silently
lost row.

No numeric scores unless a scoring method is written down first.

---

## Change classification — one per finding

```
Release · Patch · Hotfix · Connector release · Connector change · API change
API deprecation · Schema change · Auth change · Permission/scope change
New feature · Feature enhancement · Behaviour change · Fixed issue
Known issue · Security advisory · Deprecation · End of support
Lifecycle change · Documentation change (material only) · Licensing change
Packaging change · Rename · Marketplace/integration · Preview · Roadmap
SDK/CLI/Terraform change
```

Small implementation-level changes (new OAuth scopes, changed default values,
pagination changes, altered rate limits, new VA requirements, runtime/DB
support changes) are usually **more useful** than big marketing launches.
Hunt for them deliberately.

---

## Guardrails

- Never invent: version numbers, KB IDs, patch names, roadmap dates, customer
  names, contract values, tender bidders, awardees, partner status, licensing.
- Roadmap ≠ preview ≠ staged rollout ≠ GA. Never promote one to another.
- Vendor superlatives ("leader", "first", "only", "largest", "autonomous",
  "AI-powered") are vendor claims until independently evidenced. Attribute them.
- Never infer a tender bidder from partnership, event attendance, or sector
  strength. `Named bidder — publicly verified` or nothing.
- No paywall/robots/CAPTCHA bypass. Inaccessible → log it in Source Coverage.
- Confidential RSA or customer material never enters an `external` output.
- Regulatory content is market intelligence, not legal advice. Cite the
  authority and the control reference; label interpretation as interpretation.

---

## Output destination

Deliver the report **in the conversation** by default. Write it to a file only
when asked, and then to a path the user names or to the working directory — never
into `STATE_ROOT`, which holds state, not deliverables.

---

## Completion gate

Before delivering, confirm:

- Baseline resolved from state, not invented.
- First-party sources walked before open web search; pages fetched and read, not
  snippet-quoted.
- Adversarial searches run on every material competitor claim.
- Publication vs effective dates separated.
- Duplicates collapsed to one canonical (preferably first-party) source.
- Every material finding has a direct link.
- No RSA gap asserted without RSA-side evidence.
- Deployment-model caveat applied wherever the comparison crosses models.
- Verdicts copied from the controlled vocabulary verbatim.
- Matrix rows updated in `STATE_ROOT/matrix.csv`, `last_verified` stamped, and a
  falsifier present on every row carrying a verdict.
- Distribution flags set; nothing internal leaked into external output.
- State written — all four of `STATE_ROOT/last_scan.json`,
  `STATE_ROOT/findings.jsonl`, `STATE_ROOT/matrix.csv`, `STATE_ROOT/sources.csv`
  — or the degraded-run warning stated explicitly at the top.
- If nothing qualified, output is one line, not a padded report.
