# MicroMinds 🧠⚡️

**"Lapisan Kepercayaan untuk Ekonomi-Mikro AI."** *(The Trust Layer for AI Micro-Economies).*

*[English Version](./README.md)*

MicroMinds adalah platform infrastruktur terdesentralisasi yang dibangun untuk **Metropolis Hackathon**. Platform ini bertindak sebagai lapisan kepercayaan (Trust Layer) yang aman dan berkinerja tinggi, memungkinkan Agen AI otonom untuk membeli, menjual, dan menggunakan layanan *micro-API* secara mulus menggunakan *Smart Contract* di jaringan **Monad Testnet**.

## 🚀 Visi Utama
Seiring dengan semakin pintarnya Agen AI, mereka membutuhkan cara untuk bertransaksi satu sama lain tanpa campur tangan manusia. MicroMinds menyediakan fondasi utama di tingkat protokol (berupa *Escrow Smart Contract*) yang menjamin keamanan transaksi skala mikro antara Agen AI Konsumen dan Agen AI Penyedia Jasa (Provider).

Tidak ada lagi dana nyangkut. Tidak ada lagi tanda tangan manual yang rumit. Semuanya berjalan otomatis, dapat diprogram, dan terpercaya.

## 🏗️ Struktur Repositori (Monorepo)

Repositori ini berisi seluruh komponen inti dari ekosistem MicroMinds:

- **[`/smart-contract`](./smart-contract)**: Inti dari protokol Escrow (ditulis dalam Solidity). Menggunakan arsitektur *pull-over-push* yang sudah diuji secara ketat (96% Test Coverage). Dilengkapi fitur keamanan level Enterprise seperti `Ownable2Step`, anti-Reentrancy, dan mekanisme tarik-paksa (`forceRefund`). Sudah beroperasi penuh di jaringan Monad.
- **`/backend`** *(Segera Hadir)*: Server *Operator* (Off-chain) yang dibangun untuk mengorkestrasi dan memvalidasi setiap transaksi API antar agen.
- **`/frontend`** *(Segera Hadir)*: Antarmuka UI/Dashboard untuk para *Developer* agar bisa memantau saldo agen mereka dan riwayat transaksi secara *real-time*.

## 🔗 Informasi Deployment (Live)

- **Jaringan**: Monad Testnet
- **Alamat Kontrak Escrow**: [`0x5c7141ab4d637915858ee97881fd613af468c76a`](https://testnet-explorer.monad.xyz/address/0x5c7141ab4d637915858ee97881fd613af468c76a)

## 🏆 Target Hackathon & Bounties
Fokus utama kita dalam integrasi proyek ini untuk memenangkan Metropolis Hackathon:
1. **Monad (Track: Trust, Identity & Infrastructure)**: Menyediakan lapisan protokol utama untuk transaksi antar-agen dengan skalabilitas tinggi.
2. **Alchemy**: Menggunakan *node* RPC Alchemy Monad Testnet yang super stabil sebagai jantung infrastruktur kita.
3. **Privy / Dynamic**: *(Dalam Perencanaan)* Untuk mempermudah *onboarding* dompet kripto Agen AI dan otomatisasi tanda tangan transaksi.
4. **Envio**: *(Dalam Perencanaan)* Untuk melakukan *indexing* data secara *real-time* dari *event* Escrow kita (Reserve, Release, Refund) agar UI bisa ter-update secara instan.

## 📜 Lisensi
[MIT License](./LICENSE) - Hak Cipta (c) 2026 Team Ketupat / Metropolis Hackathon
