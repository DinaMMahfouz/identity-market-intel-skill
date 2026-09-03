-- Identity Market Intel console: schema.
-- Additive only. Reuses the existing public.profiles + private.is_admin()
-- + private.handle_new_user() infrastructure already in this project.

-- Controlled verdict vocabulary, enforced at the database boundary so a
-- paraphrased verdict cannot enter the matrix. Mirrors SKILL.md.
create table if not exists public.imi_matrix_rows (
  id              text primary key,
  section         text not null generated always as (substring(id from 1 for 1)) stored,
  priority        text not null default '' check (priority in ('', 'star')),
  capability      text not null,
  question        text not null,
  pairing         text not null default '',
  sailpoint_isc   text not null default '',
  sailpoint_iiq   text not null default '',
  saviynt_eic     text not null default '',
  rsa_gl          text not null default '',
  verdict         text check (verdict in (
                    'RSA advantage — verified',
                    'Competitor advantage — verified',
                    'Broad parity — verified',
                    'Different implementation approach',
                    'Deployment-model artefact — not a capability gap',
                    'Potential competitor advantage — evidence incomplete',
                    'Potential RSA advantage — evidence incomplete',
                    'Possible gap — RSA validation required',
                    'Unknown / insufficient current evidence')),
  evidence_level  text check (evidence_level in ('A','B','C','D','E')),
  distribution    text not null default 'external' check (distribution in ('internal','external')),
  last_verified   date,
  sources         text not null default '',
  falsifier       text not null default '',
  notes           text not null default '',
  updated_at      timestamptz not null default now(),
  updated_by      uuid references auth.users(id) on delete set null,
  -- A verdict is not a verdict without a falsifier and a date. Skill rule.
  constraint imi_matrix_verdict_requires_provenance check (
    verdict is null
    or (falsifier <> '' and last_verified is not null and evidence_level is not null)
  )
);

comment on table public.imi_matrix_rows is
  'Capability matrix: RSA G&L vs SailPoint vs Saviynt. Verdicts are controlled vocabulary.';

create table if not exists public.imi_findings (
  id                uuid primary key default gen_random_uuid(),
  finding_id        text not null unique,
  mode              text not null default 'scan' check (mode in ('scan','matrix','seed','saudi')),
  vendor            text not null,
  product           text not null default '',
  version           text not null default '',
  classification    text not null default '',
  status            text check (status in ('GA','staged-rollout','preview','roadmap',
                                           'deprecated','EOS-announced','fixed','known-issue')),
  publication_date  date,
  effective_date    date,
  expiry_date       date,
  discovery_date    date not null default current_date,
  evidence_level    text not null check (evidence_level in ('A','B','C','D','E')),
  evidence_type     text not null check (evidence_type in (
                      'verified-fact','vendor-claim','third-party-observation',
                      'reasoned-inference','unconfirmed','conflicting')),
  distribution      text not null default 'external' check (distribution in ('internal','external')),
  -- Class E provenance. evidence-rules.md: class E without a version is a memory.
  verified_by       text not null default '',
  verified_date     date,
  version_tested    text not null default '',
  method            text not null default '',
  canonical_source_url text not null default '',
  corroborating_urls   text[] not null default '{}',
  technical_change     text not null default '',
  who_is_affected      text not null default '',
  implementation_impact text not null default '',
  matrix_rows_touched  text[] not null default '{}',
  rsa_verdict       text not null default '',
  action            text check (action in ('know','validate','test','ask-engineering',
                                           'battlecard','monitor','ignore')),
  previously_reported boolean not null default false,
  created_at        timestamptz not null default now(),
  created_by        uuid references auth.users(id) on delete set null,
  -- Class E requires all four provenance fields, or it is not class E.
  constraint imi_findings_class_e_provenance check (
    evidence_level <> 'E'
    or (verified_by <> '' and verified_date is not null
        and version_tested <> '' and method <> '')
  ),
  -- A class E finding is internal by definition.
  constraint imi_findings_class_e_internal check (
    evidence_level <> 'E' or distribution = 'internal'
  )
);

comment on table public.imi_findings is
  'Scan findings. Class E (practitioner-verified) requires full provenance and is always internal.';

create table if not exists public.imi_sources (
  id             uuid primary key default gen_random_uuid(),
  url            text not null unique,
  label          text not null,
  vendor         text not null default '',
  tier           text not null check (tier in ('A','B','C','D')),
  access         text not null default 'unknown' check (access in ('open','partial','auth','unknown')),
  last_checked   date,
  material_change boolean not null default false,
  notes          text not null default '',
  updated_at     timestamptz not null default now()
);

comment on table public.imi_sources is
  'Source registry. Walked in tier order A to C; open web search is the last pass.';

create index if not exists imi_matrix_rows_section_idx on public.imi_matrix_rows (section);
create index if not exists imi_matrix_rows_priority_idx on public.imi_matrix_rows (priority);
create index if not exists imi_findings_vendor_idx on public.imi_findings (vendor);
create index if not exists imi_findings_discovery_idx on public.imi_findings (discovery_date desc);
create index if not exists imi_sources_tier_idx on public.imi_sources (tier);

-- keep updated_at honest
create or replace function private.imi_touch_updated_at()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists imi_matrix_rows_touch on public.imi_matrix_rows;
create trigger imi_matrix_rows_touch before update on public.imi_matrix_rows
  for each row execute function private.imi_touch_updated_at();

drop trigger if exists imi_sources_touch on public.imi_sources;
create trigger imi_sources_touch before update on public.imi_sources
  for each row execute function private.imi_touch_updated_at();
