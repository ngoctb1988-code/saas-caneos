-- ================================================================
-- CanêOS SaaS — Seed Data (demo)
-- Chạy SAU 0001_saas_init.sql trong môi trường dev/staging
-- ================================================================

-- Lưu ý: Bạn phải tạo 3 user thật qua Auth trước rồi lấy UUID điền vào đây.
-- Demo dùng UUID giả — thay bằng UUID thật từ auth.users

do $$
declare
  v_owner_id      uuid := 'aaaaaaaa-0000-0000-0000-000000000001'; -- thay bằng UUID thật
  v_manager_id    uuid := 'bbbbbbbb-0000-0000-0000-000000000002'; -- thay bằng UUID thật
  v_staff_id      uuid := 'cccccccc-0000-0000-0000-000000000003'; -- thay bằng UUID thật
  v_tenant_id     uuid := gen_random_uuid();
  v_store1_id     uuid := gen_random_uuid();
  v_store2_id     uuid := gen_random_uuid();
  v_cat1_id       uuid := gen_random_uuid();
  v_cat2_id       uuid := gen_random_uuid();
  v_cat3_id       uuid := gen_random_uuid();
  v_p1 uuid := gen_random_uuid(); v_p2 uuid := gen_random_uuid();
  v_p3 uuid := gen_random_uuid(); v_p4 uuid := gen_random_uuid();
  v_p5 uuid := gen_random_uuid();
  v_ing1 uuid := gen_random_uuid(); v_ing2 uuid := gen_random_uuid(); v_ing3 uuid := gen_random_uuid();
  i int;
  v_sale uuid;
  v_date date;
begin
  -- Tenant
  insert into tenants (id, name, owner_id) values (v_tenant_id, 'WOW Sport Group', v_owner_id);
  -- Stores
  insert into stores (id, tenant_id, name, address, phone, type) values
    (v_store1_id, v_tenant_id, 'WOW Pickleball', '123 Đường Thể Thao, Q.1, TP.HCM', '0901111111', 'drink_kiosk'),
    (v_store2_id, v_tenant_id, 'WOW River Park', '45 Bến Sông Xanh, Q.Bình Thạnh, TP.HCM', '0902222222', 'drink_kiosk');
  -- Members
  insert into store_members (store_id, user_id, role) values
    (v_store1_id, v_owner_id,   'owner'),
    (v_store1_id, v_manager_id, 'manager'),
    (v_store1_id, v_staff_id,   'staff'),
    (v_store2_id, v_owner_id,   'owner');
  -- Profiles (nếu chưa có)
  insert into profiles (id, email, full_name, onboarded) values
    (v_owner_id,   'owner@demo.com',   'Nguyễn Văn Chủ', true),
    (v_manager_id, 'manager@demo.com', 'Trần Thị Quản',  true),
    (v_staff_id,   'staff@demo.com',   'Lê Văn Nhân',    true)
  on conflict (id) do update set onboarded = true;

  -- Categories (Store 1)
  insert into categories (id, store_id, name, sort_order) values
    (v_cat1_id, v_store1_id, 'Nước mía', 1),
    (v_cat2_id, v_store1_id, 'Dừa & nước ép', 2),
    (v_cat3_id, v_store1_id, 'Topping', 3);
  -- Products
  insert into products (id, store_id, category_id, name, price, cost, is_active, sort_order) values
    (v_p1, v_store1_id, v_cat1_id, 'Nước mía truyền thống', 18000, 4500, true, 1),
    (v_p2, v_store1_id, v_cat1_id, 'Nước mía tắc',          20000, 5500, true, 2),
    (v_p3, v_store1_id, v_cat1_id, 'Nước mía sầu riêng',    25000, 8000, true, 3),
    (v_p4, v_store1_id, v_cat2_id, 'Dừa tắc',               22000, 7000, true, 4),
    (v_p5, v_store1_id, v_cat2_id, 'Rau má đậu xanh',       20000, 6000, true, 5);
  -- Ingredients
  insert into ingredients (id, store_id, name, unit, current_stock, reorder_point, unit_cost) values
    (v_ing1, v_store1_id, 'Mía nguyên liệu', 'kg',   50, 10, 8000),
    (v_ing2, v_store1_id, 'Tắc (quất)',       'quả',  200, 30, 500),
    (v_ing3, v_store1_id, 'Dừa tươi',         'quả',  40,  8, 12000);
  -- Recipes
  insert into recipe_items (product_id, ingredient_id, quantity) values
    (v_p1, v_ing1, 0.35),   -- 350g mía / 1 ly mía truyền thống
    (v_p2, v_ing1, 0.35),   -- 350g mía
    (v_p2, v_ing2, 1),      -- 1 quả tắc
    (v_p4, v_ing3, 0.5),    -- 0.5 quả dừa
    (v_p4, v_ing2, 1);      -- 1 quả tắc

  -- Generate 30 days of sales
  for i in 0..29 loop
    v_date := current_date - i;
    -- 3-6 sales per day
    for j in 1..(3 + (i % 4)) loop
      insert into sales (id, store_id, created_by, sale_date, payment_method, total_amount, total_cost)
      values (gen_random_uuid(), v_store1_id, v_staff_id, v_date,
        case when j % 3 = 0 then 'bank_transfer'::payment_method else 'cash'::payment_method end,
        (3 + (j % 5)) * 20000, (3 + (j % 5)) * 5500)
      returning id into v_sale;
      -- Items
      insert into sale_items (sale_id, product_id, quantity, unit_price, unit_cost) values
        (v_sale, v_p1, 2, 18000, 4500),
        (v_sale, v_p2, 1 + (j % 3), 20000, 5500);
    end loop;
  end loop;

  -- Expenses
  insert into expenses (store_id, created_by, expense_date, type, amount, note) values
    (v_store1_id, v_owner_id, current_date - 25, 'rent',        3500000, 'Thuê mặt bằng tháng này'),
    (v_store1_id, v_owner_id, current_date - 20, 'electricity',   450000, 'Điện tháng này'),
    (v_store1_id, v_owner_id, current_date - 15, 'staff',        2000000, 'Lương nhân viên'),
    (v_store1_id, v_owner_id, current_date - 10, 'ingredients',   800000, 'Mua mía, tắc, dừa');
  -- Investments
  insert into investments (store_id, name, category, amount, invest_date) values
    (v_store1_id, 'Máy ép mía công nghiệp', 'machine', 8500000, current_date - 60),
    (v_store1_id, 'Setup quầy + decor',     'setup',   5000000, current_date - 60),
    (v_store1_id, 'Bảng hiệu LED',          'signage', 2500000, current_date - 55);
end $$;
