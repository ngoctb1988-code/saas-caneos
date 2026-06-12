# CanêOS SaaS — Deployment Guide

## Bước 1: Tạo Supabase project

1. Vào [supabase.com](https://supabase.com) → **New project**
2. Chọn region gần nhất (Singapore hoặc Tokyo cho Việt Nam)
3. Sau khi tạo xong, vào **Settings → API**:
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (giữ bí mật)

## Bước 2: Chạy migrations

1. Vào **Supabase Dashboard → SQL Editor**
2. Paste toàn bộ nội dung file `supabase/migrations/0001_saas_init.sql`
3. Click **Run** — chờ thành công (khoảng 2–3 giây)
4. *(Tuỳ chọn)* Chạy `0002_seed.sql` để có dữ liệu demo (thay UUID trước)

## Bước 3: Cấu hình Supabase Auth

1. **Authentication → Providers → Email**: đảm bảo đang bật
2. **Authentication → Providers → Google** *(tuỳ chọn)*:
   - Tạo OAuth app tại [Google Cloud Console](https://console.cloud.google.com)
   - Điền `Client ID` và `Client Secret`
3. **Authentication → URL Configuration**:
   - `Site URL`: `https://your-app.vercel.app`
   - `Redirect URLs`: thêm `https://your-app.vercel.app/auth/callback`

## Bước 4: Deploy lên Vercel

```bash
# Cài Vercel CLI
npm i -g vercel

# Trong thư mục dự án
cd saas-caneos
npm install
vercel
```

Hoặc:
1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **Import Git Repository**
3. Chọn repo → **Deploy**

## Bước 5: Set Environment Variables trên Vercel

Trong **Vercel Dashboard → Settings → Environment Variables**, thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` |

*(Không cần SUPABASE_SERVICE_ROLE_KEY trừ khi dùng admin API)*

## Bước 6: Test toàn bộ flow

1. Mở `https://your-app.vercel.app/register`
2. Đăng ký tài khoản mới
3. Confirm email (kiểm tra hộp thư)
4. Login → auto-redirect đến `/onboarding/store`
5. Điền thông tin cửa hàng → Tạo menu mẫu
6. Vào dashboard, POS, reports để kiểm tra

## Cấu hình Super Admin

Để cấp quyền super_admin cho một tài khoản:
```sql
update profiles
set system_role = 'super_admin'
where email = 'admin@yourcompany.com';
```
Sau đó truy cập `/admin` để thấy admin panel.

## Checklist Production

- [ ] Xác nhận RLS bật cho tất cả bảng (Supabase → Table Editor → RLS)
- [ ] SMTP email đã cấu hình (Supabase → Settings → Auth → SMTP)
- [ ] Backup policy đã bật (Supabase → Settings → Backups)
- [ ] Rate limiting trên Vercel (tuỳ chọn)
- [ ] Custom domain đã cấu hình
