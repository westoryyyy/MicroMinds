# Referensi Jaringan dan Pengaruh ke Smart Contract

Dokumen ini berisi rangkuman temuan dari sumber resmi terkait desain Monad Testnet dan bagaimana kita menyikapi perbedaannya terhadap Ethereum dalam pengembangan Escrow ini.

## 1. Pemotongan Gas (Gas Charging)
**Sumber**: [Monad Docs: Differences - Transactions](https://docs.monad.xyz/developer-essentials/differences)
> "Transactions are charged based on gas limit rather than gas usage, i.e. total gas deducted from the sender's balance is `value + gas_bid * gas_limit`."

**Implikasi untuk Escrow:**
- Kontrak Escrow tetap berjalan normal, tetapi di sisi dApp (Frontend / Operator backend), sangat penting untuk **tidak mengatur gas limit terlalu tinggi**. Pengaturan estimasi gas yang tidak akurat akan menyebabkan uang user/operator terpotong jauh lebih banyak dari yang dibutuhkan meskipun eksekusi lebih murah.

## 2. Reserve Balance (10 MON)
**Sumber**: [Monad Docs: Reserve Balance](https://docs.monad.xyz/developer-essentials/reserve-balance)
> "Reserve Balance mechanism ... ensure that all EOAs must have enough MON in their account to pay for gas... Execution time: during execution, transactions revert due to value spend when that account's ending balance (before refunds) dips below `user_reserve_balance` (10 MON)."

**Implikasi untuk Escrow:**
- **Status:** **⚠️ PERLU DIVERIFIKASI** (Apakah balances internal mapping aman).
- Hipotesis kami: Aturan Reserve Balance yang bisa me-revert transaksi ini diberlakukan pada level **saldo native token di EOA (Externally Owned Account)** pengguna saat membelanjakan nilainya (keluar dari EOA).
- Ini **bukan sembarang transaksi**. Yang ditolak adalah **transaksi yang benar-benar menurunkan saldo akun di bawah threshold 10 MON**, bukan semua transaksi dari akun yang saldonya < 10 MON (akun < 10 MON tetap bisa mengirim transaksi asalkan saldo tidak semakin berkurang melewati batas tersebut).
- Oleh karena Reserve Balance hanya berlaku di tingkat EOA, saldo deposit `balances[user]` di dalam mapping kontrak kita diasumsikan **tidak terkena aturan Reserve Balance 10 MON ini**.
- *Mitigasi Deployment/Testing:* Wallet deployer, operator, dan pengirim `deposit()` tidak boleh menghabiskan seluruh sisa saldonya. Mereka harus menyisakan >= 10 MON dalam wallet mereka.

## 3. Kompatibilitas Versi (OpenZeppelin & Solidity)
- Berdasarkan hasil instalasi paket, versi `OpenZeppelin` yang terpasang adalah **v5.3.0**.
- Dari pengecekan langsung pada source code file seperti `Ownable.sol` dan `ReentrancyGuard.sol`, pragma minimum yang diminta OpenZeppelin v5.3.0 adalah `pragma solidity ^0.8.20;`.
- Atas dasar tersebut dan memastikan kompabilitas modern tanpa menginjak limit Monad, kita menggunakan **Solidity versi `^0.8.24`** untuk kontrak `Escrow.sol`.
