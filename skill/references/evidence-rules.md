# Evidence Rules

One page. If it takes seven pages, nobody follows it.

---

## Evidence levels

| Level | Meaning | May enter executive conclusions? |
|---|---|---|
| **A** | Official first-party technical source: product documentation, release notes, security advisory, lifecycle/EOL notice, API reference, official GitHub release, regulator publication, official tender portal, investor filing | Yes |
| **B** | Official company announcement, engineering blog, webinar, verified product-leader statement, **or** two independent credible sources agreeing | Yes |
| **C** | Credible partner, SI, analyst or practitioner source with partial confirmation | Yes, with the qualification stated inline |
| **D** | Forum, social, aggregator, SEO/training-vendor content, uncorroborated | **No.** Watchlist only |
| **E** | **Practitioner-verified (internal).** Verified by the analyst in a live or lab RSA environment, or against authenticated RSA Community content | Yes — **internal distribution only** |

## Why class E exists

Most authoritative RSA technical content sits behind login. Without class E,
every RSA cell in the capability matrix resolves to "insufficient evidence"
forever and the skill cannot do the one job it was built for.

Class E requires all four:

```
verified_by:      who
verified_date:    YYYY-MM-DD
version_tested:   exact product version/build
method:           lab test | authenticated documentation | internal engineering confirmation
```

Class E without a version is not class E. It's a memory.

---

## Distribution flag — on every finding

```
distribution: external   # public sources only; safe for customer-facing material
distribution: internal   # contains class E, authenticated, or RSA-confidential content
```

**Rules:**
- One internal fact makes the whole finding internal.
- An external output may not contain a single internal finding. Check before
  writing, not after.
- Class E may support an internal verdict in the matrix. It may not be quoted
  to a customer as though it were public.
- Customer names, deal detail, case content and internal roadmap never appear
  in an external output regardless of level.

---

## Evidence type — orthogonal to level

Every substantive statement is exactly one of:

```
VERIFIED FACT          authoritative or strongly corroborated
VENDOR CLAIM           vendor asserts it; no independent validation
THIRD-PARTY OBSERVATION credible external party reports it
REASONED INFERENCE     derived from facts, not stated by any source
UNCONFIRMED            insufficient evidence
CONFLICTING            credible sources disagree — say who says what
```

Prefix any REASONED INFERENCE in output with `**Inference:**`. Never blur it
into surrounding fact.

Vendor superlatives — *leader, first, only, largest, fastest, complete,
unified, autonomous, AI-powered* — are VENDOR CLAIM by default. Attribute them
to the vendor or drop them.

---

## The absence rule

> Never write "RSA does not support X" from a failed search.

Correct forms:

- `Possible gap — RSA validation required` + what would settle it
- `Unknown / insufficient current evidence`

Same rule applies symmetrically to SailPoint and Saviynt. Missing documentation
is a research gap, not a product gap. This is not politeness — it is the
difference between intelligence and guessing.

---

## Dates

Four distinct dates. Never collapse them.

```
publication_date   when the source was published or last edited
effective_date     when the change actually takes effect / becomes available
discovery_date     when this scan found it
first_seen         when it first entered state
```

A documentation page edited this week about a two-year-old feature is a
`publication_date` event and nothing else. If `effective_date` is unknown,
write `effective date not publicly specified` — do not substitute the
publication date.

---

## Finding schema — `STATE_ROOT/findings.jsonl`

```json
{
  "finding_id": "sp-isc-2026-09-03-connector-x",
  "mode": "scan",
  "vendor": "SailPoint | Saviynt | RSA | other",
  "product": "",
  "version": "",
  "classification": "",
  "status": "GA | staged-rollout | preview | roadmap | deprecated | EOS-announced | fixed | known-issue",
  "publication_date": "",
  "effective_date": "",
  "expiry_date": "",
  "discovery_date": "",
  "first_seen": "",
  "evidence_level": "A|B|C|D|E",
  "evidence_type": "verified-fact | vendor-claim | third-party-observation | reasoned-inference | unconfirmed | conflicting",
  "distribution": "internal | external",

  "verified_by": "",        // class E only — who verified it
  "verified_date": "",      // class E only — YYYY-MM-DD
  "version_tested": "",     // class E only — exact product version/build
  "method": "",             // class E only — lab test | authenticated documentation | internal engineering confirmation

  "canonical_source_url": "",
  "corroborating_urls": [],
  "technical_change": "",
  "who_is_affected": "",
  "implementation_impact": "",
  "matrix_rows_touched": ["B5"],
  "rsa_verdict": "",
  "action": "know | validate | test | ask-engineering | battlecard | monitor | ignore",
  "previously_reported": false,
  "material_change_since_last": ""
}
```

**The four `verified_*` / `method` fields are required when `evidence_level` is
`E`, and empty otherwise.** A finding claiming class E with any of them blank is
not class E — downgrade it to C, or to `Unknown / insufficient current evidence`.
This is what makes "class E without a version is a memory" enforceable rather
than aspirational.

`expiry_date` exists for deprecation notices — the date support actually drops.
Surface these again at T-90 days.

---

## Deduplication

Key on `vendor + product + normalised_title + effective_date`.

Normalise: strip URL tracking params, strip marketing title prefixes, map
renamed products to a canonical name (keeping the source's original term in
`notes`).

One release announced via blog + LinkedIn + three news sites + a partner repost
is **one finding**. Pick the first-party source as canonical.

Re-report an existing finding only when something material changed: preview →
GA, new region, patch issued, new known issue published, licensing changed,
deprecation expiry approaching, EOL date announced. Label it
`UPDATE TO PREVIOUSLY REPORTED ITEM` and state exactly what changed and nothing
else.

A page recrawled with identical content is not a change.
