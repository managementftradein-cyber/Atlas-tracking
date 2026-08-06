-- Atlas Tracking — Supabase production schema
-- Generated to match the supplied frontend/admin code.
-- Run this in Supabase SQL Editor on a NEW/EMPTY project.
-- Review before running against an existing database.

create extension if not exists pgcrypto;

-- =========================================================
-- Admin access
-- =========================================================

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- Only an authenticated user can test whether their own account is an admin.
drop policy if exists "Admins can read own admin record" on public.admin_users;
create policy "Admins can read own admin record"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- IMPORTANT:
-- After creating the first staff user in Supabase Authentication,
-- add ONLY that user's UUID here:
--
-- insert into public.admin_users (user_id)
-- values ('YOUR-AUTH-USER-UUID');

-- =========================================================
-- Shipments
-- =========================================================

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  status text not null default 'pending'
    check (status in (
      'pending',
      'picked_up',
      'in_transit',
      'customs',
      'out_for_delivery',
      'delivered',
      'exception'
    )),
  service_type text,
  origin text,
  destination text,
  sender_name text,
  receiver_name text,
  sender_email text,
  receiver_email text,
  weight_kg numeric(12,2) check (weight_kg is null or weight_kg >= 0),
  dimensions text,
  contents text,
  est_delivery date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipments_tracking_number_idx
  on public.shipments (tracking_number);

create index if not exists shipments_updated_at_idx
  on public.shipments (updated_at desc);

alter table public.shipments enable row level security;

drop policy if exists "Admins can manage shipments" on public.shipments;
create policy "Admins can manage shipments"
on public.shipments
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- Tracking events
-- =========================================================

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null,
  location text,
  note text,
  event_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists tracking_events_shipment_idx
  on public.tracking_events (shipment_id, event_time desc);

alter table public.tracking_events enable row level security;

drop policy if exists "Admins can manage tracking events" on public.tracking_events;
create policy "Admins can manage tracking events"
on public.tracking_events
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- Quote requests
-- =========================================================

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  origin text,
  destination text,
  package_details text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);

alter table public.quote_requests enable row level security;

-- Public website may submit quote requests.
drop policy if exists "Anyone can submit quote requests" on public.quote_requests;
create policy "Anyone can submit quote requests"
on public.quote_requests
for insert
to anon, authenticated
with check (true);

-- Only administrators may read/update quote requests.
drop policy if exists "Admins can read quote requests" on public.quote_requests;
create policy "Admins can read quote requests"
on public.quote_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update quote requests" on public.quote_requests;
create policy "Admins can update quote requests"
on public.quote_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- Contact messages
-- =========================================================

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

-- Public website may submit contact messages.
drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

-- Only administrators may read/update contact messages.
drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
on public.contact_messages
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
on public.contact_messages
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- Updated-at trigger
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shipments_set_updated_at on public.shipments;
create trigger shipments_set_updated_at
before update on public.shipments
for each row
execute function public.set_updated_at();

-- =========================================================
-- Public tracking views
-- Deliberately exclude sender/receiver names and email addresses.
-- These are the objects used by js/main.js.
-- =========================================================

drop view if exists public.public_tracking_history;
drop view if exists public.public_tracking;

create view public.public_tracking as
select
  s.id,
  s.tracking_number,
  s.status,
  s.service_type,
  s.origin,
  s.destination,
  s.weight_kg,
  s.dimensions,
  s.est_delivery,
  s.created_at,
  s.updated_at
from public.shipments s;

create view public.public_tracking_history as
select
  te.id,
  s.tracking_number,
  te.status,
  te.location,
  te.note,
  te.event_time
from public.tracking_events te
join public.shipments s on s.id = te.shipment_id;

-- Grant only the read access needed by the public tracking page.
grant select on public.public_tracking to anon, authenticated;
grant select on public.public_tracking_history to anon, authenticated;

-- Views are intentionally limited to non-sensitive tracking information.
-- The underlying tables remain protected by RLS.

-- =========================================================
-- Basic data-quality constraints
-- =========================================================

alter table public.shipments
  drop constraint if exists shipments_tracking_number_not_blank;

alter table public.shipments
  add constraint shipments_tracking_number_not_blank
  check (length(trim(tracking_number)) > 0);

alter table public.quote_requests
  drop constraint if exists quote_requests_email_not_blank;

alter table public.quote_requests
  add constraint quote_requests_email_not_blank
  check (length(trim(email)) > 3);

alter table public.contact_messages
  drop constraint if exists contact_messages_email_not_blank;

alter table public.contact_messages
  add constraint contact_messages_email_not_blank
  check (length(trim(email)) > 3);

-- =========================================================
-- Verification queries
-- =========================================================
-- Run these after setup:
--
-- select * from public.admin_users;
-- select * from public.shipments;
-- select * from public.tracking_events;
-- select * from public.quote_requests;
-- select * from public.contact_messages;
-- select * from public.public_tracking;
-- select * from public.public_tracking_history;
