# Capability Matrix — RSA G&L vs SailPoint vs Saviynt

**The matrix is the asset.** Reports are disposable; the matrix compounds.

**This file holds questions and method. It never holds answers.**
Verdicts live in exactly one place — `STATE_ROOT/matrix.csv` — so that a row can
be updated, dated and expired by the skill's own discipline. A verdict written
into this file is a verdict nothing can ever refresh, and it will still be
getting quoted at a customer two years after it stopped being true.

Rows ship **unseeded**. A matrix pre-filled with guesses is worse than an empty
one, because the guesses get quoted in front of customers. Each row below states
the *question a customer actually asks* and the *deployment pairing*. Fill them
as evidence arrives — from SCAN runs, from lab work, from RSA internal sources.

`references/matrix-seed.csv` is the starting state, copied to
`STATE_ROOT/matrix.csv` on first run. Two rows arrive carrying a verdict (A1 and
D8); the other 36 arrive empty, deliberately.

## Row schema — the columns of `STATE_ROOT/matrix.csv`

```
id · priority (star = deal-deciding) · capability · question · pairing
sailpoint_isc · sailpoint_iiq · saviynt_eic · rsa_gl
verdict (controlled vocabulary — copy verbatim from SKILL.md)
evidence_level (A–E) · distribution (internal|external)
last_verified (YYYY-MM-DD) · sources · falsifier · notes
```

`falsifier` is not optional. See §Seeding procedure step 7.

**Staleness: 90 days.** A row older than that is stale. Say so before using it.

**Target: the 10 ★ rows seeded before this skill is trusted in front of a
customer.** They are the ones that actually decide deals. 38 rows exist; seeding
all of them is not the goal and never will be.

---

## A. Architecture & deployment

| id | Capability | The question behind it | Pairing |
|---|---|---|---|
| A1 ★ | Deployment models offered | "Can I run this without sending identity data to a vendor cloud?" | all three |
| A2 | Scale ceiling / clustering | "Will it hold at N million identities, active-active?" | on-prem ↔ IIQ |
| A3 | Upgrade & maintenance burden | "Who does the upgrade, how often, what's the regression cost?" | model-split |
| A4 | Release velocity | "How fast do I get new capability?" | **artefact-prone** |
| A5 | Data residency options | "Where does my identity data physically sit?" | cloud ↔ cloud |
| A6 | Air-gapped / sovereign deployment | "Can this run disconnected for a regulated or defence customer?" | on-prem only |

**A1 — arrives seeded.** Verdict, evidence and falsifier are in
`STATE_ROOT/matrix.csv`; read them there, not from here. The framing that does
not change: RSA's claim is one product with two deployment targets, SailPoint's
is two products with a migration path between them, Saviynt's is one SaaS
product. **Verify before quoting** whether G&L Cloud and on-prem are truly
feature-identical at the current release — "same features" is a vendor claim on
all sides, RSA's included.

**A4 — pre-emptive warning.** SaaS products ship continuously; on-prem ships in
releases. Comparing raw release counts is the classic false verdict. Mark
`Deployment-model artefact` unless you are comparing G&L Cloud to ISC/EIC.

---

## B. Connectivity — where implementations actually live or die

| id | Capability | The question behind it |
|---|---|---|
| B1 ★ | Out-of-box connector breadth | "Is my app on the list?" |
| B2 ★ | Custom connector effort | "What does it cost me to onboard the app that *isn't* on the list?" |
| B3 | Aggregation model & performance | "How long is a full aggregation on my largest source?" |
| B4 | Provisioning / fulfilment architecture | RSA AFX ↔ SailPoint provisioning ↔ Saviynt |
| B5 ★ | Connector deprecation exposure | "What's being removed, and when?" |
| B6 | Agent / VA / on-prem component footprint | "How many boxes do I run, and who patches them?" |
| B7 | Reconciliation & correlation behaviour | |

**B2 is the row that wins or loses more deals than any other.** Public reviews
of RSA G&L repeatedly raise custom-connector effort and associated consultancy
cost as a weakness — that is *third-party observation*, not verified fact, and
it is exactly the objection to prepare for. Do not dismiss it; measure it. The
honest counter is a timed, evidenced comparison of onboarding one identical
non-catalog application in each product. See `references/battlegrounds.md` §2.

**B5 is trackable and dated** — see the SailPoint deprecation clock in
`references/sources.md`. This is a row that can be kept genuinely current with low effort.

---

## C. Governance core

| id | Capability | Note |
|---|---|---|
| C1 | Access request & approval workflow | |
| C2 ★ | Certification / access review campaigns | RSA's historical strength area — verify, don't assume |
| C3 | Reviewer experience & campaign completion rate | RSA markets gamification here — vendor claim until evidenced |
| C4 | Role modelling (RBAC) | |
| C5 | Role mining | |
| C6 | SoD policy & violation handling | |
| C7 | Entitlement data model depth | RSA's Aveksa-lineage modelling — a plausible structural strength, needs evidence |
| C8 | Policy engine | |
| C9 | Reporting, dashboards, audit trail | |

---

## D. The 2026 battlegrounds — where the market is actually moving

| id | Capability | Why it matters now |
|---|---|---|
| D1 ★ | Machine / non-human identity governance | SailPoint has shipped AI-driven machine-account discovery and dedicated machine identity capability; verify current RSA position before conceding or claiming |
| D2 ★ | AI-assisted access decisions / recommendations | all three market this; separate shipped feature from slideware |
| D3 | Identity security posture management (ISPM) | RSA markets ISPM within G&L — verify scope |
| D4 | Cloud infrastructure entitlements (CIEM) | |
| D5 | Non-employee / third-party identity | |
| D6 | Data access governance | |
| D7 | Agentic-AI identity | newest front; mostly roadmap everywhere — say so |
| D8 ★ | MFA + IGA convergence in one vendor | **structurally RSA-favourable** — see below |

**D8 — arrives seeded, directional.** Verdict and falsifier live in
`STATE_ROOT/matrix.csv`. The durable framing: RSA sells authentication (SecurID,
ID Plus) and governance (G&L) as one platform, while SailPoint and Saviynt own no
authenticator estate and must partner for MFA. For a customer already running RSA
Authentication Manager or ID Plus — the typical regulated-bank profile — that is
a real consolidation argument.

Two products from one vendor is a **procurement** argument, not yet a technical
one. This is the most tempting row in the matrix to overclaim. Do not.

---

## E. Ecosystem & commercial

| id | Capability |
|---|---|
| E1 | Public API surface & quality |
| E2 | Event/webhook model |
| E3 | SDK / CLI / Terraform / IaC support |
| E4 | Developer community size and activity |
| E5 ★ | Implementation partner availability (globally and in-region) |
| E6 | Licensing & packaging transparency |
| E7 | Analyst positioning |
| E8 ★ | Migration path *into* the product from a competitor |

**E3 and E4 are likely competitor-advantage rows.** SailPoint runs a public
GitHub org with SDKs, a Terraform provider and a CLI; Saviynt runs a public
developer portal repo. Verify RSA's public equivalent before writing a verdict —
absence of a public GitHub org is *evidence about ecosystem*, not evidence about
product capability. Keep those two claims separate; conflating them is the most
common analytical error in this whole domain.

**E8 is the commercial reason this matrix exists.** See `references/battlegrounds.md` §1.

---

## Seeding procedure

Do not try to fill 40 rows at once. Per session:

1. Pick one ★ row — `priority = star` in the CSV.
2. Gather competitor evidence from Tier A sources (`references/sources.md`).
3. Gather RSA evidence — public first, then authenticated RSA Community, then
   lab verification. Record which. Class E requires `verified_by`,
   `verified_date`, `version_tested` and `method` in full; without all four it is
   not class E (`references/evidence-rules.md`).
4. Apply deployment-model normalisation.
5. Assign a verdict from the controlled vocabulary, copied character for
   character. If tempted to write something outside it, the evidence is not
   ready — say so and leave the row empty.
6. Set `distribution`. Lab-verified and RSA-internal facts are `internal`.
7. Write **what would falsify this verdict**. A row without a falsifier is an
   opinion wearing a verdict's clothes. Mandatory — the row is not finished
   without it.
8. Stamp `last_verified` and write the row to `STATE_ROOT/matrix.csv`.

## Anti-patterns

- Filling a row from a vendor comparison page. Vendors' competitor pages are
  marketing, Tier D in disguise.
- Filling an RSA cell from a failed search → always `Possible gap — RSA
  validation required`.
- Letting a `verified` verdict sit past 90 days unchallenged.
- Copying an `internal` row into a customer deck. Check the flag every time.
- Writing a verdict into *this* file instead of `STATE_ROOT/matrix.csv`. Nothing
  will ever refresh it, and nothing will ever flag it as stale.
- Paraphrasing a verdict string. The CSV is filtered on the exact strings.
