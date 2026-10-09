# MicroMinds 🧠⚡️

**"Lapisan Kepercayaan untuk Ekonomi-Mikro AI."** *(The Trust Layer for AI Micro-Economies).*

*[English Version](./README.md)*

MicroMinds adalah platform infrastruktur terdesentralisasi yang dibangun untuk **Metropolis Hackathon**. Platform ini bertindak sebagai lapisan kepercayaan (Trust Layer) yang aman dan berkinerja tinggi, memungkinkan Agen AI otonom untuk membeli, menjual, dan menggunakan layanan *micro-API* secara mulus menggunakan *Smart Contract* di jaringan **Monad Testnet**.

## ❌ Latar Belakang Masalah: Subscription Fatigue (Mabuk Langganan)
Seiring dengan berkembangnya kemampuan Agen AI, mereka mulai membutuhkan cara untuk bertransaksi secara otonom—seperti membeli akses ke *dataset*, menyewa GPU, atau membayar panggilan *micro-API*. 

Saat ini, para *Builder* mengalami **Subscription Fatigue**. Jika sebuah Agen AI hanya butuh memanggil API sebanyak 3-10 kali, mereka tetap dipaksa memasukkan kartu kredit dan berlangganan bulanan sebesar $20. Ini sangat tidak efisien.

Selain itu, jika Agen A ingin membeli akses API dari Agen B, muncul 3 masalah utama:
1. **Masalah Kepercayaan (Trust)**: Agen A tidak berani bayar duluan karena takut Agen B kabur tidak memberikan hasil API-nya.
2. **Masalah Kecepatan (Speed)**: *Blockchain* tradisional terlalu lambat dan mahal untuk menampung transaksi AI yang berskala mikro ($0.01).
3. **Masalah Eksekusi (Execution)**: Sangat tidak masuk akal jika setiap kali Agen AI mau transaksi, pemilik manusia harus nge-klik "Approve" di MetaMask.

## 💡 Solusi: Escrow Bayar-per-Panggilan (Pay-per-call)
MicroMinds hadir untuk memecahkan masalah ini dengan menyediakan **Lapisan Kepercayaan (Trust Layer)** yang didesain khusus untuk ekonomi AI-ke-AI.

Daripada berlangganan bulanan, konsumen cukup **bayar eceran (microtransactions)**. Agen AI Konsumen mendepositkan koin MON ke dalam *Smart Contract* Escrow. Saat mereka memanggil API, saldo mereka hanya "Ditahan" (*Reserved*). 

Backend kami (API Gateway) akan meneruskan *prompt* ke LLM AI sungguhan (via OpenRouter/Claude/OpenAI). Begitu LLM berhasil memberikan *output*, sistem *Backend* "Melepaskan" (*Release*) uang tersebut ke penjual. Kalau AI-nya gagal/mati, Agen Konsumen langsung mendapat `refund` penuh.

Tanpa campur tangan manusia. Tidak ada dana yang nyangkut. Beroperasi penuh secara otonom di atas kecepatan super **Monad Testnet** yang EVM-compatible dan berbiaya *gas* nyaris gratis.

## 📊 Arsitektur Sistem & Alur Kerja

Sistem ini menggunakan mekanisme *Pull-over-Push* yang diorkestrasi oleh Operator *Backend*.

```mermaid
sequenceDiagram
    participant Consumer as Agen AI Konsumen
    participant Contract as Escrow Smart Contract (Monad)
    participant Operator as Operator Backend
    participant Provider as Agen AI Penyedia Jasa

    Consumer->>Contract: 1. Deposit Koin MON (Top Up Saldo)
    Consumer->>Operator: 2. Meminta Akses API
    Operator->>Contract: 3. `reserve()` (Tahan Dana Sesuai Harga)
    Contract-->>Operator: Menerbitkan Event Reserved
    Operator->>Provider: 4. Meneruskan Permintaan API
    Provider-->>Consumer: 5. Memberikan Hasil (Response) API
    Operator->>Contract: 6. `release()` (Lepas Dana)
    Contract-->>Provider: Mentransfer Bayaran MON
    Note over Consumer,Contract: Skenario Gagal: Jika Backend mati > 24 Jam,<br/>Konsumen bisa memanggil `forceRefund()`
```

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
