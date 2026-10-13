import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 7: Tutor modules verification...');

const root = process.cwd();

// 1. Check all 3 files exist
const requiredFiles = [
  'src/app/tutor/page.jsx',
  'src/app/tutor/kelas/[id]/page.jsx',
  'src/app/tutor/tugas/[id]/page.jsx',
];

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing Tutor module file: ${file}`);
    process.exit(1);
  }
}

// 2. Check /tutor dasbor content
const dasbor = fs.readFileSync(path.join(root, 'src/app/tutor/page.jsx'), 'utf8');
assert(dasbor.includes('Kelas hari ini') || dasbor.includes('Kelas Hari Ini'), 'Dasbor tutor missing Kelas hari ini');
assert(dasbor.includes('Semua kelas saya') || dasbor.includes('Semua Kelas Saya'), 'Dasbor tutor missing Semua kelas saya');

// 3. Check /tutor/kelas/[id] content (Buat Pertemuan, Simpan Presensi, Buat Tugas)
const kelasDetail = fs.readFileSync(path.join(root, 'src/app/tutor/kelas/[id]/page.jsx'), 'utf8');
assert(kelasDetail.includes('Buat Pertemuan'), 'Kelas detail missing Buat Pertemuan');
assert(kelasDetail.includes('Simpan Presensi'), 'Kelas detail missing Simpan Presensi');
assert(kelasDetail.includes('Buat Tugas'), 'Kelas detail missing Buat Tugas');

// 4. Check /tutor/tugas/[id] content (Penilaian 0 - 100, Komentar)
const tugasDetail = fs.readFileSync(path.join(root, 'src/app/tutor/tugas/[id]/page.jsx'), 'utf8');
assert(tugasDetail.includes('Nilai'), 'Tugas detail missing Nilai');
assert(tugasDetail.includes('Komentar'), 'Tugas detail missing Komentar');

console.log('PASS: Task 7 Tutor modules verification passed!');
