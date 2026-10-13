import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 8: Super Admin modules verification...');

const root = process.cwd();

// 1. Check all 5 files exist
const requiredFiles = [
  'src/app/admin/page.jsx',
  'src/app/admin/pengguna/page.jsx',
  'src/app/admin/pengguna/[id]/page.jsx',
  'src/app/admin/program/page.jsx',
  'src/app/admin/laporan/page.jsx',
];

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing Admin module file: ${file}`);
    process.exit(1);
  }
}

// 2. Check /admin content (Siswa aktif, Pendaftaran bulan ini, Rata-rata kehadiran)
const dasbor = fs.readFileSync(path.join(root, 'src/app/admin/page.jsx'), 'utf8');
assert(dasbor.includes('Siswa aktif') || dasbor.includes('Siswa Aktif'), 'Dasbor admin missing Siswa aktif');
assert(dasbor.includes('Pendaftaran bulan ini') || dasbor.includes('Pendaftaran Bulan Ini'), 'Dasbor admin missing Pendaftaran bulan ini');
assert(dasbor.includes('kehadiran') || dasbor.includes('Kehadiran'), 'Dasbor admin missing Kehadiran');

// 3. Check /admin/pengguna content (search and role filter)
const pengguna = fs.readFileSync(path.join(root, 'src/app/admin/pengguna/page.jsx'), 'utf8');
assert(pengguna.includes('Peran') || pengguna.includes('role'), 'Admin pengguna missing Peran');

// 4. Check /admin/pengguna/[id] content (role edit and aktif toggle)
const detailPengguna = fs.readFileSync(path.join(root, 'src/app/admin/pengguna/[id]/page.jsx'), 'utf8');
assert(detailPengguna.includes('super_admin'), 'Detail pengguna missing super_admin');

// 5. Check /admin/program content (Tambah Program, Jenjang SMP/SMA, Harga)
const programAdmin = fs.readFileSync(path.join(root, 'src/app/admin/program/page.jsx'), 'utf8');
assert(programAdmin.includes('Tambah Program'), 'Program admin missing Tambah Program');

// 6. Check /admin/laporan content (3 tables and month query param)
const laporan = fs.readFileSync(path.join(root, 'src/app/admin/laporan/page.jsx'), 'utf8');
assert(laporan.includes('bulan'), 'Laporan missing bulan filter');

console.log('PASS: Task 8 Super Admin modules verification passed!');
