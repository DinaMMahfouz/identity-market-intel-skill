# Source Registry

Walk these in tier order. Open web search is the **last** pass, not the first.

Use `WebFetch` to open each source and read it. `WebSearch` is for discovery
only — finding candidate pages and running the adversarial query families below.
A search-result snippet is not a read page.

Legend — `Access`: `open` = publicly readable · `partial` = index readable,
attachments/detail need login · `auth` = login required · `unknown` = not yet
tested. Update `STATE_ROOT/sources.csv` with real results on every run.

---

## Tier A — first-party authoritative

### SailPoint

| Source | URL | Access | What it gives |
|---|---|---|---|
| Product documentation | `https://documentation.sailpoint.com` | open | ISC + IIQ docs, connector guides, upgrade considerations, EOL policy pages |
| Community / Compass | `https://community.sailpoint.com` | partial | connector directory, support policies, release discussion, CSE FAQ |
| Connector support policy | `https://community.sailpoint.com/t5/Connector-Directory/SailPoint-Support-Policy-for-Connectivity/ta-p/79422` | open | **high value** — the deprecation clock (see below) |
| Developer portal | `https://developer.sailpoint.com` | open | API reference, changelog, SDKs, CLI, event triggers |
| Official GitHub | `https://github.com/sailpoint-oss` | open | SDK releases, Terraform provider, CLI, sample code — often the *earliest* signal of an API change |
| Corporate blog / press | `https://www.sailpoint.com/blog` | open | GA announcements, quarterly capability rollups |
| Investor relations | search `SailPoint SAIL investor relations` | open | listed company — filings and earnings calls carry roadmap and segment signal |

**The deprecation clock — track this every run.** SailPoint's published
connectivity support policy gives customers 12 months' notice after a
deprecation announcement before support is dropped. In IdentityIQ the connector
stops shipping in the next release after that notice period; in ISC the source
is pulled from the UI immediately to block new deployments while existing
instances keep running for the remainder of the 12 months, then the code is
removed. Separately, on-prem ISC components such as IQService must be updated
within 90 days of a new release to stay supported.

Why this matters: every deprecation announcement is a **dated, predictable
displacement event** with a known expiry. It is the single most actionable
recurring signal in this whole skill. Log each one with its expiry date into
`STATE_ROOT/findings.jsonl` and surface it again at T-90 days.

### Saviynt

| Source | URL | Access | What it gives |
|---|---|---|---|
| Documentation + release notes | `https://docs.saviyntcloud.com` | open | EIC docs; release communication bundle is the canonical release index |
| Release communication | `https://docs.saviyntcloud.com/bundle/Release-Notes/page/Content/Saviynt-Release-Communication.htm` | open | version/release mapping — verified live |
| Developer portal | `https://developers.saviynt.com` | open | REST API reference, OpenAPI specs |
| Forums | `https://forums.saviynt.com` | partial | practitioner-level truth about what actually breaks; strong for known issues |
| Official GitHub | `https://github.com/saviynt` | open | developer-portal repo, SDKs, integration code |
| Corporate blog / press | `https://saviynt.com` | open | GA announcements, funding, positioning |

Saviynt is private, so there is no filings channel. Funding and valuation news
is therefore third-party only — treat accordingly.

### RSA

| Source | URL | Access | What it gives |
|---|---|---|---|
| G&L documentation index | `https://community.rsa.com/s/rsa-gov-and-lifecycle-documentation/documentation` | partial | doc tree and dated titles are readable without login; **PDF attachments require login** |
| RSA Community root | `https://community.rsa.com` | partial | Release Notes, Collectors, Connectors, Advanced Dashboards, Community Exchange |
| Product Life Cycle | `https://community.rsa.com` → Product Life Cycle | partial | EOL/EOS dates — needed to answer support-window questions honestly |
| Product page | `https://www.rsa.com/products/governance-lifecycle/` | open | current official positioning and feature naming |

**Naming.** The current product is **RSA Governance & Lifecycle**, positioned as
part of the **RSA Unified Identity Platform** (authentication, access,
governance, lifecycle and identity intelligence together). It ships in both
on-premises and **RSA Governance & Lifecycle Cloud** form, which RSA positions as
delivering the same feature set across cloud, hybrid and on-prem.

Legacy names still in circulation and worth using as *search aliases only*:
`RSA Identity Governance & Lifecycle`, `RSA IGL`, `SecurID Governance &
Lifecycle`, `RSA Aveksa`, `AveksaAdmin`. Doc titles on RSA Community mix these
freely — search all of them or you will miss material.

**Version note:** documentation titles observed on the RSA Community index run
through the 8.0.0 line. Do not state a "current version" without checking the
Release Notes branch on that day — versions move and this file goes stale.

### Adjacent vendors — check only when in scope

Microsoft Entra ID Governance, Okta Identity Governance, CyberArk, One Identity,
Omada. Use their own docs/release-note domains. These matter mostly for the
Saudi mode and for the low-end compression battleground.

---

## Tier B — strong contextual

- Vendor engineering blogs, webinars, conference sessions (SailPoint Navigate,
  Saviynt CONVERGE), official YouTube channels.
- Verified product-leader posts on LinkedIn. **Discovery only.** A VP post is
  not product documentation. Never infer a customer win from a like or comment.
- Cloud marketplace listings (AWS/Azure/GCP) — good for availability and
  packaging signal, and for regional availability in the Saudi mode.

---

## Tier C — credible third party

Recognised implementation partners and SIs, established security publications,
analyst coverage, practitioner technical walkthroughs with reproducible detail.

Useful because they publish what vendors won't: real onboarding effort, real
connector pain, real migration duration.

---

## Tier D — discovery only, never sole evidence

Anonymous forums, Reddit, repost aggregators, unsourced social, SEO pages,
AI-generated summary sites.

**Explicitly named because they dominate these search results:**
certification and training-vendor blogs (`*academy*`, `*training*`,
`*certification*` domains publishing "SailPoint X vs Y in 2026" content). They
are confidently wrong about dates, versions and EOL status, and they rank
highly. A Tier D source can raise a question. It can never answer one.

---

## Query families

**Product delta**
```
"Identity Security Cloud" release notes <month year>
IdentityIQ patch 8.x
site:developer.sailpoint.com changelog
site:github.com/sailpoint-oss releases
site:docs.saviyntcloud.com release notes <year>
Saviynt EIC known issues <version>
```

**Implementation-level (highest value, lowest volume)**
Combine product with: `connector` · `aggregation` · `provisioning` · `schema` ·
`scope` · `OAuth` · `rate limit` · `pagination` · `deprecated` · `breaking
change` · `end of support` · `IQService` · `virtual appliance` · `known issue`

**Adversarial — mandatory**
```
<product> limitation
<product> known issue
<product> migration problem
<product> connector not supported
<product> licensing change complaint
```

**Saudi** — see `references/saudi-market.md`.

---

## Source coverage logging

Every run, record for each source touched in `STATE_ROOT/sources.csv`:
`last_checked`, `accessible` (`yes` / `no` / `auth-required`), `material_change`
(y/n). Report inaccessible sources honestly in the output.

**Never present a search snippet from a page you could not open as though you
read the page.** If `WebFetch` failed, or the content sat behind a login, that is
the finding: log it as `auth-required` and say so in Source Coverage. An honest
gap is usable intelligence. A fabricated read is not, and it is unrecoverable —
once one citation turns out to be invented, every other one has to be
re-checked by hand.
