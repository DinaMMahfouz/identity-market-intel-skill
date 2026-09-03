# Battlegrounds — where these three actually compete

Load in MATRIX mode. This is commercial framing, not a source of facts. Treat
the *framing* as durable and the *facts* as perishable.

Every section carrying factual claims is stamped `verified: YYYY-MM-DD`. The
same 90-day staleness rule that governs matrix rows governs these stamps: past
90 days, say the section is stale before using it, and re-verify against Tier A
sources on the day before any of it reaches a customer.

---

## 1. The IdentityIQ migration window ★ highest-value opening

`verified: 2026-09-03`

**Situation.** SailPoint is actively
running a migration programme moving IdentityIQ customers to Identity Security
Cloud, with a free upgrade assessment programme it describes as roughly a
four-to-six week process. There is **no announced IdentityIQ end-of-life date**,
SailPoint continues to ship IIQ releases, and the installed base remains very
large. Third-party estimates put a typical enterprise IIQ→ISC migration at two
to three years with both platforms running in parallel.

**Why this is the opening.** A forced migration is a forced re-evaluation. An
IIQ customer being moved to a SaaS platform is, for the first time in years,
comparing architectures rather than renewing. That is the moment RSA is in the
conversation — particularly where the customer does not actually want SaaS.

**The three sub-segments, which need different answers:**

1. *Wants SaaS, will migrate* — RSA competes on G&L Cloud against ISC. Hard
   fight, fought on the D-series rows.
2. *Cannot go SaaS* (regulator, sovereignty, data residency, air gap) — this is
   the strongest RSA position in the entire market. The customer is being asked
   to move to a model their regulator or board will not accept. RSA on-prem plus
   G&L Cloud optionality directly answers it.
3. *Could go either way, hates the migration cost* — if they must re-implement
   anyway, the switching cost argument that normally protects the incumbent
   evaporates. Compete on total re-implementation cost, not on features.

**Do not overclaim.** No announced IIQ EOL means "migration pressure", not
"forced march". Saying SailPoint is killing IIQ is false and a customer with a
SailPoint AE in the room will catch it. Correct framing: *the migration is
happening, it takes years, and it opens an evaluation window.*

**Track:** any change to IIQ lifecycle/EOL statements. That would be the single
most significant competitive event in this market. Check the SailPoint EOL
policy pages every run.

---

## 2. Application onboarding cost — the row that decides implementations

The buyer question is never "how many connectors do you have". Every vendor
claims hundreds. The real question is: **what happens to the twenty apps that
aren't in anyone's catalog?**

Saviynt markets aggressive reductions in application onboarding time as a
headline differentiator. SailPoint invests heavily here too. Public practitioner
reviews of RSA G&L repeatedly cite custom-connector effort and associated
consultancy cost as a pain point — third-party observation, not verified fact,
and dated (much of that review corpus is from 2023 and earlier).

**How to fight this honestly:** don't argue the catalog count. Run the timed
test in matrix row B2 — one identical non-catalog application, onboarded in each
product, effort measured. If RSA wins, that is a `verified` row worth more than
any datasheet. If RSA loses, you need to know that before a customer tells you.

Refusing to run the test because the answer might be unwelcome is how a
competitive-intelligence function becomes marketing.

---

## 3. Machine and non-human identity

`verified: 2026-09-03`

The fastest-moving front. SailPoint has shipped AI-driven machine account
discovery and a dedicated machine identity capability line. Saviynt has
long-standing service-account and application-access governance positioning.

**Before conceding this row:** verify RSA's current NHI capability from RSA
sources, not from absence of a marketing page. **Before claiming it:** verify
it's shipped, not roadmap. This row is where overclaiming in both directions is
most likely.

Customer question to prepare for: *"How do you discover service accounts I
don't know about, and who owns them?"* — discovery, ownership attribution, and
lifecycle are three separate capabilities. Vendors blur them. Don't.

---

## 4. Low-end compression from Microsoft

Microsoft Entra ID Governance is bundled into enterprise agreements customers
already hold. It is not a full IGA replacement for complex hybrid estates, but
it is *good enough* for a growing band of mid-market and Microsoft-centric
customers, at a price no standalone IGA vendor can match.

This compresses everyone — RSA, SailPoint and Saviynt equally. The defensible
ground is heterogeneous estates: mainframe, SAP, custom apps, on-prem
directories, regulated on-prem requirements. Where a customer is genuinely
all-Microsoft, the honest answer is that Entra is a reasonable choice, and
saying so buys credibility for the cases where it isn't.

---

## 5. Sovereignty and data residency ★ structurally RSA-favourable

`verified: 2026-09-03`

Regulated and government customers in the Gulf, and increasingly in Europe,
face residency and sovereignty requirements that a US-headquartered SaaS-only
platform struggles to satisfy cleanly.

Saviynt is SaaS-only. SailPoint's on-prem answer is IdentityIQ — the product it
is actively migrating customers *off*. RSA can offer on-prem, hybrid, or G&L
Cloud.

This is the highest-leverage argument in the Saudi market specifically. See
`references/saudi-market.md`. It is also the argument most likely to be *assumed* rather
than evidenced — get the actual residency and hosting facts for each vendor's
current offering before using it.

---

## 6. Platform consolidation (MFA + IGA)

See matrix row D8. RSA's structural asset: it owns both the authentication
estate and the governance product. For a bank already running Authentication
Manager or ID Plus, one vendor, one support path, one commercial relationship.

Strong procurement argument. Becomes a strong *technical* argument only when you
can evidence real integration value. Don't conflate the two.

---

## 7. Ecosystem and developer gravity — likely a losing row, plan for it

SailPoint runs a public GitHub organisation with SDKs, a Terraform provider and
a CLI. Saviynt runs a public developer portal. Both have large public
practitioner communities. This produces a real effect: more people know the
product, more integrations exist, more implementation partners are available.

If a customer's evaluation criteria weight "ecosystem", RSA is likely behind.
The honest response is to reframe toward what the customer is actually buying —
outcomes, support model, regulatory fit — rather than to dispute a visible fact.
Disputing something the buyer can check on GitHub in thirty seconds costs more
credibility than the point is worth.

---

## 8. Analyst positioning

SailPoint and Saviynt both invest heavily in analyst relations. Buyers in
regulated sectors often use analyst quadrants as a shortlisting filter, which
means positioning can matter more than capability at the shortlist stage.

Practical implication: if RSA is not on a customer's analyst-derived shortlist,
the competitive argument has to happen *before* the shortlist is drawn — through
the incumbent MFA relationship, through sovereignty requirements written into
the RFP, or through the migration-window trigger in §1. Fighting on features
after the shortlist closes is fighting late.

---

## Rules for using this file

- Framing is durable; facts here are dated and perishable. Check the section
  `verified:` stamp before quoting anything from it.
- Never take a claim from this file to a customer without re-verifying it
  against Tier A sources on the day.
- Where RSA loses, say RSA loses. A battlecard that never concedes anything
  gets a practitioner caught out in the first technical workshop, and everything
  else on it stops being believed.
