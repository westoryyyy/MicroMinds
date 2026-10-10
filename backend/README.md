# MicroMinds Backend

Monorepo backend untuk marketplace micro-API di Monad testnet.

## Struktur Direktori

```
backend/
  apps/
    api/          # NestJS gateway (berjalan di port 3001)
  package.json    # Berisi script untuk menjalankan aplikasi via pnpm workspaces
```

## Prasyarat

- Node.js v18+
- pnpm v8+
- PostgreSQL (Jalankan via Docker atau layanan cloud seperti Supabase)

## Setup & Instalasi Lokal

Lakukan langkah-langkah berikut di folder `backend/`:

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Setup Environment Variables**
   Masuk ke folder `apps/api/` dan buat file `.env`:
   ```bash
   cd apps/api
   cp .env.example .env
   ```
   Isi file `.env` dengan kredensial yang tepat (DATABASE_URL, ALCHEMY_RPC_URL, dll).

3. **Jalankan Migrasi Database & Seed Data Demo**
   Kembali ke root folder `backend/` dan jalankan:
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

4. **Jalankan Server Development**
   Untuk menyalakan API Server, gunakan command ini dari folder root `backend/`:
   ```bash
   pnpm dev:api
   ```
   Server akan berjalan di `http://localhost:3001`.

## Penjelasan Mode "MOCK" (Penting untuk Testing)

Dalam file `.env` di folder `apps/api/`, terdapat 2 konfigurasi penting untuk keperluan testing/Hackathon tanpa harus terblokir oleh kendala jaringan blockchain atau biaya API pihak ketiga:

- `ESCROW_MOCK=true` : Menggunakan saldo bohongan (simulasi). Sangat berguna saat jaringan Monad Testnet sedang mahal gas fee-nya. Jika di set `false`, Gateway akan benar-benar membaca saldo dari Smart Contract asli.
- `LLM_MOCK=true` : Mengembalikan balasan AI simulasi (mock string) tanpa memanggil OpenRouter sungguhan. Set ke `false` jika Anda sudah memasukkan `LLM_API_KEY` (OpenRouter) yang valid.

> ⚠️ **Catatan:** Jika mengubah variabel `.env`, Anda HARUS me-restart server (`pnpm dev:api`).

## API Endpoints Utama

- `GET /health` : Mengecek status Gateway.
- `GET /listings` : Mendapatkan daftar API (shop) yang tersedia.
- `POST /api-keys` : Generate API Key baru. Membutuhkan Auth Token dari Privy.
- `POST /call` : Endpoint utama Gateway. Menahan (reserve) saldo tMON, meneruskan request ke AI, menghitung token usage, dan memotong saldo (finalize).

> ⚠️ **JANGAN COMMIT `.env` ATAU PRIVATE KEY**
