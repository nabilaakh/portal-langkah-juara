# Rencana dan Tabel Pengujian: Portal Belajar Langkah Juara

Dokumen ini disusun untuk memenuhi kebutuhan **Tahap 6: Uji dengan Empat Akun** berdasarkan aturan hak akses (Bab 2), perilaku modul (Bab 4), kebutuhan non-fungsional (Bab 6), dan pengujian batas/uji tembus (Bab 8) pada PRD Portal Belajar Langkah Juara.

---

## 1. Parameter dan Pemetaan Akun Uji

Sesuai dengan subbab 2.1, 4.1, dan 4.12 pada PRD:
* **Pengunjung:** Seseorang yang belum masuk (*unauthenticated*).
* **Akun Siswa:** Siswa bimbel (contoh: Raka / Salsa).
* **Akun Staf:** Staf administrasi (contoh: Kak Fira).
* **Akun Tutor:** Pengajar (contoh: Kak Dimas, Kak Nadia).
* **Akun Super Admin:** Pemilik bimbel (contoh: Pak Arif).

Kelompok Halaman yang diuji:
1. **Kelompok Halaman Siswa:** `/beranda`, `/program`, `/kelas`, `/tugas/[id]`
2. **Kelompok Halaman Staf:** `/staf`, `/staf/pendaftaran`, `/staf/kelas`, `/staf/siswa`
3. **Kelompok Halaman Tutor:** `/tutor`, `/tutor/kelas/[id]`, `/tutor/tugas/[id]`
4. **Kelompok Halaman Super Admin:** `/admin`, `/admin/pengguna`, `/admin/program`, `/admin/laporan`

---

## 2. Tabel Uji Hak Akses & Perilaku Sistem (Minimal 16 Baris + Pengunjung & Muat Ulang)

| No | Akun | Yang dilakukan | Hasil yang benar | Lolos? |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Belum masuk (Pengunjung) | Buka `/beranda` langsung di kolom alamat browser | Dialihkan ke `/masuk` (Bab 6.2) | ☑ |
| 2 | Belum masuk (Pengunjung) | Buka `/staf` langsung di kolom alamat browser | Dialihkan ke `/masuk` (Bab 6.2) | ☑ |
| 3 | Belum masuk (Pengunjung) | Buka `/tutor` langsung di kolom alamat browser | Dialihkan ke `/masuk` (Bab 6.2) | ☑ |
| 4 | Belum masuk (Pengunjung) | Buka `/admin` langsung di kolom alamat browser | Dialihkan ke `/masuk` (Bab 6.2) | ☑ |
| 5 | Siswa | Buka `/beranda` atau `/kelas` | Halaman terbuka, menampilkan kelas & tugas miliknya (Bab 4.2 & 4.4) | ☑ |
| 6 | Siswa | Ketik `/staf` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8) | ☑ |
| 7 | Siswa | Ketik `/tutor` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8) | ☑ |
| 8 | Siswa | Ketik `/admin` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8) | ☑ |
| 9 | Siswa | Ganti ID di `/kelas/[id]` dengan ID kelas yang tidak ia ikuti | Menampilkan "Kelas tidak ditemukan" (Bab 4.4 & Bab 8) | ☑ |
| 10 | Staf | Ketik `/beranda` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 11 | Staf | Buka `/staf` atau `/staf/pendaftaran` | Halaman terbuka, menampilkan pendaftaran menunggu & kelas hari ini (Bab 4.7 & 4.8) | ☑ |
| 12 | Staf | Ketik `/tutor` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 13 | Staf | Ketik `/admin` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 14 | Tutor | Ketik `/beranda` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 15 | Tutor | Ketik `/staf` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 16 | Tutor | Buka `/tutor` | Halaman terbuka, hanya memuat kelas yang ia ajar (Bab 4.11) | ☑ |
| 17 | Tutor | Ganti ID di `/tutor/kelas/[id]` dengan ID kelas yang diajar tutor lain | Muncul pesan Akses Ditolak (Bab 4.12 & Bab 8) | ☑ |
| 18 | Tutor | Ketik `/admin` langsung di kolom alamat browser | Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2) | ☑ |
| 19 | Super Admin | Buka kelompok halaman Siswa (`/beranda` atau `/kelas`) | Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2) | ☑ |
| 20 | Super Admin | Buka kelompok halaman Staf (`/staf` atau `/staf/pendaftaran`) | Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2) | ☑ |
| 21 | Super Admin | Buka kelompok halaman Tutor (`/tutor` atau `/tutor/kelas/[id]`) | Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2) | ☑ |
| 22 | Super Admin | Buka kelompok halaman Super Admin (`/admin` atau `/admin/pengguna`) | Halaman terbuka, dapat mengelola peran & pengguna (Bab 4.14 & 4.15) | ☑ |
| 23 | Siswa | Muat ulang (*refresh*) browser saat berada di `/beranda` | Tampil indikator memuat, tetap masuk, tidak dialihkan ke `/masuk` (Bab 4.1 & Bab 6.1) | ☑ |
| 24 | Staf | Muat ulang (*refresh*) browser saat berada di `/staf/pendaftaran?status=menunggu` | Tetap masuk di halaman yang sama dengan saringan menunggu tetap aktif (Bab 4.8 & Bab 6.1) | ☑ |
| 25 | Tutor | Muat ulang (*refresh*) browser saat berada di `/tutor` | Tampil indikator memuat, tetap masuk, daftar kelas tidak hilang (Bab 6.1) | ☑ |
| 26 | Super Admin | Muat ulang (*refresh*) browser saat berada di `/admin/laporan?bulan=oktober` | Tetap masuk dan filter bulan Oktober tetap terpilih (Bab 4.17 & Bab 6.1) | ☑ |
| 27 | Siapa pun yang sudah masuk | Ketik `/masuk` atau `/daftar` langsung di kolom alamat browser | Langsung dialihkan ke halamannya masing-masing (/beranda, /staf, /tutor, /admin) (Bab 4.1) | ☑ |

---

## 3. Catatan Pelaksanaan Pengujian

1. **Uji URL Langsung:** Seluruh pengujian rute dilakukan dengan mengetikkan langsung URL di bilah alamat (*address bar*) peramban, bukan sekadar mengklik menu navigasi.
2. **Uji Keamanan Firestore:** Selain pengujian UI di atas, pastikan verifikasi konsol peramban (*developer tools*) untuk memastikan siswa tidak dapat membaca nilai siswa lain atau memutakhirkan peran sendiri (Bab 8 PRD).