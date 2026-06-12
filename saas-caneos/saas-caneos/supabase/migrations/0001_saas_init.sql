-- ================================================================
-- CanêOS SaaS — Schema Multi-Tenant
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor
-- ================================================================
set search_path = public, auth;

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type store_role         as enum ('owner','manager','staff');
  create type system_role        as enum ('super_admin');
  create type expense_type       as enum ('rent','staff','electricity','water','ingredients','marketing','other');
  create type investment_category as enum ('machine','setup','signage','equipment','other');
  create type inventory_txn_type as enum ('in','out');
  create type payment_method     as enum ('cash','bank_transfer','mixed');
  create type invite_status      as enum ('pending','accepted','expired');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES  (1:1 with auth.users)
-- ============================================================
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  avatar_url   text,
  system_role  system_role,       -- null = regular user; 'super_admin' = platform admin
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- TENANTS  (organisation / business owner)
-- ============================================================
create table if not exists tenants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner_id   uuid not null references profiles(id) on delete restrict,
  plan       text not null default 'free',   -- free | pro | enterprise
  status     text not null default 'active', -- active | suspended
  created_at timestamptz not null default now()
);
create index if not exists idx_tenants_owner on tenants(owner_id);

-- ============================================================
-- STORES  (physical locations under a tenant)
-- ============================================================
create table if not exists stores (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  slug        text,
  address     text,
  phone       text,
  type        text not null default 'drink_kiosk',
  logo_url    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists idx_stores_tenant on stores(tenant_id);

-- ============================================================
-- STORE MEMBERS  (access control: who sees which store, what role)
-- ============================================================
create table if not exists store_members (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  role        store_role not null default 'staff',
  invited_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (store_id, user_id)
);
create index if not exists idx_store_members_user  on store_members(user_id);
create index if not exists idx_store_members_store on store_members(store_id);

-- ============================================================
-- PENDING INVITATIONS
-- ============================================================
create table if not exists pending_invitations (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  email      text not null,
  role       store_role not null default 'staff',
  token      text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid references profiles(id) on delete set null,
  status     invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  unique (store_id, email)
);

-- ============================================================
-- CATEGORIES  (per store)
-- ============================================================
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  store_id   uuid not null references stores(id) on delete cascade,
  name       text not null,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_store on categories(store_id);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name        text not null,
  price       numeric(12,2) not null default 0 check (price >= 0),
  cost        numeric(12,2) not null default 0 check (cost >= 0),
  image_url   text,
  is_active   boolean not null default true,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_products_store    on products(store_id);
create index if not exists idx_products_active   on products(store_id, is_active);

-- ============================================================
-- RECIPE ITEMS  (công thức: product → ingredients)
-- ============================================================
create table if not exists recipe_items (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  quantity      numeric(14,4) not null check (quantity > 0),
  created_at    timestamptz not null default now(),
  unique (product_id, ingredient_id)
);
create index if not exists idx_recipe_product    on recipe_items(product_id);
create index if not exists idx_recipe_ingredient on recipe_items(ingredient_id);

-- ============================================================
-- INGREDIENTS  (per store)
-- ============================================================
create table if not exists ingredients (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  name          text not null,
  unit          text not null default 'kg',
  current_stock numeric(14,3) not null default 0,
  reorder_point numeric(14,3) not null default 0,
  unit_cost     numeric(12,2) not null default 0,
  created_at    timestamptz not null default now()
);
create index if not exists idx_ingredients_store on ingredients(store_id);

-- ============================================================
-- SALES
-- ============================================================
create table if not exists sales (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null references stores(id) on delete cascade,
  created_by     uuid not null references profiles(id) on delete restrict,
  sale_date      date not null default current_date,
  payment_method payment_method not null default 'cash',
  note           text,
  total_amount   numeric(14,2) not null default 0,
  total_cost     numeric(14,2) not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists idx_sales_store on sales(store_id);
create index if not exists idx_sales_date  on sales(store_id, sale_date);

-- ============================================================
-- SALE ITEMS
-- ============================================================
create table if not exists sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references sales(id) on delete cascade,
  product_id  uuid not null references products(id) on delete restrict,
  quantity    numeric(12,2) not null check (quantity > 0),
  unit_price  numeric(12,2) not null,
  unit_cost   numeric(12,2) not null,
  subtotal    numeric(14,2) generated always as (quantity * unit_price) stored,
  created_at  timestamptz not null default now()
);
create index if not exists idx_sale_items_sale    on sale_items(sale_id);
create index if not exists idx_sale_items_product on sale_items(product_id);

-- ============================================================
-- EXPENSES
-- ============================================================
create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  store_id     uuid not null references stores(id) on delete cascade,
  created_by   uuid not null references profiles(id) on delete restrict,
  expense_date date not null default current_date,
  type         expense_type not null default 'other',
  amount       numeric(14,2) not null check (amount >= 0),
  note         text,
  created_at   timestamptz not null default now()
);
create index if not exists idx_expenses_store on expenses(store_id);
create index if not exists idx_expenses_date  on expenses(store_id, expense_date);

-- ============================================================
-- INVESTMENTS
-- ============================================================
create table if not exists investments (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references stores(id) on delete cascade,
  name        text not null,
  category    investment_category not null default 'equipment',
  amount      numeric(14,2) not null check (amount >= 0),
  invest_date date not null default current_date,
  created_at  timestamptz not null default now()
);
create index if not exists idx_investments_store on investments(store_id);

-- ============================================================
-- INVENTORY TRANSACTIONS
-- ============================================================
create table if not exists inventory_transactions (
  id            uuid primary key default gen_random_uuid(),
  store_id      uuid not null references stores(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  txn_type      inventory_txn_type not null,
  quantity      numeric(14,3) not null check (quantity > 0),
  unit_cost     numeric(12,2) not null default 0,
  sale_id       uuid references sales(id) on delete cascade,
  txn_date      date not null default current_date,
  note          text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_inv_txn_ingredient on inventory_transactions(ingredient_id);
create index if not exists idx_inv_txn_sale       on inventory_transactions(sale_id);
create index if not exists idx_inv_txn_store      on inventory_transactions(store_id);

-- ============================================================
-- AUDIT LOGS  (immutable — no delete/update allowed)
-- ============================================================
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid references stores(id) on delete set null,
  user_id     uuid references profiles(id) on delete set null,
  action      text not null,
  table_name  text,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_store on audit_logs(store_id, created_at desc);
create index if not exists idx_audit_user  on audit_logs(user_id, created_at desc);

-- ============================================================
-- HELPER FUNCTIONS  (used by RLS — keep fast, no joins where possible)
-- ============================================================

-- Is the current user a super_admin?
create or replace function is_super_admin()
returns boolean language sql stable security definer as $$
  select coalesce((select system_role = 'super_admin' from profiles where id = auth.uid()), false)
$$;

-- What role does the current user have in a given store?
create or replace function get_store_role(p_store_id uuid)
returns text language sql stable security definer as $$
  select role::text from store_members
  where store_id = p_store_id and user_id = auth.uid()
  limit 1
$$;

-- Does the current user have AT LEAST the given role in a store?
-- role order: owner > manager > staff
create or replace function has_store_role(p_store_id uuid, p_roles text[])
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from store_members
    where store_id = p_store_id
      and user_id  = auth.uid()
      and role::text = any(p_roles)
  )
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Auto-accept pending invitation on profile creation
create or replace function handle_pending_invitations()
returns trigger language plpgsql security definer as $$
begin
  insert into store_members (store_id, user_id, role, invited_by)
  select store_id, new.id, role, invited_by
  from pending_invitations
  where email = new.email and status = 'pending' and expires_at > now()
  on conflict (store_id, user_id) do nothing;

  update pending_invitations set status = 'accepted'
  where email = new.email and status = 'pending';
  return new;
end $$;
drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
  after insert on profiles for each row execute function handle_pending_invitations();

-- Auto-recompute ingredient stock + unit_cost (weighted avg) on inventory change
create or replace function recompute_ingredient_stock(p_ingredient uuid)
returns void language plpgsql as $$
begin
  update ingredients set
    current_stock = coalesce((
      select sum(case when txn_type='in' then quantity else -quantity end)
      from inventory_transactions where ingredient_id = p_ingredient), 0),
    unit_cost = coalesce((
      select sum(quantity * unit_cost) / nullif(sum(quantity),0)
      from inventory_transactions where ingredient_id = p_ingredient and txn_type='in'), unit_cost)
  where id = p_ingredient;
end $$;

create or replace function trg_inventory_stock() returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    perform recompute_ingredient_stock(old.ingredient_id); return old;
  else
    perform recompute_ingredient_stock(new.ingredient_id);
    if tg_op = 'UPDATE' and old.ingredient_id <> new.ingredient_id then
      perform recompute_ingredient_stock(old.ingredient_id);
    end if;
    return new;
  end if;
end $$;
drop trigger if exists inventory_stock_sync on inventory_transactions;
create trigger inventory_stock_sync
  after insert or update or delete on inventory_transactions
  for each row execute function trg_inventory_stock();

-- Auto-deduct inventory on sale (via recipe_items)
create or replace function deduct_inventory_for_sale()
returns trigger language plpgsql as $$
declare
  v_store_id uuid;
begin
  select store_id into v_store_id from sales where id = new.sale_id;
  insert into inventory_transactions (store_id, ingredient_id, txn_type, quantity, unit_cost, sale_id, txn_date, note)
  select v_store_id, ri.ingredient_id, 'out', ri.quantity * new.quantity, 0, new.sale_id, current_date, 'Bán hàng tự động'
  from recipe_items ri
  where ri.product_id = new.product_id;
  return new;
end $$;
drop trigger if exists auto_deduct_inventory on sale_items;
create trigger auto_deduct_inventory
  after insert on sale_items for each row execute function deduct_inventory_for_sale();

-- ============================================================
-- VIEWS
-- ============================================================
create or replace view daily_store_summary as
select
  s.store_id, s.sale_date,
  sum(si.subtotal)                as revenue,
  sum(si.quantity * si.unit_cost) as cogs,
  sum(si.quantity)                as units,
  count(distinct s.id)            as orders
from sales s join sale_items si on si.sale_id = s.id
group by s.store_id, s.sale_date;

create or replace view product_performance_view as
select
  s.store_id, p.id as product_id, p.name,
  sum(si.quantity)                as units,
  sum(si.subtotal)                as revenue,
  sum(si.quantity * si.unit_cost) as cost
from sale_items si
join sales s    on s.id = si.sale_id
join products p on p.id = si.product_id
group by s.store_id, p.id, p.name;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
do $$ declare t text; begin
  foreach t in array array[
    'profiles','tenants','stores','store_members','pending_invitations',
    'categories','products','recipe_items','ingredients','inventory_transactions',
    'sales','sale_items','expenses','investments','audit_logs'
  ] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- profiles: own row only (super_admin can see all via service role)
drop policy if exists "profiles self" on profiles;
create policy "profiles self" on profiles for all
  to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- tenants: owner only
drop policy if exists "tenants owner" on tenants;
create policy "tenants owner" on tenants for all
  to authenticated using (is_super_admin() or owner_id = auth.uid()) with check (owner_id = auth.uid());

-- stores: members can read; owner can write
drop policy if exists "stores read" on stores;
create policy "stores read" on stores for select
  to authenticated using (is_super_admin() or has_store_role(id, array['owner','manager','staff']));
drop policy if exists "stores write" on stores;
create policy "stores write" on stores for all
  to authenticated using (is_super_admin() or has_store_role(id, array['owner']))
  with check (is_super_admin() or has_store_role(id, array['owner']));

-- store_members: members can read; owner/manager can write
drop policy if exists "store_members read" on store_members;
create policy "store_members read" on store_members for select
  to authenticated using (is_super_admin() or user_id = auth.uid() or has_store_role(store_id, array['owner','manager']));
drop policy if exists "store_members write" on store_members;
create policy "store_members write" on store_members for all
  to authenticated using (is_super_admin() or has_store_role(store_id, array['owner']))
  with check (is_super_admin() or has_store_role(store_id, array['owner']));

-- pending_invitations: owner/manager
drop policy if exists "invitations" on pending_invitations;
create policy "invitations" on pending_invitations for all
  to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- categories + products + recipe_items: members read; owner/manager write
do $$ declare t text; begin
  foreach t in array array['categories','products','recipe_items'] loop
    execute format('drop policy if exists "%s read" on %I', t, t);
    execute format('drop policy if exists "%s write" on %I', t, t);
    if t = 'recipe_items' then
      -- recipe_items has no store_id — access via product.store_id
      execute format(
        'create policy "%s read" on %I for select to authenticated using (is_super_admin() or exists (select 1 from products p join store_members sm on sm.store_id = p.store_id where p.id = %I.product_id and sm.user_id = auth.uid()))',
        t, t, t);
      execute format(
        'create policy "%s write" on %I for all to authenticated using (is_super_admin() or exists (select 1 from products p join store_members sm on sm.store_id = p.store_id where p.id = %I.product_id and sm.user_id = auth.uid() and sm.role in (''owner'',''manager'')))',
        t, t, t);
    else
      execute format('create policy "%s read" on %I for select to authenticated using (is_super_admin() or has_store_role(store_id, array[''owner'',''manager'',''staff'']))', t, t);
      execute format('create policy "%s write" on %I for all to authenticated using (is_super_admin() or has_store_role(store_id, array[''owner'',''manager''])) with check (is_super_admin() or has_store_role(store_id, array[''owner'',''manager'']))', t, t);
    end if;
  end loop;
end $$;

-- ingredients: members read; owner/manager write
drop policy if exists "ingredients read"  on ingredients;
drop policy if exists "ingredients write" on ingredients;
create policy "ingredients read"  on ingredients for select to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "ingredients write" on ingredients for all    to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager'])) with check (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- inventory_transactions: members read; any member can insert (auto-deduct); owner/manager delete
drop policy if exists "inv_txn read"   on inventory_transactions;
drop policy if exists "inv_txn insert" on inventory_transactions;
drop policy if exists "inv_txn delete" on inventory_transactions;
create policy "inv_txn read"   on inventory_transactions for select to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "inv_txn insert" on inventory_transactions for insert to authenticated with check (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "inv_txn delete" on inventory_transactions for delete to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- sales: members read (staff sees own); any member can insert; owner/manager delete
drop policy if exists "sales read"   on sales;
drop policy if exists "sales insert" on sales;
drop policy if exists "sales delete" on sales;
create policy "sales read"   on sales for select to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "sales insert" on sales for insert to authenticated with check (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "sales delete" on sales for delete to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- sale_items: cascade from sales
drop policy if exists "sale_items read"   on sale_items;
drop policy if exists "sale_items insert" on sale_items;
create policy "sale_items read"   on sale_items for select to authenticated using (is_super_admin() or exists (select 1 from sales s join store_members sm on sm.store_id = s.store_id where s.id = sale_items.sale_id and sm.user_id = auth.uid()));
create policy "sale_items insert" on sale_items for insert to authenticated with check (is_super_admin() or exists (select 1 from sales s join store_members sm on sm.store_id = s.store_id where s.id = sale_items.sale_id and sm.user_id = auth.uid()));

-- expenses: members read; any member insert; owner/manager delete
drop policy if exists "expenses read"   on expenses;
drop policy if exists "expenses insert" on expenses;
drop policy if exists "expenses delete" on expenses;
create policy "expenses read"   on expenses for select to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "expenses insert" on expenses for insert to authenticated with check (is_super_admin() or has_store_role(store_id, array['owner','manager','staff']));
create policy "expenses delete" on expenses for delete to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- investments: owner/manager only
drop policy if exists "investments" on investments;
create policy "investments" on investments for all to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager'])) with check (is_super_admin() or has_store_role(store_id, array['owner','manager']));

-- audit_logs: read only for owner/manager; inserts allowed for all auth
drop policy if exists "audit read"   on audit_logs;
drop policy if exists "audit insert" on audit_logs;
create policy "audit read"   on audit_logs for select to authenticated using (is_super_admin() or has_store_role(store_id, array['owner','manager']));
create policy "audit insert" on audit_logs for insert to authenticated with check (true);
