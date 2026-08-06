-- Atlas Tracking Admin V2 migration
-- Run AFTER the original Atlas Tracking schema.
-- Adds charges, proof of delivery, photos and private storage.

create table if not exists public.shipment_charges (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  currency text not null default 'USD',
  base_charge numeric(12,2) not null default 0 check (base_charge >= 0),
  per_kg_rate numeric(12,2) not null default 0 check (per_kg_rate >= 0),
  weight_charge numeric(12,2) not null default 0 check (weight_charge >= 0),
  service_charge numeric(12,2) not null default 0 check (service_charge >= 0),
  insurance_charge numeric(12,2) not null default 0 check (insurance_charge >= 0),
  additional_charge numeric(12,2) not null default 0 check (additional_charge >= 0),
  total_charge numeric(12,2) not null default 0 check (total_charge >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shipment_charges enable row level security;
drop policy if exists "Admins can manage shipment charges" on public.shipment_charges;
create policy "Admins can manage shipment charges"
on public.shipment_charges for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create table if not exists public.delivery_confirmations (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null unique references public.shipments(id) on delete cascade,
  recipient_name text,
  delivered_at timestamptz,
  location text,
  notes text,
  signature_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.delivery_confirmations enable row level security;
drop policy if exists "Admins can manage delivery confirmations" on public.delivery_confirmations;
create policy "Admins can manage delivery confirmations"
on public.delivery_confirmations for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create table if not exists public.delivery_photos (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index if not exists delivery_photos_shipment_idx
on public.delivery_photos(shipment_id, created_at desc);

alter table public.delivery_photos enable row level security;
drop policy if exists "Admins can manage delivery photos" on public.delivery_photos;
create policy "Admins can manage delivery photos"
on public.delivery_photos for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Keep proof files private. The dashboard generates signed URLs for admins.
insert into storage.buckets (id, name, public)
values ('delivery-proof', 'delivery-proof', false)
on conflict (id) do update set public = false;

drop policy if exists "Admins can upload delivery proof" on storage.objects;
create policy "Admins can upload delivery proof"
on storage.objects for insert to authenticated
with check (bucket_id = 'delivery-proof' and public.is_admin());

drop policy if exists "Admins can read delivery proof" on storage.objects;
create policy "Admins can read delivery proof"
on storage.objects for select to authenticated
using (bucket_id = 'delivery-proof' and public.is_admin());

drop policy if exists "Admins can delete delivery proof" on storage.objects;
create policy "Admins can delete delivery proof"
on storage.objects for delete to authenticated
using (bucket_id = 'delivery-proof' and public.is_admin());

-- Reuse the existing updated_at helper from the original schema.
drop trigger if exists shipment_charges_set_updated_at on public.shipment_charges;
create trigger shipment_charges_set_updated_at
before update on public.shipment_charges
for each row execute function public.set_updated_at();

drop trigger if exists delivery_confirmations_set_updated_at on public.delivery_confirmations;
create trigger delivery_confirmations_set_updated_at
before update on public.delivery_confirmations
for each row execute function public.set_updated_at();

-- Optional: expose only the delivery status/date to the public tracking view.
drop view if exists public.public_tracking;
create view public.public_tracking as
select
  s.id, s.tracking_number, s.status, s.service_type, s.origin, s.destination,
  s.weight_kg, s.dimensions, s.est_delivery, s.created_at, s.updated_at
from public.shipments s;

grant select on public.public_tracking to anon, authenticated;
