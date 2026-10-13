import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 4: Public pages & profile verification...');

const root = process.cwd();

// 1. Verify files exist
const requiredPages = [
  'src/app/daftar/page.jsx',
  'src/app/masuk/page.jsx',
  'src/app/profil/page.jsx',
];

for (const p of requiredPages) {
  const filePath = path.join(root, p);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing page: ${p}`);
    process.exit(1);
  }
}

// 2. Check /daftar page requirements
const daftarContent = fs.readFileSync(path.join(root, 'src/app/daftar/page.jsx'), 'utf8');
assert(daftarContent.includes('Masuk dengan Google'), 'Daftar page missing Google button');
assert(daftarContent.includes('Kata sandi'), 'Daftar page missing Kata sandi field');
assert(daftarContent.includes('/beranda'), 'Daftar page must redirect to /beranda');

// 3. Check /masuk page requirements
const masukContent = fs.readFileSync(path.join(root, 'src/app/masuk/page.jsx'), 'utf8');
assert(masukContent.includes('Masuk dengan Google'), 'Masuk page missing Google button');

// 4. Check /profil page requirements (phone regex 08 and 10-13 digits)
const profilContent = fs.readFileSync(path.join(root, 'src/app/profil/page.jsx'), 'utf8');
assert(profilContent.includes('noHpOrangTua'), 'Profil missing noHpOrangTua field');
assert(profilContent.includes('08'), 'Profil missing 08 validation hint or regex');

console.log('PASS: Task 4 public & profile pages test passed!');
