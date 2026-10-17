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

const { auth, db } = await import('../src/lib/firebase.js');
const { signInWithEmailAndPassword } = await import('firebase/auth');
const { updateUser, getUserById } = await import('../src/lib/firestoreService.js');

console.log('🛡️ Menguji Perlindungan Akun Super Admin Sendiri (PRD 4.15 & 6.2)...\n');

// 1. Login sebagai Super Admin Pak Arif
const userCred = await signInWithEmailAndPassword(auth, 'arif@langkahjuara.id', 'Juara2026!');
const adminUid = userCred.user.uid;
console.log(`✅ Login sebagai Super Admin: ${userCred.user.email} (UID: ${adminUid})`);

// 2. Uji coba menurunkan peran sendiri -> HARUS GAGAL / DITOLAK
let downgradePrevented = false;
try {
  await updateUser(adminUid, { role: 'siswa' });
} catch (err) {
  downgradePrevented = true;
  console.log(`✅ Percobaan menurunkan peran sendiri BERHASIL DITOLAK: "${err.message}"`);
}

if (!downgradePrevented) {
  console.error('❌ GAGAL: Penurunan peran sendiri tidak ditolak!');
  process.exit(1);
}

// 3. Uji coba menonaktifkan akun sendiri -> HARUS GAGAL / DITOLAK
let deactivatePrevented = false;
try {
  await updateUser(adminUid, { aktif: false });
} catch (err) {
  deactivatePrevented = true;
  console.log(`✅ Percobaan menonaktifkan akun sendiri BERHASIL DITOLAK: "${err.message}"`);
}

if (!deactivatePrevented) {
  console.error('❌ GAGAL: Menonaktifkan akun sendiri tidak ditolak!');
  process.exit(1);
}

// 4. Pastikan data akun di Firestore tetap Super Admin dan Aktif
const currentAdminData = await getUserById(adminUid);
if (currentAdminData.role === 'super_admin' && currentAdminData.aktif !== false) {
  console.log('✅ Verifikasi Firestore: Akun Pak Arif tetap super_admin dan aktif!');
} else {
  console.error('❌ Data akun berubah secara tidak sah!', currentAdminData);
  process.exit(1);
}

console.log('\n🎉 SELURUH PENGUJIAN PENJAGAAN DUA LAPIS BERHASIL LOLOS!');
process.exit(0);
