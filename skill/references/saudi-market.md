# Saudi Arabia — Cybersecurity, AI and Identity Market

Load in SAUDI mode. Default timezone `Asia/Riyadh`.

Order of work: **regulators → tenders → channel → vendor moves.** Vendor press
releases last. Starting from vendor PR produces a newsletter; starting from
regulators and tenders produces intelligence.

---

## 1. Regulators — check these before anything else

| Authority | Domain | Watch for |
|---|---|---|
| National Cybersecurity Authority (NCA) | `nca.gov.sa` | ECC/CCC control frameworks, sector controls, compliance deadlines, updated versions of existing frameworks |
| Saudi Central Bank (SAMA) | `sama.gov.sa` | Cyber Security Framework, IT governance, outsourcing and cloud circulars — **directly binding on banking customers** |
| Saudi Data & AI Authority (SDAIA) | `sdaia.gov.sa` | PDPL and implementing regulations, AI ethics/governance, data classification |
| Digital Government Authority (DGA) | `dga.gov.sa` | digital government standards, platform requirements for public bodies |
| Communications, Space & Technology Commission (CST) | `cst.gov.sa` | cloud computing regulatory framework, licensing, data classification for cloud |

**Verify these domains on first run** and record the exact publication/news
page paths in `STATE_ROOT/sources.csv`. Root domains are stable; sub-paths move.

**How to report a regulatory item.** Authority · document title · publication
date · effective date · whom it binds · control or article reference where
practical · identity/IGA relevance · evidence level · link.

**Interpretation must be labelled.** This is market intelligence, not legal
advice. "The control appears to require X" is `REASONED INFERENCE`. Ambiguous
obligations stay ambiguous in the report.

**Why identity people should care:** access control, privileged access,
segregation of duties, logging, periodic access review, and data residency
appear as explicit controls in Saudi frameworks. Those map directly onto matrix
rows C2, C6, C9, A5 and A6. A regulatory clause that mandates periodic access
recertification is an IGA requirement written into law — that is a stronger
sales trigger than any product feature.

---

## 2. Public tenders — Etimad

Primary portal: **`tenders.etimad.sa`** (Etimad, operated under the Ministry of
Finance; the government tenders and procurement platform). Individual
government entities also publish tender pages linking back to Etimad; those
entity pages are often easier to read and worth checking for large accounts.

Search terms — run **both** English and Arabic:

```
identity governance · IAM · IGA · PAM · MFA · access management
cybersecurity · SOC · SIEM · MDR · zero trust · GRC
data security · cloud security · AI · digital transformation · managed security

الأمن السيبراني · إدارة الهوية · إدارة الوصول · الصلاحيات
الذكاء الاصطناعي · الحوكمة · المنافسة · مناقصة · كراسة الشروط
```

Arabic queries surface tenders that English queries miss entirely. Skipping them
is the most common coverage failure in this mode.

Record per tender: reference number · issuing entity · title (both languages) ·
publication date · deadline · status · disclosed value · scope · mandatory
standards · residency requirements · local-content requirements · named
products *only if the tender names them* · publicly disclosed bidders ·
publicly disclosed awardee · link.

**Bidder guardrail — absolute.** Never infer participation from partnership,
event attendance, sector strength, or an SI's product portfolio. Only:

```
Named bidder — publicly verified
Awardee — publicly verified
Potentially relevant vendor/partner — analyst inference, NOT a confirmed participant
```

Never assist with non-public procurement information, leaked documents,
competitor pricing, or anything resembling bid coordination. If a request drifts
that way, stop and say so.

---

## 3. Channel and partner mapping

Maintain `STATE_ROOT/partners.csv`, one row per partner, with — where publicly
verifiable — legal name · Saudi offices · classification (VAD / reseller / SI /
MSP / MSSP / consultancy) · identity vendors represented · cloud relationships ·
sectors · partner tier · managed-service capability · public customer evidence ·
relationship status · source · date.

Relationship status vocabulary — keep these distinct:

```
Vendor-declared partner
Partner-declared relationship
Mutually confirmed
Historic — current status unverified
```

An old event page naming two companies together is `Historic — unverified`. Not
a current relationship.

**Why this matters more than product news in this market.** In Saudi
public-sector and banking, deals route through a small set of local SIs and
distributors. Delivery capacity is often the binding constraint, not product
capability. A vendor with no local implementation partner loses tenders it could
technically win. Track partner capacity as seriously as you track releases.

---

## 4. Identity vendor watch

Track each run: **RSA · SailPoint · Saviynt · CyberArk · Okta · Microsoft Entra
· One Identity · Omada.** Add others when a material Saudi identity development
appears.

Per vendor: Saudi/regional presence · local partners and distributors · SI
delivery capacity · managed-service availability · residency/hosting story ·
publicly confirmed reference customers · product announcements with Saudi
relevance · regional hiring where strategically meaningful · tender signals.

**Do not declare a vendor "winning Saudi" from LinkedIn visibility.** Marketing
activity is not market share. Any momentum statement is `REASONED INFERENCE`
with the underlying facts cited.

---

## 5. Where RSA is structurally advantaged here

The residency and sovereignty argument (see `references/battlegrounds.md` §5) is at its
strongest in this market. Saviynt is SaaS-only. SailPoint's on-prem product is
the one it is migrating customers away from. RSA can offer on-prem, hybrid, or
G&L Cloud, and already holds authenticator estate in many Saudi banks and
government entities via SecurID and ID Plus.

That is the framing. **Get the facts before using it:** each vendor's current
hosting locations, each vendor's local partner bench, and what the specific
tender or regulator actually requires. The argument is strong precisely because
it is checkable — which means it fails badly if the checkable parts are wrong.

---

## 6. Saudi report structure

Regulatory signals → tender watch → channel changes → vendor moves → identity
vendor table → who appears to be gaining or losing (labelled inference, with the
underlying facts) → what to watch → what to study.

If nothing material happened, say so in one line per section. Padding a Saudi
report with generic Vision 2030 commentary is the failure mode to avoid.
