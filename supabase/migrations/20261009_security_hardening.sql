-- =========================================================================
-- SECURITY HARDENING MIGRATION (2026-10-09)
-- Run once in the Supabase SQL Editor. Safe to re-run.
--
-- Fixes:
--  * Anonymous users could read every order / order item (customer names, emails,
--    phones, addresses) via a live policy that is not in supabase_setup.sql.
--  * Anyone could become admin by signing up with {"role":"admin"} metadata, or by
--    updating their own profiles.role column.
--  * Anonymous users could INSERT orders already marked "paid" and UPDATE any pending order.
--  * Storage bucket accepted any file type/size from admins (e.g. SVG with script).
--
-- The app's server functions write orders, order items and feedback with the service-role
-- key (which bypasses RLS), so none of the removed public write policies are needed.
-- =========================================================================

begin;

-- -------------------------------------------------------------------------
-- 1. Drop EVERY existing policy on app tables so no unknown permissive policy survives
-- -------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'profiles', 'addresses', 'cart_items', 'orders', 'order_items', 'feedbacks')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end
$$;

alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.addresses   enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;
alter table public.feedbacks   enable row level security;

-- Defence in depth: anonymous visitors never need direct access to private tables
revoke all on public.profiles, public.addresses, public.cart_items,
              public.orders, public.order_items, public.feedbacks from anon;
revoke insert, update, delete on public.products from anon;
-- Orders / items / feedback are created only by the server (service role)
revoke insert, delete on public.orders, public.order_items, public.feedbacks from authenticated;

-- -------------------------------------------------------------------------
-- 2. Functions: pinned search_path, no role taken from user-controlled metadata
-- -------------------------------------------------------------------------
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$;

-- raw_user_meta_data is supplied by the person signing up, so it must never grant a role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone = excluded.phone;
  return new;
end;
$$;

-- -------------------------------------------------------------------------
-- 3. Profiles: users may edit only their name/phone; role changes only via SQL editor/service role
-- -------------------------------------------------------------------------
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;

-- Backstop in case table-wide UPDATE is ever re-granted. Security invoker on purpose:
-- current_user is 'anon'/'authenticated' for API calls and 'postgres' in the SQL editor.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.role is distinct from old.role and current_user in ('anon', 'authenticated') then
    raise exception 'permission denied: profile role cannot be changed through the API';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_change();

-- -------------------------------------------------------------------------
-- 4. Policies (least privilege)
-- -------------------------------------------------------------------------

-- Products: public catalogue, admin-managed
create policy "products_public_read" on public.products
  for select using (true);
create policy "products_admin_insert" on public.products
  for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "products_admin_update" on public.products
  for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "products_admin_delete" on public.products
  for delete to authenticated using (public.is_admin(auth.uid()));

-- Profiles
create policy "profiles_read_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_admin_read" on public.profiles
  for select to authenticated using (public.is_admin(auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Addresses / cart: owner only
create policy "addresses_owner_all" on public.addresses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cart_items_owner_all" on public.cart_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders: customers read their own; admins read and update (fulfilment). No public insert/update.
create policy "orders_read_own" on public.orders
  for select to authenticated using (auth.uid() = user_id);
create policy "orders_admin_read" on public.orders
  for select to authenticated using (public.is_admin(auth.uid()));
create policy "orders_admin_update" on public.orders
  for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Order items
create policy "order_items_read_own" on public.order_items
  for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  ));
create policy "order_items_admin_read" on public.order_items
  for select to authenticated using (public.is_admin(auth.uid()));

-- Feedback: written by the server only, readable/manageable by admins
create policy "feedbacks_admin_read" on public.feedbacks
  for select to authenticated using (public.is_admin(auth.uid()));
create policy "feedbacks_admin_update" on public.feedbacks
  for update to authenticated
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- -------------------------------------------------------------------------
-- 5. Storage: product images — raster images only, 10 MB max, admin-only writes
-- -------------------------------------------------------------------------
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    file_size_limit = 10485760
where id = 'product-images';

drop policy if exists "Allow admins to update files in product-images" on storage.objects;
create policy "Allow admins to update files in product-images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()))
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

commit;

-- =========================================================================
-- AFTER RUNNING: review who is an admin. Because signup metadata could grant admin until now,
-- demote any account you do not recognise, e.g.:
--   update public.profiles set role = 'customer' where id = '<uuid>';
--
-- select p.id, u.email, u.created_at, p.role
-- from public.profiles p join auth.users u on u.id = p.id
-- where p.role = 'admin'
-- order by u.created_at;
--
-- Also review recent "paid" orders against the Zaakpay / Cashfree dashboards — before the
-- payment-verification fix, an order could be marked paid without a real payment.
-- =========================================================================
