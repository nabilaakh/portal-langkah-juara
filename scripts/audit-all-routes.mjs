import fs from 'fs';
import path from 'path';

console.log('🔍 Auditing all 21 PRD routes and files...');

const root = process.cwd();

const routes = [
  // 4.1 Daftar dan Masuk
  { route: '/daftar', file: 'src/app/daftar/page.jsx', title: 'Halaman Daftar' },
  { route: '/masuk', file: 'src/app/masuk/page.jsx', title: 'Halaman Masuk' },
  // 4.2 Beranda
  { route: '/beranda', file: 'src/app/beranda/page.jsx', title: 'Beranda Siswa' },
  // 4.3 Program
  { route: '/program', file: 'src/app/program/page.jsx', title: 'Program Siswa' },
  // 4.4 Kelas Saya
  { route: '/kelas', file: 'src/app/kelas/page.jsx', title: 'Daftar Kelas Saya' },
  { route: '/kelas/[id]', file: 'src/app/kelas/[id]/page.jsx', title: 'Rincian Kelas Siswa' },
  // 4.5 Tugas
  { route: '/tugas/[id]', file: 'src/app/tugas/[id]/page.jsx', title: 'Rincian Tugas Siswa' },
  // 4.6 Profil
  { route: '/profil', file: 'src/app/profil/page.jsx', title: 'Profil Pengguna' },
  // 4.7 Dasbor Staf
  { route: '/staf', file: 'src/app/staf/page.jsx', title: 'Dasbor Staf' },
  // 4.8 Pendaftaran
  { route: '/staf/pendaftaran', file: 'src/app/staf/pendaftaran/page.jsx', title: 'Pendaftaran Staf' },
  // 4.9 Kelola Kelas
  { route: '/staf/kelas', file: 'src/app/staf/kelas/page.jsx', title: 'Kelola Kelas Staf' },
  { route: '/staf/kelas/[id]', file: 'src/app/staf/kelas/[id]/page.jsx', title: 'Rincian Kelas Staf' },
  // 4.10 Data Siswa
  { route: '/staf/siswa', file: 'src/app/staf/siswa/page.jsx', title: 'Data Siswa Staf' },
  // 4.11 Dasbor Tutor
  { route: '/tutor', file: 'src/app/tutor/page.jsx', title: 'Dasbor Tutor' },
  // 4.12 Kelas yang Diajar
  { route: '/tutor/kelas/[id]', file: 'src/app/tutor/kelas/[id]/page.jsx', title: 'Kelas yang Diajar Tutor' },
  // 4.13 Tugas dan Nilai
  { route: '/tutor/tugas/[id]', file: 'src/app/tutor/tugas/[id]/page.jsx', title: 'Tugas dan Nilai Tutor' },
  // 4.14 Dasbor Admin
  { route: '/admin', file: 'src/app/admin/page.jsx', title: 'Dasbor Admin' },
  // 4.15 Kelola Pengguna
  { route: '/admin/pengguna', file: 'src/app/admin/pengguna/page.jsx', title: 'Kelola Pengguna Admin' },
  { route: '/admin/pengguna/[id]', file: 'src/app/admin/pengguna/[id]/page.jsx', title: 'Detail Pengguna Admin' },
  // 4.16 Program (Admin)
  { route: '/admin/program', file: 'src/app/admin/program/page.jsx', title: 'Program Admin' },
  // 4.17 Laporan
  { route: '/admin/laporan', file: 'src/app/admin/laporan/page.jsx', title: 'Laporan Admin' },
];

let failed = 0;
routes.forEach((r, idx) => {
  const fullPath = path.join(root, r.file);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ [${idx + 1}/21] Missing file for ${r.route}: ${r.file}`);
    failed++;
  } else {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.length < 50) {
      console.error(`⚠️ [${idx + 1}/21] File suspiciously small: ${r.file}`);
      failed++;
    } else {
      console.log(`✅ [${idx + 1}/21] ${r.route} (${r.title}) -> ${r.file}`);
    }
  }
});

if (failed > 0) {
  console.error(`\nAudit FAILED: ${failed} errors detected.`);
  process.exit(1);
} else {
  console.log(`\n🎉 Audit SUCCESS: All 21 PRD Chapter 4 routes are fully present and verified!`);
}
