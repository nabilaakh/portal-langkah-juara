import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('Testing Task 3: Shared Layout & UI atoms verification...');

const root = process.cwd();

// 1. Check all required component files exist
const requiredComponents = [
  'src/components/layout/Sidebar.jsx',
  'src/components/layout/Topbar.jsx',
  'src/components/ui/BadgeStatus.jsx',
  'src/components/ui/StateHandler.jsx',
  'src/components/ui/Modal.jsx',
  'src/components/ui/Button.jsx',
];

for (const comp of requiredComponents) {
  const filePath = path.join(root, comp);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing component: ${comp}`);
    process.exit(1);
  }
}

// 2. Check Sidebar contents contain all 4 role sections and public links
const sidebarContent = fs.readFileSync(path.join(root, 'src/components/layout/Sidebar.jsx'), 'utf8');
const expectedPaths = [
  '/beranda',
  '/program',
  '/kelas',
  '/staf',
  '/staf/pendaftaran',
  '/staf/kelas',
  '/staf/siswa',
  '/tutor',
  '/admin',
  '/admin/pengguna',
  '/admin/program',
  '/admin/laporan',
  '/daftar',
  '/masuk',
  '/profil'
];

for (const p of expectedPaths) {
  assert(sidebarContent.includes(p), `Sidebar does not contain path: ${p}`);
}

// 3. Check BadgeStatus handles PRD Chapter 5.2 statuses
const badgeContent = fs.readFileSync(path.join(root, 'src/components/ui/BadgeStatus.jsx'), 'utf8');
const expectedStatuses = ['Menunggu', 'Aktif', 'Ditolak', 'Belum dikumpulkan', 'Dikumpulkan', 'Dinilai', 'Terlambat'];
for (const s of expectedStatuses) {
  assert(badgeContent.includes(s), `BadgeStatus missing status handler for: ${s}`);
}

// 4. Check StateHandler implements 4 states: loading, error, empty, success
const stateHandlerContent = fs.readFileSync(path.join(root, 'src/components/ui/StateHandler.jsx'), 'utf8');
assert(stateHandlerContent.includes('loading'), 'StateHandler missing loading state');
assert(stateHandlerContent.includes('error'), 'StateHandler missing error state');
assert(stateHandlerContent.includes('empty'), 'StateHandler missing empty state');

console.log('PASS: Task 3 UI components verification passed!');
