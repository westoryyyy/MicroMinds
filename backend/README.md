# MicroMinds Backend

Monorepo backend untuk marketplace micro-API di Monad testnet.

## Struktur

```
backend/
  apps/
    api/          # NestJS gateway (port 3000)
    indexer/      # Envio HyperIndex (Phase 6)
  packages/
    mcp-server/   # MCP Server (Phase 5)
```

## Prasyarat

- Node.js v18+
- pnpm v8+
- PostgreSQL (atau Supabase)

## Setup Lokal

```bash
# 1. Copy env
cp .env.example apps/api/.env

# 2. Edit apps/api/.env dengan kredensial kamu
#    (DATABASE_URL, ALCHEMY_RPC_URL, dll)

# 3. Install dependencies
cd apps/api && pnpm install

# 4. Jalankan migration DB
pnpm db:migrate

# 5. Seed data demo
pnpm db:seed

# 6. Jalankan dev server
pnpm dev
```

## Environment Variables

Lihat [.env.example](.env.example) untuk daftar lengkap.

> ⚠️ **JANGAN COMMIT `.env` atau PRIVATE KEY**

## API Endpoints

| Method | Path | Auth | Keterangan |
|--------|------|------|------------|
| GET | /health | - | Health check |
| GET | /listings | - | Daftar API listing |
| GET | /listings/:id | - | Detail listing |
| POST | /api-keys | - | Buat API key |
| POST | /call | API key | Panggil API + bayar escrow |
| GET | /calls?consumer=0x | API key | Riwayat panggilan |
| GET | /me | API key | Info wallet + saldo |

## Fase Pengembangan

- [x] **Fase 1**: Scaffold (listings, auth, DB migration)
- [ ] **Fase 2**: Escrow Service (viem, Monad testnet)
- [ ] **Fase 3**: Gateway (POST /call, 10 langkah)
- [ ] **Fase 4**: Dummy Provider
- [ ] **Fase 5**: MCP Server
- [ ] **Fase 6**: Envio Indexer
