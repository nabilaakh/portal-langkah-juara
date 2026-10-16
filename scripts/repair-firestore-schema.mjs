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
const {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteField,
  Timestamp,
} = await import('firebase/firestore');

console.log(`🔧 Memeriksa dan Memperbaiki Struktur Data Firestore sesuai PRD Bab 7.1 di [${firebaseConfig.projectId}] ...\n`);

let repairsCount = 0;

// 1. Periksa & Perbaiki Koleksi USERS
console.log('--- 1. Memeriksa Koleksi [users] ---');
const usersSnap = await getDocs(collection(db, 'users'));
for (const d of usersSnap.docs) {
  const data = d.data();
  const updates = {};
  let needsUpdate = false;

  // Cek apakah ada field AI createdAt yang menyalahi PRD 7.1
  if (data.createdAt) {
    console.log(`  [users/${d.id}]: Mengganti field 'createdAt' (${data.createdAt}) menjadi 'dibuatPada' (Timestamp)`);
    updates.dibuatPada = Timestamp.fromDate(new Date(data.createdAt));
    updates.createdAt = deleteField();
    needsUpdate = true;
  } else if (!data.dibuatPada) {
    console.log(`  [users/${d.id}]: Menambahkan field 'dibuatPada' (Timestamp)`);
    updates.dibuatPada = Timestamp.now();
    needsUpdate = true;
  }

  // Pastikan noHp dan noHpOrangTua bertipe string
  if (data.noHp === undefined) {
    updates.noHp = '';
    needsUpdate = true;
  }
  if (data.noHpOrangTua === undefined) {
    updates.noHpOrangTua = '';
    needsUpdate = true;
  }

  if (needsUpdate) {
    await updateDoc(doc(db, 'users', d.id), updates);
    repairsCount++;
    console.log(`    ✅ Selesai diperbarui [users/${d.id}]`);
  }
}

// 2. Periksa & Perbaiki Koleksi PENDAFTARAN
console.log('\n--- 2. Memeriksa Koleksi [pendaftaran] ---');
const pendSnap = await getDocs(collection(db, 'pendaftaran'));
for (const d of pendSnap.docs) {
  const data = d.data();
  const updates = {};
  let needsUpdate = false;

  if (typeof data.dibuatPada === 'string') {
    console.log(`  [pendaftaran/${d.id}]: Mengubah dibuatPada dari string ke Timestamp`);
    updates.dibuatPada = Timestamp.fromDate(new Date(data.dibuatPada));
    needsUpdate = true;
  }

  if (needsUpdate) {
    await updateDoc(doc(db, 'pendaftaran', d.id), updates);
    repairsCount++;
    console.log(`    ✅ Selesai diperbarui [pendaftaran/${d.id}]`);
  }
}

// 3. Periksa & Perbaiki Koleksi TUGAS
console.log('\n--- 3. Memeriksa Koleksi [tugas] ---');
const tugasSnap = await getDocs(collection(db, 'tugas'));
for (const d of tugasSnap.docs) {
  const data = d.data();
  const updates = {};
  let needsUpdate = false;

  if (typeof data.batasWaktu === 'string') {
    console.log(`  [tugas/${d.id}]: Mengubah batasWaktu dari string ke Timestamp`);
    updates.batasWaktu = Timestamp.fromDate(new Date(data.batasWaktu));
    needsUpdate = true;
  }

  if (needsUpdate) {
    await updateDoc(doc(db, 'tugas', d.id), updates);
    repairsCount++;
    console.log(`    ✅ Selesai diperbarui [tugas/${d.id}]`);
  }
}

// 4. Periksa & Perbaiki Koleksi PENGUMPULAN
console.log('\n--- 4. Memeriksa Koleksi [pengumpulan] ---');
const kumpulSnap = await getDocs(collection(db, 'pengumpulan'));
for (const d of kumpulSnap.docs) {
  const data = d.data();
  const updates = {};
  let needsUpdate = false;

  if (typeof data.dikumpulkanPada === 'string') {
    console.log(`  [pengumpulan/${d.id}]: Mengubah dikumpulkanPada dari string ke Timestamp`);
    updates.dikumpulkanPada = Timestamp.fromDate(new Date(data.dikumpulkanPada));
    needsUpdate = true;
  }

  if (needsUpdate) {
    await updateDoc(doc(db, 'pengumpulan', d.id), updates);
    repairsCount++;
    console.log(`    ✅ Selesai diperbarui [pengumpulan/${d.id}]`);
  }
}

console.log(`\n🎉 Proses pemeriksaan & perbaikan selesai! Total dokumen diperbaiki: ${repairsCount}.`);
process.exit(0);
