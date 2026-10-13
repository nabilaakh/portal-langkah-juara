import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 5: Siswa modules verification...');

const root = process.cwd();

// 1. Check all 5 files exist
const requiredFiles = [
  'src/app/beranda/page.jsx',
  'src/app/program/page.jsx',
  'src/app/kelas/page.jsx',
  'src/app/kelas/[id]/page.jsx',
  'src/app/tugas/[id]/page.jsx',
];

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing Siswa module file: ${file}`);
    process.exit(1);
  }
}

// 2. Check /beranda content
const beranda = fs.readFileSync(path.join(root, 'src/app/beranda/page.jsx'), 'utf8');
assert(beranda.includes('Kelas berikutnya') || beranda.includes('Kelas Berikutnya'), 'Beranda missing Kelas berikutnya');
assert(beranda.includes('Tugas belum dikumpulkan') || beranda.includes('Tugas Belum Dikumpulkan'), 'Beranda missing Tugas belum dikumpulkan');
assert(beranda.includes('Anda belum terdaftar di kelas mana pun'), 'Beranda missing empty class message');
assert(beranda.includes('Lihat Program'), 'Beranda missing Lihat Program button');

// 3. Check /program content
const program = fs.readFileSync(path.join(root, 'src/app/program/page.jsx'), 'utf8');
assert(program.includes('Ajukan Pendaftaran'), 'Program missing Ajukan Pendaftaran');
assert(program.includes('Pendaftaran Saya'), 'Program missing Pendaftaran Saya');

// 4. Check /kelas/[id] content
const kelasDetail = fs.readFileSync(path.join(root, 'src/app/kelas/[id]/page.jsx'), 'utf8');
assert(kelasDetail.includes('Kelas tidak ditemukan'), 'Kelas detail missing Kelas tidak ditemukan');

// 5. Check /tugas/[id] content
const tugasDetail = fs.readFileSync(path.join(root, 'src/app/tugas/[id]/page.jsx'), 'utf8');
assert(tugasDetail.includes('https://'), 'Tugas detail missing https:// URL check');
assert(tugasDetail.includes('Tugas tidak ditemukan'), 'Tugas detail missing Tugas tidak ditemukan');

console.log('PASS: Task 5 Siswa modules verification passed!');
