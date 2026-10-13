# Spesifikasi Desain: Portal Belajar Langkah Juara

**Tanggal**: 2026-10-13  
**Status**: Disetujui  
**Target Proyek**: Next.js (App Router, JavaScript, Tailwind CSS) terintegrasi dengan Firebase Cloud Firestore  
**Referensi**: PRD Portal Belajar Langkah Juara (Bab 4 & Bab 5)

---

## 1. Ringkasan Eksekutif & Tujuan

Aplikasi web **Portal Belajar Langkah Juara** adalah platform manajemen bimbingan belajar terpadu untuk siswa SMP dan SMA di Makassar. Aplikasi ini memusatkan seluruh kegiatan pembelajaran, pendaftaran program, jadwal kelas, materi belajar, presensi kehadiran, penugasan, dan penilaian ke dalam satu portal digital.

Sesuai instruksi pengembangan, implementasi fase ini:
1. Menggunakan **Next.js (App Router, JavaScript, Tailwind CSS)**.
2. Membangun **seluruh halaman di Bab 4** dengan rute dan nama halaman persis sesuai PRD.
3. Mengadopsi **identitas visual dan prinsip antarmuka Bab 5**.
4. Dibuat **tanpa login dan tanpa penjagaan halaman (route guard)** sehingga semua halaman dapat langsung diakses.
5. Menampilkan seluruh modul di sidebar dikelompokkan berdasarkan peran (Siswa, Staf, Tutor, Super Admin) untuk kemudahan navigasi dan pengujian langsung.
6. Terhubung langsung ke **Cloud Firestore Firebase** (7 koleksi: `users`, `program`, `pendaftaran`, `kelas`, `pertemuan`, `tugas`, `pengumpulan`) dilengkapi tombol inisialisasi data awal (*Auto-Seeder*) yang langsung mengisi skenario data realistis.

---

## 2. Arsitektur Proyek & Rute Halaman

### 2.1 Struktur Direktori
```text
portal-langkah-juara/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.jsx                 # Layout utama: Font Inter, Sidebar multi-peran, Topbar
│   │   ├── page.jsx                   # Pengarah utama ke /beranda
│   │   ├── not-found.jsx              # Halaman 404 ramah pengguna (Bab 6.3)
│   │   │
│   │   │── daftar/page.jsx            # 4.1 Halaman Daftar Siswa
│   │   │── masuk/page.jsx             # 4.1 Halaman Masuk
│   │   │── profil/page.jsx            # 4.6 Profil Pengguna
│   │   │
│   │   │── beranda/page.jsx           # 4.2 Beranda Siswa
│   │   │── program/page.jsx           # 4.3 Katalog Program & Pendaftaran Siswa
│   │   │── kelas/
│   │   │   ├── page.jsx               # 4.4 Daftar Kelas Saya (Siswa)
│   │   │   └── [id]/page.jsx          # 4.4 Rincian Kelas Siswa
│   │   │── tugas/
│   │   │   └── [id]/page.jsx          # 4.5 Rincian Tugas & Pengumpulan (Siswa)
│   │   │
│   │   │── staf/
│   │   │   ├── page.jsx               # 4.7 Dasbor Staf
│   │   │   ├── pendaftaran/page.jsx   # 4.8 Kelola Pendaftaran Staf
│   │   │   ├── kelas/
│   │   │   │   ├── page.jsx           # 4.9 Kelola Kelas Staf (Daftar & Buat Kelas)
│   │   │   │   └── [id]/page.jsx      # 4.9 Rincian Kelas Staf & Tambah Siswa
│   │   │   └── siswa/page.jsx         # 4.10 Data Siswa (Staf)
│   │   │
│   │   │── tutor/
│   │   │   ├── page.jsx               # 4.11 Dasbor Tutor
│   │   │   ├── kelas/
│   │   │   │   └── [id]/page.jsx      # 4.12 Kelas yang Diajar Tutor (Pertemuan & Presensi)
│   │   │   └── tugas/
│   │   │       └── [id]/page.jsx      # 4.13 Penilaian Tugas Tutor
│   │   │
│   │   └── admin/
│   │       ├── page.jsx               # 4.14 Dasbor Super Admin
│   │       ├── pengguna/
│   │       │   ├── page.jsx           # 4.15 Kelola Pengguna (Admin)
│   │       │   └── [id]/page.jsx      # 4.15 Ubah Peran Pengguna (Admin)
│   │       ├── program/page.jsx       # 4.16 Program Admin
│   │       └── laporan/page.jsx       # 4.17 Laporan Bulanan (Admin)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx            # Sidebar navigasi tetap multi-peran
│   │   │   └── Topbar.jsx             # Topbar dengan judul, breadcrumb, tombol seeder
│   │   ├── ui/
│   │   │   ├── BadgeStatus.jsx        # Badge pil status berwarna Bab 5.2
│   │   │   ├── StateHandler.jsx       # Wrapper 4 state: loading, success, empty, error
│   │   │   ├── Modal.jsx              # Modal dialog interaktif
│   │   │   └── Button.jsx             # Komponen tombol standar tema Langkah Juara
│   │
│   └── lib/
│       ├── firebase.js                # Konfigurasi & inisialisasi Firebase SDK
│       ├── firestoreService.js        # Helper query & mutasi Firestore
│       └── seedData.js                # Data awal & logika auto-seed Firestore
├── docs/
│   └── PRD_Tugas_Portal_Belajar_Langkah_Juara.docx.md
├── tailwind.config.js
├── next.config.mjs
└── package.json
```

---

## 3. Identitas Visual & Token Desain (Bab 5)

### 3.1 Skema Warna
| Token | Nilai Hex | Penggunaan |
| :--- | :--- | :--- |
| `primary` (Oranye Juara) | `#EA580C` | Tombol utama, menu aktif, aksen bilah atas |
| `bgApp` (Latar Aplikasi) | `#F7F5F2` | Latar belakang halaman |
| `surface` (Panel) | `#FFFFFF` | Panel kartu, tabel, dan modal |
| `textMain` | `#1F2937` | Teks utama halaman |
| `textMuted` | `#5A6B78` | Keterangan sekunder, subjudul, dan label form |
| `borderLight` | `#E5E7EB` | Garis pemisah dan border tabel/kartu |

### 3.2 Warna Status (Bab 5.2)
| Status | Nilai Hex | Kategori |
| :--- | :--- | :--- |
| `Menunggu`, `Dikumpulkan` | `#F59E0B` | Kuning Amber |
| `Aktif`, `Dinilai` | `#15A66A` | Hijau Emerald |
| `Ditolak`, `Terlambat` | `#E53935` | Merah |
| `Belum dikumpulkan` | `#6B7280` | Abu-abu Slate |

### 3.3 Tipografi & Formatting
- Font: Inter (`font-sans`), dengan fallback `system-ui`.
- Semua data angka, harga, tanggal, jam, dan nilai menggunakan kelas Tailwind `tabular-nums` agar sejajar rapi.
- Format mata uang rupiah: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })`.

---

## 4. Struktur Data Firestore & Relasi (Bab 7.1)

7 koleksi Firestore dengan spesifikasi field:

1. **`users`**:
   - `id`: string (uid)
   - `nama`: string
   - `email`: string
   - `noHp`: string (10–13 digit diawali 08)
   - `noHpOrangTua`: string (10–13 digit diawali 08)
   - `role`: string (`"siswa"` | `"staf"` | `"tutor"` | `"super_admin"`)
   - `aktif`: boolean (default `true`)
   - `dibuatPada`: timestamp

2. **`program`**:
   - `id`: string
   - `nama`: string
   - `jenjang`: string (`"SMP"` | `"SMA"`)
   - `jumlahPertemuan`: number
   - `harga`: number (dalam rupiah)
   - `aktif`: boolean

3. **`pendaftaran`**:
   - `id`: string
   - `siswaId`: string (referensi ke `users.id`)
   - `programId`: string (referensi ke `program.id`)
   - `status`: string (`"menunggu"` | `"aktif"` | `"ditolak"`)
   - `catatanStaf`: string (wajib saat ditolak)
   - `dibuatPada`: timestamp

4. **`kelas`**:
   - `id`: string
   - `nama`: string (contoh: "Intensif UTBK A")
   - `programId`: string
   - `tutorId`: string (referensi ke `users.id` peran tutor)
   - `siswaIds`: array of string (daftar uid siswa di kelas ini)
   - `hari`: string (contoh: "Selasa")
   - `jam`: string (contoh: "16.00")
   - `tempat`: string (contoh: "Ruang 2" atau tautan daring)

5. **`pertemuan`**:
   - `id`: string
   - `kelasId`: string (referensi ke `kelas.id`)
   - `tanggal`: string (format YYYY-MM-DD, contoh: "2026-10-07")
   - `topik`: string
   - `materiUrl`: string (wajib diawali `https://` jika diisi)
   - `hadirIds`: array of string (daftar uid siswa yang hadir)

6. **`tugas`**:
   - `id`: string
   - `kelasId`: string (referensi ke `kelas.id`)
   - `judul`: string
   - `deskripsi`: string
   - `batasWaktu`: timestamp

7. **`pengumpulan`**:
   - `id`: string
   - `tugasId`: string (referensi ke `tugas.id`)
   - `siswaId`: string (referensi ke `users.id`)
   - `kelasId`: string (referensi ke `kelas.id`)
   - `tautan`: string (wajib diawali `https://`)
   - `dikumpulkanPada`: timestamp
   - `nilai`: number (0–100, kosong sampai dinilai)
   - `komentar`: string

### Komputasi Status Tugas Siswa
Status tugas dihitung secara dinamis:
- **Belum dikumpulkan**: Tidak ada dokumen pengumpulan dari siswa tersebut dan `sekarang <= batasWaktu`.
- **Dikumpulkan**: Dokumen pengumpulan ada dan field `nilai` masih `null` atau `undefined`.
- **Dinilai**: Dokumen pengumpulan ada dan field `nilai` telah diisi angka (0–100).
- **Terlambat**: Dokumen pengumpulan tidak ada dan `sekarang > batasWaktu`.

---

## 5. Rincian Fungsionalitas Setiap Halaman (Bab 4)

### 5.1 Publik
- **`/daftar`**: Form nama lengkap, email, kata sandi (minimal 6 karakter), tombol daftar dan tombol Masuk dengan Google. Menyimpan dokumen profil baru ke `users` dengan `role: "siswa"` dan mengarahkan ke `/beranda`.
- **`/masuk`**: Form email & kata sandi, tombol Masuk dengan Google, mengarahkan ke modul yang sesuai.
- **`/profil`**: Menampilkan nama, email, no HP, no HP orang tua, peran. Form untuk mengedit nama, no HP, dan no HP orang tua (validasi format nomor HP).

### 5.2 Siswa
- **`/beranda`**:
  - Kartu "Kelas Berikutnya": nama kelas, hari, jam, tempat.
  - Kartu "Tugas Belum Dikumpulkan": daftar tugas belum dikumpulkan berurutan dari batas waktu terdekat.
  - Banner state kosong: *"Anda belum terdaftar di kelas mana pun"* dengan tombol *"Lihat Program"*.
- **`/program`**:
  - Katalog kartu program aktif (nama, jenjang, jumlah pertemuan, harga).
  - Tombol *"Ajukan Pendaftaran"*: membuat pendaftaran berstatus `menunggu`. Validasi: tidak bisa mendaftar ulang jika sudah berstatus `menunggu` atau `aktif`.
  - Tabel *Pendaftaran Saya* di bawah katalog dengan pil status (Menunggu, Aktif, Ditolak + catatan staf).
- **`/kelas`**: Daftar kartu kelas yang diikuti siswa.
- **`/kelas/[id]`**: Detail kelas siswa: informasi jadwal & tempat, daftar pertemuan (topik, tanggal, tautan materi yang dapat diklik), dan daftar tugas kelas.
- **`/tugas/[id]`**: Detail tugas: judul, deskripsi, batas waktu, status tugas. Form pengumpulan tautan Google Drive (`https://...`). Tampilan nilai dan komentar jika tugas telah dinilai.

### 5.3 Staf
- **`/staf`**: Dasbor ringkasan: kartu pendaftaran menunggu (angka dapat diklik membuka `/staf/pendaftaran?status=menunggu`) dan kartu kelas hari ini.
- **`/staf/pendaftaran`**: Tabel pendaftaran dengan tab/filter status (`semua`, `menunggu`, `aktif`, `ditolak`) tersimpan di URL query `?status=...`. Aksi tombol *"Setujui"* (mengubah status menjadi `aktif`) dan tombol *"Tolak"* (modal catatan staf wajib -> mengubah status menjadi `ditolak`).
- **`/staf/kelas`**: Tabel kelola kelas + tombol *"Buat Kelas"* (modal form: nama kelas, pilih program, pilih tutor dari koleksi `users` peran tutor, hari, jam, tempat).
- **`/staf/kelas/[id]`**: Rincian kelas staf + tombol *"Tambah Siswa"* (modal menampilkan daftar siswa yang memiliki pendaftaran aktif di program kelas tersebut untuk dicentang dan ditambahkan ke `siswaIds`).
- **`/staf/siswa`**: Tabel data siswa (nama, email, nomor HP orang tua, program aktif) dilengkapi kolom pencarian live berdasarkan nama siswa.

### 5.4 Tutor
- **`/tutor`**: Dasbor tutor: kartu kelas hari ini yang diampu tutor dan daftar seluruh kelas yang diajar.
- **`/tutor/kelas/[id]`**: Halaman kelas yang diajar:
  - Tombol *"Buat Pertemuan"* (modal: tanggal, topik, materiUrl).
  - Tabel Pertemuan & Presensi: daftar siswa kelas dengan checkbox hadir dan tombol *"Simpan Presensi"* (memperbarui `hadirIds` di dokumen `pertemuan`).
  - Tombol *"Buat Tugas"* (modal: judul, deskripsi, batas waktu).
- **`/tutor/tugas/[id]`**: Tabel pengumpulan tugas siswa: nama siswa, waktu kumpul, tautan jawaban, nilai, komentar. Aksi input nilai (0–100) dan komentar tutor.

### 5.5 Super Admin
- **`/admin`**: Dasbor ringkasan pemilik: kartu siswa aktif, pendaftaran bulan ini, rata-rata kehadiran. Mengklik kartu mengarahkan ke `/admin/laporan`.
- **`/admin/pengguna`**: Tabel kelola pengguna dengan pencarian dan filter peran (`siswa`, `staf`, `tutor`, `super_admin`).
- **`/admin/pengguna/[id]`**: Detail pengguna: ubah peran dan toggle aktif/nonaktif akun.
- **`/admin/program`**: Tabel daftar program + tombol *"Tambah Program"* (nama, jenjang SMP/SMA, jumlah pertemuan, harga, aktif).
- **`/admin/laporan`**: Rekap bulanan dengan query param `?bulan=YYYY-MM`. Tiga tabel rekap:
  1. Siswa aktif per program
  2. Kehadiran per kelas (persentase hadir)
  3. Jumlah kelas dan pertemuan per tutor

---

## 6. Prinsip Penanganan 4 Keadaan (State Handler)
Setiap tampilan pengambilan data mengimplementasikan 4 keadaan visual:
1. **Memuat (Loading)**: Animasi skeleton shimmer menyerupai tata letak tabel atau kartu aslinya.
2. **Berhasil (Success)**: Menampilkan data lengkap, interaktif, dan rapi.
3. **Kosong (Empty)**: Ikon visual ramah, teks deskriptif penjelas (contoh: *"Belum ada pendaftaran menunggu"*), dan tombol tindakan.
4. **Gagal (Error)**: Pesan kendala yang mudah dipahami tanpa kode teknis, disertai tombol *"Coba Lagi"*.

---

## 7. Rencana Pengujian
1. **Pengujian Tampilan & Rute**: Memastikan 21 rute halaman di Bab 4 dapat diakses dan di-refresh langsung dari URL tanpa crash.
2. **Pengujian Seeder**: Menjalankan inisialisasi data Firestore dan memverifikasi data di 7 koleksi.
3. **Pengujian Alur Fungsional**:
   - Pendaftaran program oleh siswa -> persetujuan oleh staf -> penambahan siswa ke kelas.
   - Pembuatan pertemuan & presensi kehadiran oleh tutor -> kemunculan materi di kelas siswa.
   - Pembuatan tugas oleh tutor -> pengumpulan tautan oleh siswa -> penilaian oleh tutor.
   - Filter query URL pada pendaftaran staf dan laporan admin tetap bertahan saat refresh.
