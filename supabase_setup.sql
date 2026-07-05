-- Supabase Database Setup & Initial Seed Data for ETERNITY
-- Execute this SQL in your Supabase SQL Editor.

-- ALTER STATEMENTS (If database tables already exist, run these statements to add variants columns):
-- ALTER TABLE public.cart_items ADD COLUMN IF NOT EXISTS selected_variant text;
-- ALTER TABLE public.cart_items DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;
-- ALTER TABLE public.cart_items ADD CONSTRAINT cart_items_user_id_product_id_selected_variant_key UNIQUE (user_id, product_id, selected_variant);
-- ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS selected_variant text;

create extension if not exists "uuid-ossp";

-- USER ROLE ENUM
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('customer', 'admin');
  end if;
end
$$;

-- =========================================================================
-- 1. TABLE DEFINITIONS
-- =========================================================================

-- Products Table
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text,
  category text not null,
  price numeric not null check (price >= 0),
  sale_price numeric check (sale_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  featured boolean default false,
  images text[] default '{}',
  ingredients text[] default '{}',
  weight text,
  rating numeric default 5.0,
  reviews integer default 0,
  popularity integer default 0,
  status text not null default 'available',
  variants text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Addresses Table
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  recipient_name text not null,
  phone text not null,
  street_address text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cart Items Table
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_id text references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  selected_variant text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id, selected_variant)
);

-- Orders Table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete set null,
  guest_email text,
  guest_name text,
  guest_phone text,
  shipping_address jsonb not null,
  subtotal numeric not null,
  shipping_fee numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null,
  payment_status text not null default 'pending',
  cashfree_order_id text unique not null,
  cashfree_payment_id text,
  fulfillment_status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price numeric not null,
  selected_variant text
);

-- Feedbacks Table
create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  rating integer check (rating >= 1 and rating <= 5),
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- 2. TRIGGERS & FUNCTIONS
-- =========================================================================

-- Check if user is admin (security definer bypasses RLS to prevent recursion)
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Automatic handle_new_user trigger on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role public.user_role := 'customer';
  meta_role text;
begin
  if new.raw_user_meta_data is not null then
    meta_role := new.raw_user_meta_data->>'role';
    if meta_role = 'admin' then
      default_role := 'admin';
    end if;
  end if;

  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    default_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    phone = excluded.phone,
    role = excluded.role;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================================================

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.feedbacks enable row level security;

-- =========================================================================
-- 4. RLS POLICY DEFINITIONS
-- =========================================================================

-- Products Policies
drop policy if exists "Allow public read access to products" on public.products;
create policy "Allow public read access to products"
  on public.products for select
  using (true);

drop policy if exists "Allow admins to insert products" on public.products;
create policy "Allow admins to insert products"
  on public.products for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists "Allow admins to update products" on public.products;
create policy "Allow admins to update products"
  on public.products for update
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Allow admins to delete products" on public.products;
create policy "Allow admins to delete products"
  on public.products for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- Profiles Policies
drop policy if exists "Allow users to read their own profile" on public.profiles;
create policy "Allow users to read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Allow admins to read all profiles" on public.profiles;
create policy "Allow admins to read all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Allow users to update their own profile" on public.profiles;
create policy "Allow users to update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Addresses Policies
drop policy if exists "Allow users to manage their own addresses" on public.addresses;
create policy "Allow users to manage their own addresses"
  on public.addresses for all
  to authenticated
  using (auth.uid() = user_id);

-- Cart Items Policies
drop policy if exists "Allow users to manage their own cart items" on public.cart_items;
create policy "Allow users to manage their own cart items"
  on public.cart_items for all
  to authenticated
  using (auth.uid() = user_id);

-- Orders Policies
drop policy if exists "Allow users to read their own orders" on public.orders;
create policy "Allow users to read their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Allow admins to read/write all orders" on public.orders;
create policy "Allow admins to read/write all orders"
  on public.orders for all
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Allow public/guests to create orders" on public.orders;
create policy "Allow public/guests to create orders"
  on public.orders for insert
  with check (true);

drop policy if exists "Allow public/guests to update their own pending orders" on public.orders;
create policy "Allow public/guests to update their own pending orders"
  on public.orders for update
  using (payment_status = 'pending');

-- Order Items Policies
drop policy if exists "Allow users to read their own order items" on public.order_items;
create policy "Allow users to read their own order items"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders
      where public.orders.id = order_id
      and public.orders.user_id = auth.uid()
    )
  );

drop policy if exists "Allow admins to manage all order items" on public.order_items;
create policy "Allow admins to manage all order items"
  on public.order_items for all
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "Allow public/guests to create order items" on public.order_items;
create policy "Allow public/guests to create order items"
  on public.order_items for insert
  with check (true);

-- Feedbacks Policies
drop policy if exists "Allow public to insert feedback" on public.feedbacks;
create policy "Allow public to insert feedback"
  on public.feedbacks for insert
  with check (true);

drop policy if exists "Allow admins to manage feedback" on public.feedbacks;
create policy "Allow admins to manage feedback"
  on public.feedbacks for all
  to authenticated
  using (public.is_admin(auth.uid()));

-- =========================================================================
-- 5. SEED DATA FOR PRODUCTS
-- =========================================================================

insert into public.products (id, name, slug, description, category, price, sale_price, stock_quantity, featured, images, ingredients, weight, rating, reviews, popularity, status, variants) values
('cc-dark-70', 'Single-Origin 70%', 'single-origin-70', 'Slow-roasted Idukki cocoa with a clean snap, deep fruit notes, and a long finish.', 'Chocolate', 420, null, 24, true, array['dark.jpg', 'nuts.jpg', 'gift.jpg'], array['Cocoa mass', 'Cocoa butter', 'Raw cane sugar', 'Cocoa nibs'], '100 g', 4.9, 86, 98, 'available', array['70% bar', '75% sea salt', 'Nib bark']),
('cc-milk-velvet', 'Velvet Milk', 'velvet-milk', 'Creamy Nilgiri milk chocolate with caramel warmth and a soft, silken melt.', 'Chocolate', 360, 320, 18, true, array['milk.jpg', 'homemade.jpg', 'gift.jpg'], array['Cocoa butter', 'Milk powder', 'Cocoa mass', 'Cane sugar'], '100 g', 4.8, 64, 91, 'available', array['Classic', 'Caramel', 'Hot chocolate cube']),
('cc-almond-honey', 'Almond & Honey', 'almond-honey', 'Roasted almonds folded through chocolate and finished with golden hill honey.', 'Chocolate', 480, null, 9, true, array['nuts.jpg', 'dark.jpg', 'seasonal.jpg'], array['Almonds', 'Cocoa mass', 'Honey', 'Cocoa butter', 'Cane sugar'], '120 g', 4.9, 73, 96, 'low-stock', array['Almond slab', 'Hazelnut praline', 'Cashew brittle']),
('cc-walnut-fudge', 'Walnut Fudge', 'walnut-fudge', 'Old-recipe homemade fudge, lightly salted and wrapped fresh every morning.', 'Chocolate', 300, null, 30, false, array['homemade.jpg', 'milk.jpg', 'nuts.jpg'], array['Milk', 'Cocoa', 'Walnuts', 'Butter', 'Cane sugar'], '150 g', 4.7, 41, 76, 'available', array['Walnut', 'Coconut bark', 'Classic fudge']),
('cc-petite-box', 'Petite Gift Box', 'petite-gift-box', 'Twelve hand-finished chocolates in a gold-tied gift box for Ooty travellers.', 'Chocolate', 950, null, 14, true, array['gift.jpg', 'dark.jpg', 'seasonal.jpg'], array['Assorted dark, milk, nut, and seasonal chocolates'], '12 pieces', 5, 58, 94, 'available', array['12 pieces', '24 pieces', 'Custom note']),
('cc-winter-spice', 'Winter Spice', 'winter-spice', 'Cinnamon-orange dark chocolate made for misty evenings and festival gifting.', 'Chocolate', 520, null, 0, false, array['seasonal.jpg', 'gift.jpg', 'dark.jpg'], array['Cocoa mass', 'Orange peel', 'Cinnamon', 'Cocoa butter'], '100 g', 4.8, 29, 82, 'sold-out', array['Winter spice', 'Monsoon coffee'])
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category = excluded.category,
  price = excluded.price,
  sale_price = excluded.sale_price,
  stock_quantity = excluded.stock_quantity,
  featured = excluded.featured,
  images = excluded.images,
  ingredients = excluded.ingredients,
  weight = excluded.weight,
  rating = excluded.rating,
  reviews = excluded.reviews,
  popularity = excluded.popularity,
  status = excluded.status,
  variants = excluded.variants;

-- =========================================================================
-- 6. STORAGE BUCKET SETUP
-- =========================================================================

-- Create the 'product-images' bucket if it does not exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies for public reading of product images
drop policy if exists "Allow public read access to product-images" on storage.objects;
create policy "Allow public read access to product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Storage policies for admins to insert/upload product images
drop policy if exists "Allow admins to insert files into product-images" on storage.objects;
create policy "Allow admins to insert files into product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

-- Storage policies for admins to update product images
drop policy if exists "Allow admins to update files in product-images" on storage.objects;
create policy "Allow admins to update files in product-images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

-- Storage policies for admins to delete product images
drop policy if exists "Allow admins to delete files from product-images" on storage.objects;
create policy "Allow admins to delete files from product-images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

