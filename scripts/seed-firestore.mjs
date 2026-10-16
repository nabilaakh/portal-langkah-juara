import fs from 'fs';
import path from 'path';

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const { seedDatabase, DEFAULT_SEED_UIDS } = await import('../src/lib/seedData.js');
const { firebaseConfig } = await import('../src/lib/firebase.js');

// Parse CLI arguments: --uid=XYZ --role=siswa --adminUid=ABC dsb.
const args = process.argv.slice(2);
const customUids = {};
for (const arg of args) {
  const match = arg.match(/^--([^=]+)=(.*)$/);
  if (match) {
    customUids[match[1]] = match[2];
  }
}

console.log(`🌱 Menjalankan Seeder Firestore sesuai PRD Bab 7.1 ke proyek: [${firebaseConfig.projectId}] ...`);
if (Object.keys(customUids).length > 0) {
  console.log('📌 Custom UID yang diterima:', customUids);
}

try {
  const result = await seedDatabase(customUids);
  console.log(`✅ Berhasil melakukan seed! ${result.seededCount} dokumen dibuat/diperbarui sesuai PRD Bab 7.1.`);
  console.log('\n📋 Daftar UID yang digunakan:');
  for (const [k, v] of Object.entries(result.uids)) {
    console.log(`  - ${k}: ${v}`);
  }
  process.exit(0);
} catch (error) {
  console.error('❌ Gagal melakukan seeding:', error);
  process.exit(1);
}
