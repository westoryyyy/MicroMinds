# Spesifikasi Kontrak Escrow MicroMinds

## 1. Ikhtisar
Escrow berbasis *Pull-over-Push* yang menerima native token (MON). Kontrak ini memungkinkan Operator untuk mereservasi (*reserve*), melepaskan (*release*), atau mengembalikan (*refund*) dana untuk API Calls, sementara entitas Pengguna (Consumer/Provider) melakukan penarikan mandiri (*withdraw*).

## 2. Struktur Data dan Status
### 2.1 State Machine API Call (`Status` enum)
- `None` (0): ID belum pernah digunakan atau tidak ada.
- `Reserved` (1): Dana berhasil dialokasikan, menunggu penyelesaian.
- `Released` (2): Eksekusi API sukses, dana diteruskan ke Provider.
- `Refunded` (3): Eksekusi API gagal, dana dikembalikan ke Consumer.

### 2.2 Entitas Call (`struct Call`)
```solidity
struct Call {
    address consumer;
    address provider;
    uint256 amount;
    Status status;
    uint256 expiry;
}
```

## 3. Fungsi & Validasi Input

### Fungsi Publik untuk User
1. **`deposit()`** `payable`
   - Menambahkan `msg.value` ke saldo native token milik pengirim (`msg.sender`).
2. **`withdraw(uint256 amount)`**
   - Validasi: `amount > 0` (revert dengan `ZeroAmount()`).
   - Validasi: `balances[msg.sender] >= amount` (revert dengan `InsufficientBalance()`).
   - Melakukan CEI (Checks-Effects-Interactions) dengan `nonReentrant`.
   - Revert dengan `TransferFailed()` jika `call{value: amount}("")` gagal.
3. **`forceRefund(bytes32 callId)`**
   - Hanya dapat dipanggil oleh Consumer (`NotConsumer()`).
   - Mengembalikan dana yang tersangkut di `Reserved` (`CallNotReserved()`) jika waktu `expiry` sudah lewat (`CallNotExpired()`).

### Fungsi Operator
1. **`reserve(bytes32 callId, address consumer, address provider, uint256 amount)`**
   - Hanya dapat dipanggil Operator (`NotOperator()`).
   - Validasi input:
     - `amount > 0` (`ZeroAmount()`)
     - `consumer` dan `provider` tidak boleh `address(0)` (`ZeroAddress()`)
     - `calls[callId].status` harus `None` (`CallAlreadyExists()`)
   - Validasi bisnis: Saldo consumer harus >= amount (`InsufficientBalance()`).
   - Mengurangi saldo consumer, menyimpan struct, dan men-set `expiry` ke `block.timestamp + 1 days`.
2. **`release(bytes32 callId)`**
   - Hanya Operator.
   - `calls[callId].status` harus `Reserved` (`CallNotReserved()`).
   - Mengubah status ke `Released`, menambahkan `amount` ke `balances[provider]`.
3. **`refund(bytes32 callId)`**
   - Hanya Operator.
   - `calls[callId].status` harus `Reserved` (`CallNotReserved()`).
   - Mengubah status ke `Refunded`, mengembalikan `amount` ke `balances[consumer]`.

### Fungsi Admin (Owner)
1. **`setOperator(address newOperator)`**
   - Hanya dapat dipanggil Owner (OpenZeppelin Ownable).
   - Validasi: `newOperator != address(0)` (`ZeroAddress()`).
   - Memperbarui `operator`.

## 4. Daftar 8 Custom Error Eksplisit
Demi menghemat gas, kita menggunakan custom error Solidity daripada require string.
1. `NotOperator()`: Pemanggil bukan operator.
2. `ZeroAmount()`: Nominal deposit/withdraw/reserve bernilai 0.
3. `InsufficientBalance()`: Saldo consumer kurang saat reserve/withdraw.
4. `CallAlreadyExists()`: `callId` yang dipakai reserve sudah tidak `None`.
5. `CallNotReserved()`: Mencoba release/refund pada panggilan yang belum di-reserve.
6. `ZeroAddress()`: Alamat input (operator/consumer/provider) bernilai nol.
7. `TransferFailed()`: Pengiriman native token saat withdraw gagal.
8. `DirectPaymentNotAllowed()`: Pengguna mencoba mengirim uang tanpa memanggil `deposit()`.
9. `CallNotExpired()`: Pengguna mencoba `forceRefund` sebelum waktunya habis (1 hari).
10. `NotConsumer()`: Pemanggil fungsi yang dilindungi consumer ternyata bukan haknya.

## 5. Daftar 6 Event
1. `Deposited(address indexed account, uint256 amount)`
2. `Withdrawn(address indexed account, uint256 amount)`
3. `Reserved(bytes32 indexed callId, address indexed consumer, address indexed provider, uint256 amount)`
4. `Released(bytes32 indexed callId, address indexed provider, uint256 amount)`
5. `Refunded(bytes32 indexed callId, address indexed consumer, uint256 amount)`
6. `RefundedForcibly(bytes32 indexed callId, address indexed consumer, uint256 amount)`
7. `OperatorUpdated(address indexed oldOperator, address indexed newOperator)`
   - *Catatan Tambahan (Bukan bagian SKPL awal):* Event `OperatorUpdated` ditambahkan untuk kemudahan tracking internal, tetapi tidak wajib di-index oleh handler Envio yang berfokus ke 5 event Escrow utama.

## 6. Pertahanan (Security)
- **Tolak Pembayaran Langsung**: Terdapat `receive()` dan `fallback()` yang selalu me-revert (`DirectPaymentNotAllowed()`).
- **No ERC-20 / Pausable**: Desain dipertahankan sekecil mungkin.
- **Reentrancy**: Dilindungi modifier `nonReentrant` khusus pada jalur keluar dana `withdraw()`.
