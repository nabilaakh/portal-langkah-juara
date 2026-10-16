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

const { db, firebaseConfig } = await import('../src/lib/firebase.js');
const { collection, getDocs } = await import('firebase/firestore');

console.log(`Inspecting Firestore collections in project: [${firebaseConfig.projectId}] ...\n`);

const cols = ['users', 'program', 'pendaftaran', 'kelas', 'pertemuan', 'tugas', 'pengumpulan'];

for (const c of cols) {
  const snap = await getDocs(collection(db, c));
  console.log(`=== Collection: ${c} (${snap.size} docs) ===`);
  snap.docs.forEach(d => {
    const data = d.data();
    const fieldTypes = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === null) fieldTypes[k] = 'null';
      else if (v && typeof v === 'object' && typeof v.toDate === 'function') fieldTypes[k] = `timestamp (${v.toDate().toISOString()})`;
      else if (Array.isArray(v)) fieldTypes[k] = `array [${v.length}]`;
      else fieldTypes[k] = `${typeof v} (${JSON.stringify(v)})`;
    }
    console.log(`  [${d.id}]:`, fieldTypes);
  });
  console.log('');
}
