-- =========================================================
-- Atlas Tracking — shipping_rates permissions
-- Table and data already exist (standard/express/priority
-- with real pricing) — this only adds RLS so the public
-- Calculator page and admin CMS can read/write it.
-- No rows inserted, nothing existing is modified.
-- =========================================================

begin;

alter table public.shipping_rates enable row level security;

grant select on public.shipping_rates to anon, authenticated;
grant insert, update, delete on public.shipping_rates to authenticated;

drop policy if exists "Public can read active shipping rates" on public.shipping_rates;
create policy "Public can read active shipping rates"
on public.shipping_rates for select to anon, authenticated
using (active = true or public.is_admin());

drop policy if exists "Admins can manage shipping rates" on public.shipping_rates;
create policy "Admins can manage shipping rates"
on public.shipping_rates for all to authenticated
using (public.is_admin()) with check (public.is_admin());

commit;
