# Mini Wallet Dashboard — React SPA

Aplikasi Single Page Application (SPA) dompet digital sederhana menggunakan **React.js** dan **Tailwind CSS**.

## ✨ Fitur Utama

1. **Halaman Login**
   - Input Email/Username dan Password (dengan toggle tampilkan/sembunyikan password).
   - Validasi input wajib diisi sebelum request dikirim.
   - Indikator **Loading State** saat proses login berlangsung.
   - Tombol **disabled** selama request untuk mencegah multiple request.
   - Penanganan error lengkap: *Email/username atau password salah*, *Field wajib diisi*, dan *Terjadi kesalahan pada server*.
   - Tombol pengisian cepat (*quick-fill*) untuk akun pengujian (`nathan` / `dummy`, `budi` / `dummy`).

2. **Halaman Dashboard**
   - **Informasi Saldo**: Tampilan saldo dengan format Rupiah standar Indonesia (`Saldo: Rp 1.500.000`).
   - **Tombol & Modal Top-up**:
     - Pilihan cepat (Rp50.000, Rp100.000, Rp250.000, Rp500.000, Rp1.000.000) atau input custom.
     - Loading state (`Memproses Top-up...`) dengan tombol disabled.
     - Saldo otomatis diperbarui setelah transaksi sukses.
     - Pesan error jelas jika request gagal.
   - **Form Transfer**:
     - Input Tujuan / Penerima & Nominal Transfer.
     - Loading state pada tombol bertuliskan `Transfer...` dengan spinner animasi.
     - Tombol dinonaktifkan (*disabled*) selama request berlangsung untuk mencegah *rapid multi-click*.
     - Validasi saldo mencukupi (`Transfer gagal: Saldo tidak cukup.`).
     - Pembaruan saldo dan riwayat transaksi secara reaktif setelah berhasil.

3. **Tabel Riwayat Transaksi**
   - Menampilkan 4 kolom utama: **Tanggal**, **Tipe** (Transfer/Top-up), **Nominal**, dan **Status** (*Success* / *Failed*).
   - Menampilkan *Skeleton Loading state* saat data transaksi sedang diambil.
   - Penanganan error state jika gagal mengambil riwayat transaksi beserta tombol **Coba Lagi** (*Retry*).

4. **Error Handling Komprehensif**
   - Menangani Login gagal, Top-up gagal, Transfer gagal, Saldo tidak cukup, Server error, dan Gagal memuat data.
   - Desain alert ramah pengguna dengan tombol tutup (*dismissable*).

5. **Loading State & Anti Multiple Request**
   - Setiap tombol submit memiliki state lock (`isLoading`) dan properti `disabled`.
   - Melindungi dari pengiriman form berulang (*duplicate submit*).

6. **Strategi Token Aman (Bonus)**
   - API Client dikonfigurasi dengan `credentials: 'include'` untuk mendukung autentikasi berbasis **HttpOnly Cookie** dari backend, mencegah token terekspos dari celah serangan XSS.
   - Dilengkapi mock engine terintegrasi yang aktif secara otomatis jika backend server belum berjalan di port lokal, memungkinkan pengujian antarmuka secara instan.

---

## 🚀 Cara Menjalankan

### 1. Masuk ke direktori project
```bash
cd mini-wallet-spa
```

### 2. Jalankan mode pengembangan (Development)
```bash
npm run dev
```
Buka browser pada URL yang ditampilkan di terminal (default: `http://localhost:5173`).

### 3. Build untuk Produksi
```bash
npm run build
```

---

## 📁 Struktur Direktori

```
mini-wallet-spa/
├── src/
│   ├── api/
│   │   └── apiClient.js        # API Client dengan credentials: 'include' & fallback engine
│   ├── components/
│   │   ├── Alert.jsx           # Komponen notifikasi pesan error/sukses
│   │   ├── BalanceCard.jsx     # Kartu tampilan saldo dan tombol aksi Top-up
│   │   ├── Navbar.jsx          # Navigasi atas, identitas pengguna, tombol logout
│   │   ├── TopUpModal.jsx      # Modal input top-up saldo & pilihan cepat
│   │   ├── TransactionTable.jsx# Tabel riwayat mutasi transaksi
│   │   └── TransferForm.jsx    # Form pengiriman dana ke penerima
│   ├── context/
│   │   └── AuthContext.jsx     # Manajemen state autentikasi (login, logout, user, balance)
│   ├── pages/
│   │   ├── DashboardPage.jsx   # Halaman Dashboard utama
│   │   └── LoginPage.jsx       # Halaman Login
│   ├── utils/
│   │   └── formatters.js       # Pemformat Rupiah (id-ID) dan tanggal (DD-MM-YYYY)
│   ├── App.jsx                 # Routing SPA sederhana (Login <-> Dashboard)
│   ├── index.css               # Direktif Tailwind CSS
│   └── main.jsx
├── .env                        # Konfigurasi VITE_API_BASE_URL
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```
