# Implementasi Portal Belajar Langkah Juara

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web lengkap Portal Belajar Langkah Juara menggunakan Next.js (App Router, JavaScript, Tailwind CSS) dengan 21 rute persis sesuai Bab 4 PRD, identitas visual Bab 5, tanpa login dan tanpa route guard, serta terhubung ke Firebase Cloud Firestore dengan auto-seeder data demo.

**Architecture:** Menggunakan Next.js App Router dengan layout global responsif (Sidebar multi-peran & Topbar terpadu). Komunikasi data menggunakan Firebase Client SDK (`firebase/firestore`) untuk mengelola 7 koleksi data (`users`, `program`, `pendaftaran`, `kelas`, `pertemuan`, `tugas`, `pengumpulan`). Seluruh aksi formulir (buat kelas, tambah siswa, buat pertemuan, presensi hadir, kumpul tugas, beri nilai, kelola status pendaftaran/pengguna) berinteraksi langsung secara real-time ke Firestore.

**Tech Stack:** Next.js (App Router, JavaScript/JSX), Tailwind CSS, Lucide React (ikon), Firebase Web SDK (`firebase/firestore`), Inter font.

**Spec:** [docs/superpowers/specs/2026-10-13-portal-langkah-juara-design.md](file:///c:/Users/LENOVO/Bootcamp-FutureMakers/portal-langkah-juara/portal-langkah-juara/docs/superpowers/specs/2026-10-13-portal-langkah-juara-design.md)

## Global Constraints
- Next.js App Router dengan JavaScript (bukan TypeScript sesuai instruksi).
- Seluruh 21 rute dan nama halaman harus sama persis dengan Bab 4 PRD.
- Palet warna wajib: Oranye Juara `#EA580C`, Latar `#F7F5F2`, Panel `#FFFFFF`, Teks `#1F2937`, Teks redup `#5A6B78`.
- Warna status wajib: Menunggu/Dikumpulkan `#F59E0B`, Aktif/Dinilai `#15A66A`, Ditolak/Terlambat `#E53935`, Belum dikumpulkan `#6B7280`.
- Format angka, jam, tanggal, nilai, dan harga wajib memakai `tabular-nums`.
- Tanpa login dan tanpa penjagaan halaman (semua halaman terbuka).
- Setiap pemanggilan data harus memiliki 4 state antarmuka: memuat (loading), berhasil (success), kosong (empty), dan gagal (error dengan tombol Coba lagi).

## Review Focus
- Halaman rincian dinamis (`/kelas/[id]`, `/tugas/[id]`, `/staf/kelas/[id]`, `/tutor/kelas/[id]`, `/tutor/tugas/[id]`, `/admin/pengguna/[id]`) ketika ID tidak ditemukan menampilkan state error ramah dengan tombol kembali ke daftar.
- URL query parameters (`/staf/pendaftaran?status=...` dan `/admin/laporan?bulan=...`) tetap tersinkronisasi saat filter diubah atau saat halaman di-refresh.
- Validasi input wajib: Tautan tugas/materi wajib diawali `https://`, nomor HP wajib 10-13 digit diawali `08`, catatan staf wajib saat menolak pendaftaran.
- Status tugas siswa terkomputasi otomatis secara konsisten di semua halaman (Belum dikumpulkan, Dikumpulkan, Dinilai, Terlambat).
- Penambahan siswa ke kelas di modul Staf hanya menampilkan siswa yang pendaftarannya berstatus aktif pada program terkait.

---

### Task 1: Next.js Project Scaffolding & Tailwind CSS Design System Setup

**Files:**
- Create: `package.json`, `tailwind.config.js`, `postcss.config.js`, `next.config.mjs`, `src/app/globals.css`, `src/app/layout.jsx`, `src/app/page.jsx`, `src/app/not-found.jsx`
- Test: `scripts/verify-setup.mjs`

**Interfaces:**
- Produces: Base Next.js runtime, custom Tailwind color tokens (`theme.extend.colors.juara`, `bgApp`, `textMain`, `textMuted`, status colors), root layout dengan font Inter.

- [ ] **Step 1: Write test script for Tailwind tokens and project build**
Buat `scripts/verify-setup.mjs` yang memeriksa file konfigurasi, token warna Bab 5 di `tailwind.config.js`, dan struktur direktori `src/app`.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-setup.mjs`  
Expected: FAIL (file konfigurasi belum ada).

- [ ] **Step 3: Inisialisasi dependensi dan file konfigurasi Next.js & Tailwind CSS**
Pasang dependensi Next.js, React, Tailwind CSS, Lucide React, Firebase. Buat `tailwind.config.js` dengan palet warna Bab 5, `src/app/globals.css`, `src/app/layout.jsx`, `src/app/page.jsx` (yang meredirect ke `/beranda`), dan `src/app/not-found.jsx`.

- [ ] **Step 4: Run verification script & next build**
Run: `node scripts/verify-setup.mjs && npm run build`  
Expected: PASS (build sukses dan token warna terverifikasi).

- [ ] **Step 5: Commit**
```bash
git add package.json package-lock.json tailwind.config.js postcss.config.js next.config.mjs src/ scripts/
git commit -m "feat: setup Next.js project with Tailwind CSS design tokens"
```

---

### Task 2: Firebase Client SDK & Auto-Seeder Firestore

**Files:**
- Create: `src/lib/firebase.js`, `src/lib/firestoreService.js`, `src/lib/seedData.js`, `scripts/seed-firestore.mjs`
- Test: `scripts/test-firestore-connection.mjs`

**Interfaces:**
- Consumes: Firebase environment variables (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, dll.).
- Produces: `db` (Firestore instance), `seedDatabase()` function, CRUD helpers untuk 7 koleksi (`users`, `program`, `pendaftaran`, `kelas`, `pertemuan`, `tugas`, `pengumpulan`).

- [ ] **Step 1: Write unit test / verification script untuk Firestore CRUD helpers**
Buat `scripts/test-firestore-connection.mjs` yang memverifikasi pembacaan dan penulisan dokumen ke 7 koleksi serta kalkulasi status tugas.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/test-firestore-connection.mjs`  
Expected: FAIL (modul lib belum ada).

- [ ] **Step 3: Implement `src/lib/firebase.js`, `src/lib/firestoreService.js`, dan `src/lib/seedData.js`**
Implementasikan konfigurasi Firebase, helper fungsi Firestore (get, add, update, calculateTaskStatus), dan fungsi `seedDatabase()` yang menginjeksi data realistis (Raka, Salsa, Kak Fira, Kak Dimas, Kak Nadia, Pak Arif, program, pendaftaran, kelas, pertemuan, tugas, pengumpulan).

- [ ] **Step 4: Run verification script and seed script**
Run: `node scripts/test-firestore-connection.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/lib/ scripts/
git commit -m "feat: implement Firebase client SDK, Firestore helpers, and auto-seeder"
```

---

### Task 3: Shared Layout (Sidebar Multi-Peran, Topbar, & UI Atoms)

**Files:**
- Create: `src/components/layout/Sidebar.jsx`, `src/components/layout/Topbar.jsx`, `src/components/ui/BadgeStatus.jsx`, `src/components/ui/StateHandler.jsx`, `src/components/ui/Modal.jsx`, `src/components/ui/Button.jsx`
- Modify: `src/app/layout.jsx`
- Test: `scripts/verify-ui-components.mjs`

**Interfaces:**
- Consumes: Tailwind tokens, Lucide icons, `seedDatabase()`.
- Produces: Responsive Sidebar dengan grup menu (Publik, Siswa, Staf, Tutor, Super Admin), Topbar dengan tombol "Inisialisasi Data Demo", `BadgeStatus` dengan warna Bab 5.2, `StateHandler` (4 state).

- [ ] **Step 1: Write test script untuk kelengkapan link rute di Sidebar dan warna BadgeStatus**
Buat `scripts/verify-ui-components.mjs` yang memeriksa bahwa Sidebar memuat link ke semua 21 rute Bab 4 dan BadgeStatus memetakan seluruh status PRD ke warna yang tepat.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-ui-components.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement komponen Sidebar, Topbar, BadgeStatus, StateHandler, Modal, Button**
Bangun komponen layout dengan transisi mulus, ikon Lucide, dialog modal yang dapat ditutup dengan escape/backdrop, dan integrasi tombol seeder di Topbar. Pasang ke `src/app/layout.jsx`.

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-ui-components.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/components/ src/app/layout.jsx scripts/
git commit -m "feat: implement shared multi-role Sidebar, Topbar, and UI atoms"
```

---

### Task 4: Modul Publik & Profil (`/daftar`, `/masuk`, `/profil`)

**Files:**
- Create: `src/app/daftar/page.jsx`, `src/app/masuk/page.jsx`, `src/app/profil/page.jsx`
- Test: `scripts/verify-public-pages.mjs`

**Interfaces:**
- Consumes: `firestoreService.js`, `StateHandler.jsx`, `Button.jsx`.
- Produces: Halaman pendaftaran baru ke koleksi `users`, halaman masuk informatif, dan halaman profil dengan form update nomor HP validasi `08` (10-13 digit).

- [ ] **Step 1: Write verification script untuk validasi profil & halaman publik**
Buat `scripts/verify-public-pages.mjs` yang memverifikasi render form, validasi regex nomor HP `^08[0-9]{8,11}$`, dan field form.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-public-pages.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement `/daftar`, `/masuk`, dan `/profil`**
Bangun halaman `/daftar` (nama, email, password, tombol Google, simpan ke users role siswa -> arahkan ke `/beranda`), `/masuk` (email, password, tombol Google), dan `/profil` (detail akun, edit nama, no HP, no HP orang tua).

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-public-pages.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/daftar/ src/app/masuk/ src/app/profil/ scripts/
git commit -m "feat: implement public pages (daftar, masuk) and profile page"
```

---

### Task 5: Modul Siswa (`/beranda`, `/program`, `/kelas`, `/kelas/[id]`, `/tugas/[id]`)

**Files:**
- Create: `src/app/beranda/page.jsx`, `src/app/program/page.jsx`, `src/app/kelas/page.jsx`, `src/app/kelas/[id]/page.jsx`, `src/app/tugas/[id]/page.jsx`
- Test: `scripts/verify-siswa-modules.mjs`

**Interfaces:**
- Consumes: Firestore collections (`program`, `pendaftaran`, `kelas`, `pertemuan`, `tugas`, `pengumpulan`).
- Produces: Halaman beranda dengan jadwal & tugas mendesak, katalog program dengan tombol ajukan pendaftaran & tabel status pendaftaran, daftar kelas, rincian kelas dengan daftar pertemuan (tautan materi) & tugas, rincian tugas dengan form kumpul tautan `https://` & tampilan nilai/komentar.

- [ ] **Step 1: Write test script untuk modul siswa**
Buat `scripts/verify-siswa-modules.mjs` yang memeriksa kehadiran semua rute siswa, komputasi status tugas, validasi tautan URL, dan fallback saat kelas/tugas tidak ditemukan.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-siswa-modules.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement modul siswa (`/beranda`, `/program`, `/kelas`, `/kelas/[id]`, `/tugas/[id]`)**
Bangun halaman-halaman siswa lengkap dengan format harga `tabular-nums`, empty state jika belum terdaftar di kelas mana pun, form pengumpulan tugas, dan card status pendaftaran.

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-siswa-modules.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/beranda/ src/app/program/ src/app/kelas/ src/app/tugas/ scripts/
git commit -m "feat: implement Siswa modules (beranda, program, kelas, rincian kelas, tugas)"
```

---

### Task 6: Modul Staf (`/staf`, `/staf/pendaftaran`, `/staf/kelas`, `/staf/kelas/[id]`, `/staf/siswa`)

**Files:**
- Create: `src/app/staf/page.jsx`, `src/app/staf/pendaftaran/page.jsx`, `src/app/staf/kelas/page.jsx`, `src/app/staf/kelas/[id]/page.jsx`, `src/app/staf/siswa/page.jsx`
- Test: `scripts/verify-staf-modules.mjs`

**Interfaces:**
- Consumes: Firestore collections (`pendaftaran`, `kelas`, `users`, `program`).
- Produces: Dasbor staf, tabel pendaftaran dengan sinkronisasi URL query `?status=...`, aksi setujui/tolak (catatan wajib), kelola kelas (modal Buat Kelas), rincian kelas staf dengan modal Tambah Siswa (hanya siswa aktif di program itu), dan tabel data siswa dengan pencarian live nama.

- [ ] **Step 1: Write test script untuk modul staf**
Buat `scripts/verify-staf-modules.mjs` yang menguji filter pendaftaran URL, validasi penolakan pendaftaran (catatan staf tidak boleh kosong), dan pembatasan tambah siswa hanya untuk pendaftaran aktif.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-staf-modules.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement modul staf (`/staf`, `/staf/pendaftaran`, `/staf/kelas`, `/staf/kelas/[id]`, `/staf/siswa`)**
Bangun dasbor ringkasan, tabel interaktif dengan filter query, modal Buat Kelas, modal Tambah Siswa, dan tabel data siswa.

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-staf-modules.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/staf/ scripts/
git commit -m "feat: implement Staf modules (dasbor, pendaftaran, kelola kelas, data siswa)"
```

---

### Task 7: Modul Tutor (`/tutor`, `/tutor/kelas/[id]`, `/tutor/tugas/[id]`)

**Files:**
- Create: `src/app/tutor/page.jsx`, `src/app/tutor/kelas/[id]/page.jsx`, `src/app/tutor/tugas/[id]/page.jsx`
- Test: `scripts/verify-tutor-modules.mjs`

**Interfaces:**
- Consumes: Firestore collections (`kelas`, `pertemuan`, `tugas`, `pengumpulan`, `users`).
- Produces: Dasbor tutor, rincian kelas tutor (modal Buat Pertemuan, checkbox presensi hadir dan Simpan Presensi, modal Buat Tugas), dan rincian tugas tutor (tabel pengumpulan jawaban siswa, form input nilai 0-100 dan komentar).

- [ ] **Step 1: Write test script untuk modul tutor**
Buat `scripts/verify-tutor-modules.mjs` yang menguji validasi nilai (angka bulat 0-100), update presensi hadir (`hadirIds`), dan pembuatan pertemuan dengan materiUrl.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-tutor-modules.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement modul tutor (`/tutor`, `/tutor/kelas/[id]`, `/tutor/tugas/[id]`)**
Bangun halaman dasbor tutor, halaman kelas dengan daftar siswa & tab pertemuan/presensi/tugas, serta halaman penilaian tugas dengan input nilai & komentar.

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-tutor-modules.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/tutor/ scripts/
git commit -m "feat: implement Tutor modules (dasbor tutor, kelas yang diajar, presensi, penilaian tugas)"
```

---

### Task 8: Modul Super Admin (`/admin`, `/admin/pengguna`, `/admin/pengguna/[id]`, `/admin/program`, `/admin/laporan`)

**Files:**
- Create: `src/app/admin/page.jsx`, `src/app/admin/pengguna/page.jsx`, `src/app/admin/pengguna/[id]/page.jsx`, `src/app/admin/program/page.jsx`, `src/app/admin/laporan/page.jsx`
- Test: `scripts/verify-admin-modules.mjs`

**Interfaces:**
- Consumes: Seluruh koleksi Firestore.
- Produces: Dasbor metrik pemilik, tabel kelola pengguna (filter peran, pencarian nama), detail pengguna (ubah peran, toggle aktif), kelola program (modal Tambah Program, toggle aktif), laporan bulanan dengan query `?bulan=...` (3 tabel: siswa aktif per program, kehadiran per kelas %, jumlah kelas & pertemuan per tutor).

- [ ] **Step 1: Write test script untuk modul admin**
Buat `scripts/verify-admin-modules.mjs` yang memeriksa komputasi metrik dasbor, komputasi 3 tabel laporan bulanan, dan sinkronisasi filter query bulan.

- [ ] **Step 2: Run verification script to verify it fails**
Run: `node scripts/verify-admin-modules.mjs`  
Expected: FAIL.

- [ ] **Step 3: Implement modul super admin (`/admin`, `/admin/pengguna`, `/admin/pengguna/[id]`, `/admin/program`, `/admin/laporan`)**
Bangun seluruh modul admin sesuai spesifikasi Bab 4.14 - 4.17 lengkap dengan perhitungan agregat data riil dari Firestore.

- [ ] **Step 4: Run verification script**
Run: `node scripts/verify-admin-modules.mjs`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/app/admin/ scripts/
git commit -m "feat: implement Super Admin modules (dasbor admin, pengguna, program, laporan bulanan)"
```

---

### Task 9: Verifikasi Penuh (End-to-End Build & Audit 21 Rute Bab 4)

**Files:**
- Create: `scripts/audit-all-routes.mjs`
- Test: Next.js Production Build (`npm run build`) & Route Audit

**Interfaces:**
- Consumes: Seluruh modul yang telah dibangun.
- Produces: Laporan verifikasi bebas error untuk semua 21 rute Bab 4 dan fungsionalitas CRUD.

- [ ] **Step 1: Write comprehensive route audit script**
Buat `scripts/audit-all-routes.mjs` yang memeriksa keberadaan file rute, konsistensi nama rute dengan PRD, ketiadaan syntax error, dan rendering komponen.

- [ ] **Step 2: Run `npm run build`**
Run: `npm run build`  
Expected: Sukses membuat production bundle Next.js tanpa kompilasi error.

- [ ] **Step 3: Run route audit script**
Run: `node scripts/audit-all-routes.mjs`  
Expected: PASS (seluruh 21 rute Bab 4 terverifikasi 100%).

- [ ] **Step 4: Jalankan dev server dan lakukan smoke test peramban**
Jalankan dev server, uji tampilan dengan browser subagent, dan pastikan tidak ada pesan error di konsol.

- [ ] **Step 5: Final Commit**
```bash
git add .
git commit -m "chore: complete full implementation and verification of Portal Belajar Langkah Juara"
```
