# Manual Independent Review

**Reviewer**: Senior Solidity Engineer & Smart Contract Auditor
**Scope**: `src/Escrow.sol` (Skeleton)

## 1. Kuasa Operator
**Verdict**: Kuasa Operator bersifat mutlak (*single point of failure* / *trusted*).
**Bukti**:
- Fungsi `reserve`, `release`, dan `refund` dijaga oleh `onlyOperator`.
- **Bisa memakai saldo konsumen mana pun?** Dalam skeleton belum terlihat implementasinya, namun berdasarkan spesifikasi, operator berhak memanggil `reserve` menggunakan alamat konsumen mana pun.
- **Bisa mengarahkan ke provider mana pun?** Berdasarkan fungsi `reserve(bytes32, address, address provider, uint256)`, operator yang menyuplai argumen `provider`, sehingga operator dapat memanipulasi tujuan pelepasan dana jika kuncinya bocor.
- **Dampak jika kunci bocor?** Peretas dapat menggunakan kunci operator untuk memindahkan seluruh saldo pengguna (dengan melakukan *reserve* fiktif dan me-*release* ke alamat peretas).
- **Penghentian oleh owner**: Terdapat `setOperator(address newOperator) external onlyOwner`. Owner dapat mengganti alamat operator yang dikompromikan kapan saja, namun tidak ada *pause* secara global untuk menahan transaksi saat penggantian berlangsung.

## 2. Kunci Owner dan Operator
**Verdict**: Kunci owner dan operator harus berbeda secara operasional, namun saat `constructor` dijalankan keduanya dapat diset dengan alamat apa pun (kecuali address 0 untuk operator).
**Bukti**: `Escrow.sol:99-105` (constructor). Tidak ada batasan `initialOwner != initialOperator` pada kode saat ini. Ini berpotensi membahayakan jika deployer menggunakan dompet yang sama untuk keduanya karena akan melanggar *separation of concern*.

## 3. Akuntansi dan Invariant Saldo
**Verdict**: Belum dapat dinilai karena logika transfer dan pembukuan masih `revert("TODO")`.
**Catatan Penting untuk Implementasi**:
- Harus dipastikan: `address(this).balance >= sum(balances)`.
- Tidak ada *fee* dalam kontrak, jadi seharusnya *strict equality* bisa dipertahankan kecuali ada yang memaksa mengirim MON via *selfdestruct* atau *coinbase reward*.
- **Jalur dana terkunci permanen**: Jika `release` atau `refund` gagal (misalnya karena call/transfer revert saat mencoba mengirim ke *smart contract*), dan tidak ada mekanisme *pull/withdrawal* untuk fallback, maka dana bisa tersangkut berstatus `Reserved` selamanya. Disarankan menggunakan pola *pull-over-push* (ubah *balances* alih-alih transfer langsung). Sesuai komentar baris 10: `withdraw their own balances (pull-over-push)` — ini adalah desain yang sangat tepat.

## 4. Reentrancy dan Urutan State Update
**Verdict**: Aman secara arsitektur berkat pola *pull-over-push* dan `nonReentrant`.
**Bukti**: 
- Terdapat modifier `nonReentrant` pada `withdraw` (baris 124).
- Jika implementasi ke depannya mengubah *state* balances sebelum melakukan *external call* `call{value}`, reentrancy tidak akan mempan. Jika penerima menolak dana, *withdraw* akan revert dan saldo tidak terpotong (hanya merugikan diri sendiri).

## 5. Edge Cases
**Verdict**: Perlu diperhatikan pada saat implementasi.
- **Amount sangat besar / Overflow**: Solidity ^0.8.24 memiliki built-in overflow/underflow protection.
- **callId collision**: Spesifikasi mensyaratkan `callId` unik. Jika implementasi `reserve` tidak mengecek eksistensi `calls[callId]`, maka data *reserved* sebelumnya bisa tertimpa.
- **Consumer == Provider**: Bisa terjadi jika layanan saling memanggil, seharusnya tidak masalah pada akuntansi.

## 6. Kesesuaian Event dengan Spesifikasi
**Verdict**: Sesuai dengan Envio indexer.
**Bukti**: Semua parameter `indexed` pada fungsi `Reserved`, `Released`, dan `Refunded` sudah diletakkan dengan urutan yang sama persis seperti di `ESCROW_SPEC.md` (baris 77-88).

## 7. Monad-specific Gas & Reserve Balance
**Verdict**: Perilaku spesifik Monad memengaruhi *EOA Caller*, bukan kontrak secara langsung.
**Bukti**:
- Cadangan/Reserve Balance 10 MON dibebankan ke akun EOA yang mengirim transaksi (Operator/User). Kontrak `Escrow` sendiri tidak akan terkena aturan ini saat memindahkan *internal balances*. Namun, pengguna tidak dapat melakukan `deposit` jika `depositAmount + gasLimit * gasPrice + 10 MON` melampaui saldo dompet mereka di L1.

## 8. Kualitas Test
**Verdict**: 0% coverage.
**Bukti**: Hasil `forge coverage` menunjukkan 0. Pengujian masih absen.
