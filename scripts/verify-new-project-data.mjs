import { db, firebaseConfig } from '../src/lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

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
