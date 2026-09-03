-- Row Level Security. The skill's distribution rule, enforced by the database:
-- an internal-distribution row is not readable by a non-admin, so it cannot
-- leak into customer-facing material through this app.

alter table public.imi_matrix_rows enable row level security;
alter table public.imi_findings    enable row level security;
alter table public.imi_sources     enable row level security;

-- ---------- imi_matrix_rows ----------
drop policy if exists imi_matrix_select on public.imi_matrix_rows;
create policy imi_matrix_select on public.imi_matrix_rows
  for select to authenticated
  using (distribution = 'external' or private.is_admin());

drop policy if exists imi_matrix_insert on public.imi_matrix_rows;
create policy imi_matrix_insert on public.imi_matrix_rows
  for insert to authenticated
  with check (private.is_admin());

drop policy if exists imi_matrix_update on public.imi_matrix_rows;
create policy imi_matrix_update on public.imi_matrix_rows
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists imi_matrix_delete on public.imi_matrix_rows;
create policy imi_matrix_delete on public.imi_matrix_rows
  for delete to authenticated
  using (private.is_admin());

-- ---------- imi_findings ----------
drop policy if exists imi_findings_select on public.imi_findings;
create policy imi_findings_select on public.imi_findings
  for select to authenticated
  using (distribution = 'external' or private.is_admin());

drop policy if exists imi_findings_insert on public.imi_findings;
create policy imi_findings_insert on public.imi_findings
  for insert to authenticated
  with check (private.is_admin());

drop policy if exists imi_findings_update on public.imi_findings;
create policy imi_findings_update on public.imi_findings
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists imi_findings_delete on public.imi_findings;
create policy imi_findings_delete on public.imi_findings
  for delete to authenticated
  using (private.is_admin());

-- ---------- imi_sources ----------
drop policy if exists imi_sources_select on public.imi_sources;
create policy imi_sources_select on public.imi_sources
  for select to authenticated
  using (true);

drop policy if exists imi_sources_write on public.imi_sources;
create policy imi_sources_write on public.imi_sources
  for all to authenticated
  using (private.is_admin())
  with check (private.is_admin());

-- ---------- realtime ----------
alter publication supabase_realtime add table public.imi_matrix_rows;
alter publication supabase_realtime add table public.imi_findings;
alter publication supabase_realtime add table public.imi_sources;

-- realtime needs the old row to evaluate RLS on updates/deletes
alter table public.imi_matrix_rows replica identity full;
alter table public.imi_findings    replica identity full;
alter table public.imi_sources     replica identity full;
