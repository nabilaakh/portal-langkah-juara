# **Rancangan Sistem: Portal Belajar Langkah Juara**

Dokumen rancangan ini menguraikan daftar fitur fungsional, matriks kontrol akses (RBAC), peta route halaman, serta penetapan keputusan aturan bisnis yang bersumber langsung dari PRD Portal Belajar Langkah Juara (Bab 2, 3, dan 4).

# **1\. Daftar Fitur (Bab 4 PRD)**

Setiap fitur diberi kode penomoran subbab PRD:

* Daftar akun baru siswa (4.1)  
* Masuk akun dengan Email & Kata Sandi atau Google (4.1)  
* Melihat ringkasan kelas berikutnya & tugas belum dikumpulkan (4.2)  
* Melihat daftar program aktif (4.3)  
* Mengajukan pendaftaran program (4.3)  
* Melihat daftar program dan status pendaftaran sendiri (4.3)  
* Melihat daftar kelas yang diikuti (4.4)  
* Melihat rincian kelas, jadwal, pertemuan, tautan materi, dan tugas (4.4)  
* Mengumpulkan tautan jawaban tugas (4.5)  
* Melihat nilai dan komentar tugas sendiri (4.5)  
* Melihat profil diri (4.6)  
* Mengubah nama dan kontak profil (4.6)  
* Melihat ringkasan dasbor staf (pendaftaran menunggu & kelas hari ini) (4.7)  
* Melihat dan menyaring daftar pendaftaran program (4.8)  
* Menyetujui atau menolak pendaftaran program (4.8)  
* Melihat daftar kelas operasional (4.9)  
* Membuat kelas baru dan mengatur jadwal/tutor (4.9)  
* Menambahkan siswa ke kelas (4.9)  
* Melihat data siswa dan kontak orang tua (hanya baca) (4.10)  
* Melihat ringkasan dasbor tutor (kelas hari ini & kelas yang diajar) (4.11)  
* Melihat rincian kelas yang diajar (4.12)  
* Membuat pertemuan kelas (4.12)  
* Mengisi dan memperbarui presensi kehadiran siswa (4.12)  
* Membuat tugas kelas (4.13)  
* Melihat pengumpulkan tugas siswa (4.13)  
* Memberi dan mengubah nilai serta komentar tugas (4.13)  
* Melihat ringkasan dasbor admin (metrik bimbel) (4.14)  
* Melihat daftar pengguna (4.15)  
* Mengubah peran pengguna dan menonaktifkan akun (4.15)  
* Melihat dan mengelola daftar program / paket belajar (4.16)  
* Melihat laporan dan rekapitulasi bulanan (4.17)

# **2\. Matriks Akses**

Keterangan simbol:

* ✓ \= Memiliki akses penuh  
* ✕ \= Akses ditolak / tidak tampil  
* ✓ milik sendiri \= Hanya dapat mengakses data yang berelasi langsung dengan dirinya (misal: kelas/tugas miliknya untuk Siswa, atau kelas yang diampu untuk Tutor)

| Fitur (subbab PRD) | Pengunjung | Siswa | Staf | Tutor | Super Admin |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Daftar akun baru siswa (4.1) | ✓ | ✕ | ✕ | ✕ | ✕ |
| Masuk akun (4.1) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Melihat kelas berikutnya & tugas belum kumpul (4.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat daftar program aktif (4.3) | ✕ | ✓ | ✕ | ✕ | ✓ |
| Mengajukan pendaftaran program (4.3) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat status pendaftaran (4.3) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat daftar kelas diikuti (4.4) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat rincian kelas, materi, dan tugas (4.4) | ✕ | ✓ milik sendiri | ✓ | ✓ milik sendiri | ✓ |
| Mengumpulkan tugas (4.5) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| Melihat nilai dan komentar tugas (4.5) | ✕ | ✓ milik sendiri | ✕ | ✓ milik sendiri | ✓ |
| Melihat profil diri (4.6) | ✕ | ✓ | ✓ | ✓ | ✓ |
| Mengubah profil diri (4.6) | ✕ | ✓ (nama & HP ortu) | ✓ (nama) | ✓ (nama) | ✓ (nama) |
| Melihat Dasbor Staf (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Melihat daftar pendaftaran (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Menyetujui / menolak pendaftaran (4.8) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Melihat daftar kelas operasional (4.9) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Membuat kelas baru (4.9) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Memasukkan siswa ke kelas (4.9) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Melihat data siswa & kontak ortu (4.10) | ✕ | ✕ | ✓ | ✕ | ✓ |
| Melihat Dasbor Tutor (4.11) | ✕ | ✕ | ✕ | ✓ | ✓ |
| Melihat rincian kelas yang diajar (4.12) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Membuat pertemuan kelas (4.12) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Mengisi presensi siswa (4.12) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Membuat tugas kelas (4.13) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Melihat pengumpulan tugas (4.13) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Memberi nilai & komentar tugas (4.13) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| Melihat Dasbor Admin (4.14) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Melihat kelola pengguna (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Mengubah peran & aktifkan akun (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Mengelola program bimbel (4.16) | ✕ | ✕ | ✕ | ✕ | ✓ |
| Melihat rekap & laporan (4.17) | ✕ | ✕ | ✕ | ✕ | ✓ |

# **3\. Peta Route Halaman**

| Halaman | Alamat | Peran yang boleh membuka | Belum masuk | Peran lain |
| :---- | :---- | :---- | :---- | :---- |
| Daftar Akun | /daftar | Pengunjung | Menampilkan form daftar | Diarahkan ke halamannya sesuai role |
| Masuk Akun | /masuk | Pengunjung, Siswa, Staf, Tutor, Super Admin | Menampilkan form masuk | Diarahkan ke halamannya sesuai role |
| Beranda Siswa | /beranda | siswa, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Katalog Program | /program | siswa, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Daftar Kelas Saya | /kelas | siswa, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Rincian Kelas Siswa | /kelas/\[id\] | siswa (anggota kelas), super\_admin | Diarahkan ke /masuk | Kelas tidak ditemukan / Akses Ditolak |
| Rincian & Kumpul Tugas | /tugas/\[id\] | siswa (anggota kelas), super\_admin | Diarahkan ke /masuk | Tugas tidak ditemukan / Akses Ditolak |
| Profil Pengguna | /profil | siswa, staf, tutor, super\_admin | Diarahkan ke /masuk | \- |
| Dasbor Staf | /staf | staf, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelola Pendaftaran | /staf/pendaftaran | staf, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelola Daftar Kelas | /staf/kelas | staf, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelola Rincian & Siswa Kelas | /staf/kelas/\[id\] | staf, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Data Siswa | /staf/siswa | staf, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Dasbor Tutor | /tutor | tutor, super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelas yang Diajar & Presensi | /tutor/kelas/\[id\] | tutor (pengampu kelas), super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Tugas dan Penilaian Tutor | /tutor/tugas/\[id\] | tutor (pengampu kelas), super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Dasbor Admin | /admin | super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelola Pengguna | /admin/pengguna | super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Rincian Pengguna | /admin/pengguna/\[id\] | super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Kelola Program Bimbel | /admin/program | super\_admin | Diarahkan ke /masuk | Akses Ditolak |
| Laporan Bulanan | /admin/laporan | super\_admin | Diarahkan ke /masuk | Akses Ditolak |

# **4\. Jawaban Keputusan Wajib (Bimbel Langkah Juara)**

## **1\. Bolehkah staf mengubah nilai tugas?**

* **Jawaban:** Tidak boleh.  
* **Dasar PRD:**  
  * Subbab 2.4 (Yang tidak boleh dilihat tiap peran) secara eksplisit menyatakan bahwa pada baris "Memberi atau mengubah nilai", peran Staf bertuliskan "Tidak bisa".  
  * Subbab 4.9 (Kelola Kelas) menyatakan: "Staf tidak bisa membuat pertemuan, mengisi presensi, atau memberi nilai."  
  * Subbab 4.10 (Data Siswa) menyatakan: "Halaman ini hanya untuk membaca. Staf tidak bisa melihat atau mengubah nilai."

## **2\. Bolehkah Kak Dimas membuka kelas Kak Nadia?**

* **Jawaban:** Tidak boleh.  
* **Dasar PRD:**  
  * Subbab 2.4 (Yang tidak boleh dilihat tiap peran) menyatakan bahwa untuk data "Kelas yang diajar tutor lain", akses bagi Tutor berstatus "Tidak tampil".  
  * Subbab 4.11 (Dasbor Tutor) menyatakan: "Hanya kelas dengan tutorId sama dengan uid tutor yang masuk yang tampil."  
  * Subbab 4.12 (Kelas yang Diajar) menyatakan: "Bila Kak Nadia mengganti ID di alamat dengan kelas Kak Dimas, tampil Akses Ditolak." Hal ini berlaku timbal balik antar sesama tutor.

## **3\. Bolehkah Raka melihat nilai Salsa?**

* **Jawaban:** Tidak boleh.  
* **Dasar PRD:**  
  * Subbab 1 (Ringkasan Eksekutif) menetapkan: "Siswa hanya bisa membuka nilai miliknya sendiri, termasuk bila alamat halaman diubah."  
  * Subbab 2.4 (Yang tidak boleh dilihat tiap peran) menetapkan bahwa untuk data "Nilai dan jawaban siswa lain", akses Siswa bertuliskan "Tidak tampil".  
  * Subbab 4.5 (Tugas) menyatakan bahwa siswa di luar kelas atau membuka tugas siswa lain akan dibatasi dengan notifikasi "Tugas tidak ditemukan", serta ditegaskan pada Subbab 8 (Pengujian) bahwa percobaan membaca nilai siswa lain lewat peramban harus ditolak oleh Security Rules.

## **4\. Halaman mana saja yang boleh dibuka Pak Arif?**

* **Jawaban:** Semua halaman di dalam aplikasi.  
* **Dasar PRD:**  
  * Subbab 2.1 (Empat pemegang akun) menyatakan peran Super Admin (Pak Arif) bertugas: "Membuka semua halaman peran lain, ditambah mengelola pengguna, program, dan laporan".  
  * Subbab 3.1 (Peta modul) menyebutkan: "Super Admin (semua menu Siswa, Staf, dan Tutor, ditambah) Dasbor Admin, Kelola Pengguna, Program, Laporan".  
  * Subbab 4.14 (Dasbor Admin) menegaskan: "Super Admin juga melihat semua menu Staf, Tutor, dan Siswa."  
  * Subbab 6.2 (Penjagaan halaman dan data) menegaskan aturan Route Guard: "super\_admin boleh membuka semua halaman".  
  * Daftar rute yang dapat diakses Pak Arif mencakup: /admin, /admin/pengguna, /admin/pengguna/\[id\], /admin/program, /admin/laporan, /staf, /staf/pendaftaran, /staf/kelas, /staf/kelas/\[id\], /staf/siswa, /tutor, /tutor/kelas/\[id\], /tutor/tugas/\[id\], /beranda, /program, /kelas, /kelas/\[id\], /tugas/\[id\], dan /profil.

## **Verifikasi Cek Hasil**

- [x] Setiap subbab di Bab 4 (4.1 s.d. 4.17) memiliki perwakilan fitur di matriks akses.  
- [x] Setiap halaman di Bab 4 memiliki satu baris di peta route.  
- [x] Keempat pertanyaan keputusan studi kasus bimbel telah dijawab tuntas lengkap dengan kutipan subbab PRD.

