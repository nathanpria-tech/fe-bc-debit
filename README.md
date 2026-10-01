# 💳 Mini Wallet API & SPA Dashboard

Project ini dibuat untuk memenuhi **Take Home Test / Exam Penyaluran Kerja** pengerjaan **Mini Wallet API & Dashboard**.

Proyek terdiri dari 2 bagian utama:

1. **`backend-debit`**: Express.js REST API + MySQL + JWT Auth + Database Transactions (`FOR UPDATE` & ACID Rollback)
2. **`mini-wallet-spa`**: React + Vite + Tailwind CSS SPA Dashboard (Saldo, Topup Modal, Form Transfer, Mutasi Transaksi)

---

## 🚀 Panduan Setup Cepat & Menjalankan Aplikasi

### 1. Inisialisasi Database MySQL & Seed Data

Pastikan MySQL service sudah berjalan di komputer (konfigurasi di `backend-debit/.env`).

Jalankan perintah berikut di folder `backend-debit`:

```bash
cd backend-debit
npm install
npm run seed
```

Perintah `npm run seed` secara otomatis akan:

- Membuat database `mini_wallet` (jika belum ada).
- Membuat tabel `users` dan `transactions`.
- Membuat 2 Akun Uji Cepat (Demo):
  - **Account 1:** Username: `nathan` | Email: `nathan@gmail.com` | Password: `dummy` (Saldo: Rp 100.000)
  - **Account 2:** Username: `budi` | Email: `budi@gmail.com` | Password: `dummy` (Saldo: Rp 50.000)

---

### 2. Jalankan Backend Server

Di folder `backend-debit`:

```bash
npm run dev
```

Server backend akan berjalan di `http://localhost:3000`.

---

### 3. Jalankan Frontend SPA (React)

Buka terminal baru di folder `mini-wallet-spa`:

```bash
cd mini-wallet-spa
npm install
npm run dev
```

Buka browser di `http://localhost:5173`.

---

## 🛠️ Scope & Verifikasi Requirements

### 1. BackEnd Scope:

- **Authentication:**
  - `POST /api/register` (Validasi format email `user@`, password < 8 karakter, username/email unik)
  - `POST /api/login` (Authentication JWT token)
  - `GET /api/me` (Profile recovery & verification)
  - `POST /api/logout` (Logout session)
- **Wallet & Transactions:**
  - `GET /api/wallet` (Lihat saldo saat ini)
  - `POST /api/topup` (Tambah saldo dengan validasi nominal > 0)
  - `POST /api/transfer` (Transfer saldo aman antar user dengan ACID DB Transaction `FOR UPDATE`)
  - `POST /api/transfer/check` (Pre-check validitas penerima transfer)
  - `GET /api/transactions` (Mutasi riwayat terproteksi per-user)
- **Strict Validations & Expected Behavior System:**
  - Nominal tidak boleh huruf, kosong, atau simbol.
  - Skenario invalid melempar pesan error spesifik:
    - `"Nominal harus berupa angka."`
    - `"Nominal tidak boleh kosong."`
    - `"Nominal melebihi batas maksimum transaksi."`
    - `"Saldo tidak mencukupi."`
    - `"Tidak dapat transfer ke akun sendiri."`
  - HTTP Status Codes standar: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`, `500 Server Error`.

### 2. Frontend Scope (React SPA):

- **Single Page Application Dashboard:**
  - Halaman Login & Registrasi dengan Tab Switcher.
  - Card Informasi Saldo & Tombol Top-up Modal.
  - Form Transfer dengan Real-time Format Rupiah (IDR) & Modal Konfirmasi.
  - Tabel Mutasi Transaksi (Badge Uang Masuk 🟢 & Uang Keluar 🔴).
  - Anti-Spam double click (Disabled button & loading spinners).
