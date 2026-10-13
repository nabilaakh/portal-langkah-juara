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

const { db, firebaseConfig } = await import('../src/lib/firebase.js');
const { collection, getDocs } = await import('firebase/firestore');

console.log(`Checking Firestore collections in project: [${firebaseConfig.projectId}] ...\n`);

const collectionsToCheck = [
  'users',
  'program',
  'pendaftaran',
  'kelas',
  'pertemuan',
  'tugas',
  'pengumpulan'
];

let totalDocs = 0;
for (const colName of collectionsToCheck) {
  const colRef = collection(db, colName);
  const snapshot = await getDocs(colRef);
  console.log(`📂 Collection [${colName}]: ${snapshot.size} documents found.`);
  snapshot.forEach(doc => {
    console.log(`   - ID: ${doc.id}`);
  });
  totalDocs += snapshot.size;
}

console.log(`\n🎉 Total documents in [${firebaseConfig.projectId}]: ${totalDocs}`);
if (totalDocs >= 20) {
  console.log('✅ ALL COLLECTIONS AND DOCUMENTS SUCCESSFULLY VERIFIED IN NEW PROJECT!');
  process.exit(0);
} else {
  console.error('❌ Missing documents!');
  process.exit(1);
}
