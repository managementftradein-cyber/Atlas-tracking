-- Atlas Tracking admin authorization
-- Run once in Supabase SQL Editor.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.shipments enable row level security;

drop policy if exists "Admins can read all shipments" on public.shipments;
create policy "Admins can read all shipments"
on public.shipments for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can update shipments" on public.shipments;
create policy "Admins can update shipments"
on public.shipments for update to authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.tracking_events enable row level security;

drop policy if exists "Admins can read all tracking events" on public.tracking_events;
create policy "Admins can read all tracking events"
on public.tracking_events for select to authenticated
using (public.is_admin());

drop policy if exists "Admins can create tracking events" on public.tracking_events;
create policy "Admins can create tracking events"
on public.tracking_events for insert to authenticated
with check (public.is_admin());
