import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 6: Staf modules verification...');

const root = process.cwd();

// 1. Check all 5 files exist
const requiredFiles = [
  'src/app/staf/page.jsx',
  'src/app/staf/pendaftaran/page.jsx',
  'src/app/staf/kelas/page.jsx',
  'src/app/staf/kelas/[id]/page.jsx',
  'src/app/staf/siswa/page.jsx',
];

for (const file of requiredFiles) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing Staf module file: ${file}`);
    process.exit(1);
  }
}

// 2. Check /staf dasbor content
const dasbor = fs.readFileSync(path.join(root, 'src/app/staf/page.jsx'), 'utf8');
assert(dasbor.includes('Pendaftaran menunggu') || dasbor.includes('Pendaftaran Menunggu'), 'Dasbor staf missing Pendaftaran menunggu');
assert(dasbor.includes('Kelas hari ini') || dasbor.includes('Kelas Hari Ini'), 'Dasbor staf missing Kelas hari ini');

// 3. Check /staf/pendaftaran content (query param ?status=, Setujui, Tolak, Catatan Staf)
const pendaftaran = fs.readFileSync(path.join(root, 'src/app/staf/pendaftaran/page.jsx'), 'utf8');
assert(pendaftaran.includes('Setujui'), 'Pendaftaran missing Setujui button');
assert(pendaftaran.includes('Tolak'), 'Pendaftaran missing Tolak button');
assert(pendaftaran.includes('catatanStaf') || pendaftaran.includes('Catatan Staf'), 'Pendaftaran missing Catatan Staf');

// 4. Check /staf/kelas content (Buat Kelas)
const kelolaKelas = fs.readFileSync(path.join(root, 'src/app/staf/kelas/page.jsx'), 'utf8');
assert(kelolaKelas.includes('Buat Kelas'), 'Kelola Kelas missing Buat Kelas button');

// 5. Check /staf/kelas/[id] content (Tambah Siswa)
const detailKelas = fs.readFileSync(path.join(root, 'src/app/staf/kelas/[id]/page.jsx'), 'utf8');
assert(detailKelas.includes('Tambah Siswa'), 'Detail Kelas staf missing Tambah Siswa button');

// 6. Check /staf/siswa content (Nomor HP Orang Tua & live search)
const dataSiswa = fs.readFileSync(path.join(root, 'src/app/staf/siswa/page.jsx'), 'utf8');
assert(dataSiswa.includes('noHpOrangTua') || dataSiswa.includes('Orang Tua'), 'Data Siswa missing Orang Tua contact');

console.log('PASS: Task 6 Staf modules verification passed!');
