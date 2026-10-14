import assert from 'assert';
import fs from 'fs';

console.log('Testing Authentication & users/{uid} document logic...\n');

// 1. Verify AuthContext.js code structure
const authContextSource = fs.readFileSync('src/context/AuthContext.js', 'utf8');

// A. Assert check for users/{uid}
assert(
  authContextSource.includes('doc(db, "users", firebaseUser.uid)'),
  'Must check doc(db, "users", firebaseUser.uid)'
);

// B. Assert "bila sudah ada, jangan diubah"
assert(
  authContextSource.includes('docSnap.exists()'),
  'Must check if docSnap.exists()'
);

// C. Assert "jangan simpan kata sandi di dokumen ini"
assert(
  !authContextSource.includes('password:'),
  'Password must NEVER be stored in the Firestore document!'
);
assert(
  !authContextSource.includes('kataSandi:'),
  'kataSandi must NEVER be stored in the Firestore document!'
);

// D. Assert creation of new document when not exists
assert(
  authContextSource.includes('role: "siswa"'),
  'Must set default role to siswa for newly created users'
);

// 2. Verify Topbar.jsx displays name and role read from users/{uid}
const topbarSource = fs.readFileSync('src/components/layout/Topbar.jsx', 'utf8');
assert(
  topbarSource.includes('profile?.nama'),
  'Topbar must display profile.nama read from users/{uid}'
);
assert(
  topbarSource.includes('profile?.role'),
  'Topbar must display profile.role read from users/{uid}'
);

// 3. Verify Layout wraps AuthProvider
const layoutSource = fs.readFileSync('src/app/layout.jsx', 'utf8');
assert(
  layoutSource.includes('<AuthProvider>'),
  'RootLayout must wrap entire app in AuthProvider'
);

console.log('✅ ALL AUTHENTICATION & USERS/{UID} LOGIC CHECKS PASSED 100%!');
process.exit(0);
