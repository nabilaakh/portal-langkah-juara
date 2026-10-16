import assert from 'assert';
import fs from 'fs';

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

console.log('Testing Task 2: Firestore services and seed data logic...');

try {
  const { calculateTaskStatus, COLLECTIONS } = await import('../src/lib/firestoreService.js');
  const { initialSeedData } = await import('../src/lib/seedData.js');

  // 1. Verify collections constants match Chapter 7.1
  const expectedCollections = ['users', 'program', 'pendaftaran', 'kelas', 'pertemuan', 'tugas', 'pengumpulan'];
  for (const col of expectedCollections) {
    assert(Object.values(COLLECTIONS).includes(col), `Missing collection ${col}`);
  }

  // 2. Test calculateTaskStatus logic
  const futureDate = new Date(Date.now() + 86400000).toISOString();
  const pastDate = new Date(Date.now() - 86400000).toISOString();

  const mockTugasFuture = { id: 't1', batasWaktu: futureDate };
  const mockTugasPast = { id: 't2', batasWaktu: pastDate };

  // Case a: Belum dikumpulkan
  const statusA = calculateTaskStatus(mockTugasFuture, null);
  assert.strictEqual(statusA, 'Belum dikumpulkan', 'Expected Belum dikumpulkan');

  // Case b: Terlambat
  const statusB = calculateTaskStatus(mockTugasPast, null);
  assert.strictEqual(statusB, 'Terlambat', 'Expected Terlambat');

  // Case c: Dikumpulkan (belum dinilai)
  const statusC = calculateTaskStatus(mockTugasFuture, { tautan: 'https://link.com', nilai: null });
  assert.strictEqual(statusC, 'Dikumpulkan', 'Expected Dikumpulkan');

  // Case d: Dinilai
  const statusD = calculateTaskStatus(mockTugasPast, { tautan: 'https://link.com', nilai: 85 });
  assert.strictEqual(statusD, 'Dinilai', 'Expected Dinilai');

  // 3. Verify seed data contains users from PRD
  assert(initialSeedData.users.some(u => u.id === 'siswa-raka' && u.role === 'siswa'));
  assert(initialSeedData.users.some(u => u.id === 'staf-fira' && u.role === 'staf'));
  assert(initialSeedData.users.some(u => u.id === 'tutor-dimas' && u.role === 'tutor'));
  assert(initialSeedData.users.some(u => u.id === 'admin-arif' && u.role === 'super_admin'));

  // 4. Verify seed programs
  assert(initialSeedData.program.some(p => p.nama.includes('UTBK')));

  console.log('PASS: Task 2 test passed successfully!');
} catch (err) {
  console.error('FAIL: ' + err.message);
  process.exit(1);
}
