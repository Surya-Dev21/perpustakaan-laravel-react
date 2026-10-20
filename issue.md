# [FEATURE ISSUE] Perencanaan Implementasi Admin Dashboard & Kelola Buku (CRUD, Kategori, Stok & Status Ketersediaan)

---

## 📌 1. Ringkasan Eksekutif & Tujuan
Dokumen ini merupakan panduan implementasi teknis (*technical implementation specification*) lengkap untuk membangun **Dashboard Admin** dan **Modul Manajemen Buku & Kategori** pada aplikasi perpustakaan berbasis **Laravel (Backend)** dan **React Vite (Frontend)**.

Dokumen ini dirancang modular dan presisi agar dapat langsung dieksekusi oleh junior programmer atau model AI dengan prompt berbasis tahapan (*prompt-driven development*).

---

## 🎯 2. Lingkup Fitur (Feature Scope)
1. **Dashboard Admin**:
   - Menampilkan kartu ringkasan metrik statistik perpustakaan (Total Judul Buku, Total Eksemplar Stok, Buku Sedang Dipinjam, Buku Habis/Kritis, dan Total Kategori).
   - Pintasan cepat (*quick action buttons*) untuk tambah buku dan kelola kategori.
2. **Kelola Kategori Buku (CRUD)**:
   - Tambah kategori baru, edit nama & deskripsi kategori, dan hapus kategori.
   - Proteksi integritas data: Kategori tidak boleh dihapus jika masih terkait dengan minimal 1 buku.
3. **Kelola Katalog Buku (CRUD Lengkap)**:
   - Menampilkan daftar buku dalam tabel responsif dengan paginasi.
   - Formulir tambah buku dengan validasi menyeluruh.
   - Halaman/Modal lihat detail buku lengkap.
   - Ubah informasi buku (judul, penulis, penerbit, isbn, tahun terbit, kategori, stok, sinopsis, cover).
   - Hapus buku (dengan konfirmasi keamanan dan pengecekan transaksi peminjaman aktif).
4. **Pencarian, Filter, & Pengurutan**:
   - Pencarian teks dengan *debouncing* (berdasarkan Judul, Penulis, atau ISBN).
   - Filter berdasarkan Kategori.
   - Filter berdasarkan Status Ketersediaan (Semua, Tersedia, Habis).
   - Sorting berdasarkan Judul (A-Z / Z-A), Tahun Terbit, atau Jumlah Stok.
5. **Kalkulasi & Manajemen Stok Otomatis**:
   - Input dan penyesuaian kuantitas stok buku fisik.
   - Perhitungan dinamis stok tersedia:
     $$\text{Stok Tersedia} = \max(0, \text{Stok Fisik Total} - \text{Total Buku Sedang Dipinjam})$$
   - Penentuan status ketersediaan visual:
     - Jika $\text{Stok Tersedia} > 0$ $\rightarrow$ Status: **Tersedia** (Badge Hijau)
     - Jika $\text{Stok Tersedia} \le 0$ $\rightarrow$ Status: **Habis / Sedang Dipinjam** (Badge Merah)

---

## 🗄️ 3. Arsitektur Database & Relasi (Backend Laravel)

### A. Tabel `categories`
| Kolom | Tipe Data | Atribut & Aturan |
| :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key, Auto Increment |
| `nama_kategori` | `VARCHAR(100)` | Unique, Not Null |
| `slug` | `VARCHAR(120)` | Unique, Not Null |
| `deskripsi` | `TEXT` | Nullable |
| `created_at` / `updated_at` | `TIMESTAMP` | Default Laravel timestamps |

### B. Tabel `books` (atau `bukus`)
| Kolom | Tipe Data | Atribut & Aturan |
| :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key, Auto Increment |
| `kategori_id` | `BIGINT` | Foreign Key $\rightarrow$ `categories.id` (`onDelete('restrict')`) |
| `judul` | `VARCHAR(255)` | Not Null, Indexed |
| `penulis` | `VARCHAR(150)` | Not Null |
| `penerbit` | `VARCHAR(150)` | Not Null |
| `isbn` | `VARCHAR(25)` | Unique, Not Null |
| `tahun_terbit` | `SMALLINT` / `INT(4)` | Not Null (contoh: 2024) |
| `stok` | `INT` | Not Null, Default 0, Unsigned (`stok >= 0`) |
| `sinopsis` | `TEXT` | Nullable |
| `cover` | `VARCHAR(255)` | Nullable (Path penyimpanan atau URL) |
| `deleted_at` | `TIMESTAMP` | Nullable (Soft Deletes) |
| `created_at` / `updated_at` | `TIMESTAMP` | Default Laravel timestamps |

### C. Relasi Eloquent Model
- **Model `Category` (`backend/app/Models/Category.php`)**:
  ```php
  public function books()
  {
      return $this->hasMany(Book::class, 'kategori_id');
  }
  ```
- **Model `Book` (`backend/app/Models/Book.php`)**:
  ```php
  protected $fillable = [
      'kategori_id', 'judul', 'penulis', 'penerbit',
      'isbn', 'tahun_terbit', 'stok', 'sinopsis', 'cover'
  ];

  protected $appends = ['stok_tersedia', 'status_ketersediaan'];

  public function category()
  {
      return $this->belongsTo(Category::class, 'kategori_id');
  }

  public function peminjamanDetail()
  {
      return $this->hasMany(PeminjamanDetail::class, 'buku_id');
  }

  // Accessor: Stok Tersedia
  public function getStokTersediaAttribute(): int
  {
      $dipinjam = $this->peminjamanDetail()
          ->whereHas('peminjaman', function ($query) {
              $query->whereIn('status', ['dipinjam', 'menunggu_pengembalian']);
          })
          ->count();

      return max(0, $this->stok - $dipinjam);
  }

  // Accessor: Status Ketersediaan
  public function getStatusKetersediaanAttribute(): string
  {
      return $this->stok_tersedia > 0 ? 'Tersedia' : 'Habis';
  }
  ```

---

## 🔌 4. Spesifikasi Kontrak API (RESTful Endpoints)

Semua endpoint admin harus diproteksi middleware autentikasi dan otorisasi role admin (`auth:sanctum`, `role:admin`).
Base URL standar: `/api` (dapat dikonfigurasi via `VITE_API_BASE_URL`).

### A. Dashboard Metrics
- **`GET /api/admin/dashboard`**
  - **Deskripsi**: Mengambil metrik data agregat.
  - **Contoh Response 200 OK**:
    ```json
    {
      "status": "success",
      "data": {
        "total_judul_buku": 128,
        "total_stok_buku": 520,
        "total_buku_dipinjam": 42,
        "total_kategori": 14,
        "stok_habis": 5
      }
    }
    ```

### B. Kategori Buku (`/api/categories`)
- **`GET /api/categories`**: Mengambil semua kategori (dukungan filter pencarian).
- **`POST /api/categories`**: Membuat kategori baru.
  - Body: `{ "nama_kategori": "Teknologi", "deskripsi": "Buku komputer dan IT" }`
- **`PUT /api/categories/{id}`**: Memperbarui nama/deskripsi kategori.
- **`DELETE /api/categories/{id}`**: Menghapus kategori.
  - *Catatan*: Kembalikan status HTTP `422 Unprocessable Entity` jika kategori masih memiliki relasi buku aktif.

### C. Katalog Buku (`/api/books`)
- **`GET /api/books`**: Mengambil daftar buku (terpaginasi).
  - **Query Parameters**:
    - `page` (default: 1)
    - `per_page` (default: 10)
    - `search` (opsional: string judul/penulis/isbn)
    - `kategori_id` (opsional: integer)
    - `status` (opsional: `tersedia` | `habis`)
    - `sort_by` (opsional: `judul` | `tahun_terbit` | `stok`, default: `created_at`)
    - `order` (opsional: `asc` | `desc`, default: `desc`)
- **`GET /api/books/{id}`**: Mengambil detail satu buku beserta relasi kategori dan riwayat peminjaman singkat.
- **`POST /api/books`**: Menambahkan buku baru.
  - Body (Multipart/JSON): `judul`, `penulis`, `penerbit`, `isbn`, `tahun_terbit`, `kategori_id`, `stok`, `sinopsis`, `cover` (file image opsional).
- **`PUT /api/books/{id}`** atau **`POST /api/books/{id}?_method=PUT`**: Memperbarui informasi buku.
- **`DELETE /api/books/{id}`**: Menghapus buku.
  - *Catatan*: Tolak penghapusan jika buku sedang berstatus dipinjam.
- **`PATCH /api/books/{id}/stok`**: Mengubah kuantitas stok fisik buku secara langsung.

---

## 🎨 5. Spesifikasi Komponen & Antarmuka Frontend (React)

### A. Struktur File & Folder
```text
frontend/src/
├── pages/
│   └── Admin/
│       ├── Dashboard.jsx            // Tampilan ringkasan metrik statistik
│       ├── KelolaBuku.jsx           // Tabel buku, filter, pagination, tombol aksi
│       ├── BookForm.jsx             // Form tambah / ubah buku
│       ├── BookDetailModal.jsx      // Modal detail lengkap informasi buku
│       ├── KelolaKategori.jsx       // Modal / halaman CRUD kategori
│       └── style/
│           ├── Dashboard.css
│           ├── KelolaBuku.css
│           └── BookForm.css
├── components/
│   ├── AdminNavbar.jsx              // Menu navigasi admin (Dashboard, Buku, Kategori, User, Transaksi)
│   ├── BookFilterBar.jsx            // Input search debounced, filter kategori, filter status
│   ├── StockBadge.jsx               // Badge status ketersediaan & jumlah stok
│   └── ConfirmModal.jsx             // Modal konfirmasi aksi hapus aman
└── services/
    ├── api.js                       // Axios / Fetch wrapper terpusat
    ├── bookService.js               // Fungsi pemanggil API buku
    └── categoryService.js           // Fungsi pemanggil API kategori
```

### B. Kebutuhan UX & Interaksi Frontend
1. **Debounced Search**:
   - Panggilan pencarian pada input teks wajib menggunakan *debounce* (350–500ms) agar tidak membanjiri server dengan HTTP request pada setiap ketukan keyboard.
2. **Loading Skeleton & Empty State**:
   - Tampilkan skeleton loader atau spinner saat fetching data.
   - Tampilkan visual empty state jika filter menghasilkan 0 data buku.
3. **Modal Konfirmasi Penghapusan**:
   - Dilarang keras menggunakan `window.confirm()`. Gunakan modal dialog khusus yang memuat nama buku yang akan dihapus beserta peringatan dampak.
4. **Validasi Form Sisi Klien**:
   - Tahun terbit dibatasi antara tahun 1900 hingga $\text{Tahun Sekarang} + 1$.
   - Stok tidak boleh minus (`min="0"`).
   - Notifikasi error validasi field dari respon backend Laravel (misal HTTP 422) wajib dipetakan ke field masing-masing.

---

## 👣 6. Tahapan Eksekusi Langkah-demi-Langkah (Step-by-Step Execution)

Pelaksana (junior programmer atau AI model) **wajib** mengikuti urutan kerja di bawah ini secara disiplin:

### **Tahap 1: Persiapan Database & Migrasi (Backend)**
1. Periksa file migrasi pada `backend/database/migrations/`.
2. Pastikan tabel `categories` memiliki kolom: `id`, `nama_kategori`, `slug`, `deskripsi`.
3. Buat migration baru jika tabel `books` belum memiliki kolom: `isbn`, `tahun_terbit`, `sinopsis`, `stok`, `cover`.
4. Jalankan migrasi: `php artisan migrate`.
5. Buat Database Seeder (`CategorySeeder` & `BookSeeder`) dengan minimal 15 buku contoh dan 5 kategori untuk memudahkan pengujian.

### **Tahap 2: Model, Accessor, & Query Scope (Backend)**
1. Buka `backend/app/Models/Book.php` (atau `Buku.php`).
2. Pasang relasi `belongsTo(Category::class)` dan `hasMany(PeminjamanDetail::class)`.
3. Tambahkan accessor `stok_tersedia` dan `status_ketersediaan` beserta deklarasi `$appends`.
4. Tambahkan query scope `scopeFilter($query, array $filters)` untuk menangani search, filter kategori, dan status.

### **Tahap 3: Form Request & Controller (Backend)**
1. Buat Form Request:
   - `StoreBookRequest` (validasi: `judul` required, `isbn` required & unique, `stok` integer & min 0, `kategori_id` exists).
   - `UpdateBookRequest` (validasi: `isbn` unique kecuali id buku saat ini).
2. Lengkapi `BukuController.php`:
   - `index()`: paginate dengan filter.
   - `store()`: upload cover jika ada, simpan data.
   - `show()`: kembalikan detail buku beserta kategorinya.
   - `update()`: perbarui data dan ganti cover jika diunggah baru.
   - `destroy()`: validasi apakah sedang dipinjam; jika aman, hapus data.
3. Buat `KategoriController.php` dengan penanganan penghapusan aman (`restrict`).
4. Buat method ringkasan data di `DashboardController.php` atau `BukuController::dashboardStats()`.
5. Daftarkan seluruh rute di `backend/routes/api.php`.

### **Tahap 4: Layer Service & State API (Frontend)**
1. Buat `frontend/src/services/bookService.js` dan `frontend/src/services/categoryService.js`.
2. Gunakan `import.meta.env.VITE_API_BASE_URL` sebagai basis endpoint.
3. Buat fungsi: `getBooks(params)`, `getBookById(id)`, `createBook(formData)`, `updateBook(id, formData)`, `deleteBook(id)`, `getCategories()`.

### **Tahap 5: Halaman Kelola Kategori (Frontend)**
1. Buat halaman atau modal `KelolaKategori.jsx`.
2. Sediakan tabel daftar kategori dengan aksi edit dan hapus.
3. Pasang validasi formulir dan toast notifikasi saat berhasil/gagal.

### **Tahap 6: Form Tambah & Edit Buku (Frontend)**
1. Pada `BookForm.jsx`, buat form input:
   - Judul, Penulis, Penerbit, ISBN, Tahun Terbit, Dropdown Kategori (diambil dari API), Jumlah Stok, Sinopsis, dan Upload/Input Cover.
2. Tangani dua mode form: Mode **Tambah** (`POST`) dan Mode **Edit** (`PUT`).
3. Tampilkan pesan validasi error di bawah input jika ada field yang salah.

### **Tahap 7: Halaman Kelola Buku, Filter, & Paginasi (Frontend)**
1. Di `KelolaBuku.jsx`, susun layout:
   - Header (Judul halaman, tombol "Tambah Buku", tombol "Kelola Kategori").
   - Filter bar (Input pencarian teks, dropdown filter kategori, dropdown status stok).
   - Tabel responsif (Thumbnail cover, Judul & Penulis, ISBN, Kategori, Stok Total, Stok Tersedia, Badge Status, Tombol Aksi: Detail / Edit / Hapus).
   - Komponen navigasi pagination di bawah tabel.
2. Pasang modal konfirmasi sebelum eksekusi hapus buku.

### **Tahap 8: Modal Detail Buku (Frontend)**
1. Buat komponen `BookDetailModal.jsx`.
2. Tampilkan cover buku ukuran penuh, sinopsis lengkap, metadata penerbit, riwayat/stok tersedia, dan informasi teknis buku.

### **Tahap 9: Halaman Dashboard Admin (Frontend)**
1. Buat `Dashboard.jsx` yang menampilkan kartu statistik:
   - Total Judul Buku
   - Total Eksemplar Stok Fisik
   - Buku Sedang Dipinjam
   - Buku Habis / Stok Kritis (< 3 eksemplar)
   - Total Kategori
2. Tambahkan tombol cepat (*shortcut*) menuju `KelolaBuku` dan `KelolaKategori`.
3. Daftarkan route `/admin/dashboard` di `frontend/src/App.jsx`.

---

## ✅ 7. Kriteria Penerimaan (Acceptance Criteria & QA Checklist)

Sebelum pekerjaan dinyatakan selesai (*Done*), wajib lolos checklist pengujian berikut:

- [ ] **AC-01 (Tampilan & Paginasi)**: Admin dapat melihat tabel daftar buku dengan paginasi berfungsi lancar (10 data per halaman).
- [ ] **AC-02 (Pencarian & Filter)**: Pencarian berdasarkan judul/penulis/ISBN dan filter kategori memfilter baris tabel tanpa reload halaman (*client-side reactive*).
- [ ] **AC-03 (Validasi Input Buku)**: Sistem menolak penyimpanan buku jika ISBN sudah terdaftar atau nilai stok bernilai negatif (< 0).
- [ ] **AC-04 (Kelola Kategori)**: Admin dapat menambah, mengedit, dan menghapus kategori. Kategori yang memiliki relasi buku tidak dapat dihapus dan menampilkan notifikasi kesalahan yang jelas.
- [ ] **AC-05 (Status Ketersediaan Real-Time)**:
  - Buku dengan stok fisik 5 dan sedang dipinjam 2 menampilkan `Stok Tersedia: 3` dengan badge hijau **Tersedia**.
  - Buku dengan stok fisik 3 dan sedang dipinjam 3 menampilkan `Stok Tersedia: 0` dengan badge merah **Habis**.
- [ ] **AC-06 (Detail Buku)**: Modal detail buku dapat dibuka dan menampilkan seluruh informasi (sinopsis lengkap, ISBN, penerbit, dll.).
- [ ] **AC-07 (Dashboard Metrik)**: Angka statistik pada dashboard admin terhitung akurat sesuai data database.
- [ ] **AC-08 (Keamanan Penghapusan)**: Menghapus buku memerlukan dialog konfirmasi dan dilarang jika buku masih dalam status pinjam aktif.
- [ ] **AC-09 (Build Clean)**: Menjalankan `npm run build` di frontend selesai dengan kode keluar 0 tanpa error TypeScript/ESLint/Vite.
