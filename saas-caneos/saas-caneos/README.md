# CanêOS SaaS 🥤

**Nền tảng quản lý đa cửa hàng cho kiosk đồ uống Việt Nam.**

## Tính năng chính

| Tính năng | Mô tả |
|-----------|-------|
| 🏪 Multi-Tenant | Nhiều chủ quán, nhiều cửa hàng, dữ liệu tách biệt |
| 👥 Phân quyền | Owner / Manager / Staff với RLS Supabase |
| 🖥️ POS | Touch-friendly, tự trừ kho theo công thức |
| 📊 Dashboard | KPI real-time, biểu đồ 30 ngày |
| 📈 Báo cáo | Ngày/tuần/tháng/quý/năm |
| 💰 Dòng tiền | Theo dõi inflow/outflow |
| 📦 Tồn kho | Tự động trừ khi bán, cảnh báo sắp hết |
| 🧪 Công thức | Gắn nguyên liệu cho từng món, tính giá vốn chính xác |
| 👷 Nhân sự | Mời thành viên qua email, phân vai trò |
| 🌙 Dark Mode | Light/Dark mode |

## Tech stack

- **Next.js 15** (App Router + Server Components + Server Actions)
- **TypeScript** strict mode
- **Tailwind CSS** + Radix UI
- **Supabase** (Auth + PostgreSQL + RLS)
- **Recharts** (biểu đồ)
- **Vercel** (hosting)

## Quick start

```bash
git clone ...
cd saas-caneos
npm install
cp .env.example .env.local
# Điền Supabase keys vào .env.local
npm run dev
```

Xem [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) để deploy production.

## Database

Chạy `supabase/migrations/0001_saas_init.sql` trong Supabase SQL Editor.

## License

MIT — free to use, modify, and deploy.
