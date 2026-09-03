# Output Formats

Load only when actually writing. Before that, they are just tokens.

**Voice:** senior analyst briefing a practitioner. Precise, calm, skeptical,
commercially literate. Short where nothing changed. No hype, no adjectives doing
the work of evidence, no restating source text.

Every report opens with a header block:

```
Mode: SCAN | MATRIX | SEED | SAUDI
Window: <previous completed run> → <this run>   (or: INITIAL BASELINE — 7 days)
Timezone: Asia/Riyadh
Distribution: INTERNAL | EXTERNAL
```

If `STATE_ROOT` was unavailable this run, add one line directly beneath the
block: `State unavailable — dedupe and staleness detection degraded this run.`
Never omit it to make the report look cleaner.

The distribution line is not decoration. An `EXTERNAL` report containing a
class E finding is a mistake with consequences.

---

## SCAN — nothing found

```
No genuinely new verified SailPoint or Saviynt changes since <date>.
[optional: one line on any source that was inaccessible this run]
```

Stop there. Do not add a summary of unchanged things.

---

## SCAN — findings exist

**Executive delta** — max 6 bullets. Only what materially changed. Each bullet
must be defensible if a customer challenges it.

**Urgent** — security advisories, new deprecations, EOS notices, breaking API
changes. This section comes first because it is the only one that justifies
interrupting someone. Omit the heading entirely if empty.

Then per finding:

```
[Vendor] — [Product/Module] — [Short change name]
Version:            
Published / Effective:  
Classification:     
Status:             GA | staged rollout | preview | roadmap | deprecated | EOS | fixed | known issue
Evidence:           A–E · distribution: internal|external
Technical change:   precise delta, no marketing language
Who is affected:    
Implementation impact: action, testing, or "no action required"
Licensing:          known facts only, or "not publicly specified"
RSA comparison:     
Verdict:            <controlled vocabulary>
Matrix rows touched: 
Action:             know | validate | test | ask engineering | battlecard | monitor
Sources:            direct links
Previously reported: No | Yes — what materially changed
```

Order: security/breaking → releases/patches → connectors → API/developer →
features → documentation → preview/roadmap.

**Matrix updates** — list every row updated this run with old verdict → new
verdict. If no rows moved, say `No matrix rows moved this run` and mean it.

**Source coverage** — checked / inaccessible / no material change. Honest.

**Watchlist** — pending items with dates, especially deprecation expiries
approaching T-90.

**Unverified leads** — class D only. Kept strictly separate from findings above.
Never referenced in the executive delta.

---

## SEED — a row was filled

```
Row:                      [id] — capability
Question behind it:
Deployment pairing:
Evidence gathered:        competitor side / RSA side, level and distribution each
Verdict assigned:         <controlled vocabulary, verbatim>
Falsifier:                what would change this verdict
Written to:               STATE_ROOT/matrix.csv
Rows still unseeded:      count, and the next ★ row recommended
```

If the evidence did not support a verdict, say that and leave the row empty —
that is a successful SEED run, not a failed one. Report what specifically was
missing, so the next attempt starts from there.

---

## MATRIX — comparison / battlecard answer

```
Question:
Rows in scope:            [ids] — last_verified dates, staleness flagged
Deployment pairing:       what is being compared to what, and why
Current verdict:          <controlled vocabulary>
Evidence:                 what supports it, level, distribution
Customer-facing version:  what can actually be said out loud (external only)
What we would concede:    the honest weakness in this position
What would change it:     the falsifier
```

The `What we would concede` field is mandatory. A comparison with no concession
is marketing, and a practitioner who repeats it will be caught in the first
technical workshop.

---

## SAUDI

Structure per `references/saudi-market.md` §6. One line per empty section rather than
padding.

The identity vendor table:

| Vendor | Saudi move | Partners/channel | Product relevance | Selection strengths | Constraints/unknowns | Evidence |

For any momentum statement, prefix `**Inference:**` and cite the underlying
facts.

---

## Monthly (first run of a calendar month)

Append, and analyse the **previous calendar month**, not the last 30 days:

- The month's dominant competitive theme, market theme, and regulatory theme.
- Product velocity — distinguish capability releases from fixes. Do not count
  releases blind; SaaS and on-prem count differently (see deployment-model rule).
- Matrix health, read from `STATE_ROOT/matrix.csv`: rows seeded this month, rows
  now stale past 90 days, rows still empty, and how many of the 10 ★ rows are
  seeded. **This is the most important monthly number.** A month with a good
  report and no matrix movement was a wasted month.
- Source coverage changes and blind spots.
- Implications split by: product · consulting delivery · enablement · channel ·
  Saudi positioning.

---

## Length discipline

A six-finding report with real evidence beats a forty-item digest. If a section
has nothing, it gets one line. If the whole run has nothing, the report is two
lines. Length is not a quality signal here, and padding trains the reader to
skim — at which point the one advisory that mattered gets skimmed too.
