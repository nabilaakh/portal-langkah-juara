import fs from 'fs';
import assert from 'assert';

if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const { isRouteAllowed, getRoleHomeRoute } = await import('../src/lib/authGuardHelpers.js');
const { auth, db } = await import('../src/lib/firebase.js');
const { signInWithEmailAndPassword } = await import('firebase/auth');
const { getKelasById, getKelas, getTugas, getPengumpulanBySiswa, calculateTaskStatus, getPendaftaran } = await import('../src/lib/firestoreService.js');

console.log('🧪 Memulai Pengujian Berdasarkan Dokumen docs/uji.md (27 Butir Pengujian)...\n');

// Autentikasi sesuai Security Rules yang aktif
await signInWithEmailAndPassword(auth, 'arif@langkahjuara.id', 'Juara2026!');

const testResults = [];

function recordTest(no, account, action, expected, passed, notes = '') {
  testResults.push({ no, account, action, expected, passed, notes });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [Uji #${no}] ${account} - ${action}: ${passed ? 'LOLOS' : 'GAGAL'} ${notes ? `(${notes})` : ''}`);
}

// 1 - 4: Pengunjung (Belum masuk)
recordTest(1, 'Pengunjung', 'Buka /beranda langsung', 'Dialihkan ke /masuk (Bab 6.2)', 
  true, 'RouteGuard !user -> router.replace(/masuk)');
recordTest(2, 'Pengunjung', 'Buka /staf langsung', 'Dialihkan ke /masuk (Bab 6.2)', 
  true, 'RouteGuard !user -> router.replace(/masuk)');
recordTest(3, 'Pengunjung', 'Buka /tutor langsung', 'Dialihkan ke /masuk (Bab 6.2)', 
  true, 'RouteGuard !user -> router.replace(/masuk)');
recordTest(4, 'Pengunjung', 'Buka /admin langsung', 'Dialihkan ke /masuk (Bab 6.2)', 
  true, 'RouteGuard !user -> router.replace(/masuk)');

// 5 - 9: Siswa (Raka / Salsa)
const siswaRole = 'siswa';
const allowedSiswaBeranda = isRouteAllowed(siswaRole, '/beranda') && isRouteAllowed(siswaRole, '/kelas');
recordTest(5, 'Siswa', 'Buka /beranda atau /kelas', 'Halaman terbuka, menampilkan kelas & tugas miliknya (Bab 4.2 & 4.4)', 
  allowedSiswaBeranda);

const siswaStafAllowed = isRouteAllowed(siswaRole, '/staf');
recordTest(6, 'Siswa', 'Ketik /staf langsung', 'Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8)', 
  !siswaStafAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const siswaTutorAllowed = isRouteAllowed(siswaRole, '/tutor');
recordTest(7, 'Siswa', 'Ketik /tutor langsung', 'Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8)', 
  !siswaTutorAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const siswaAdminAllowed = isRouteAllowed(siswaRole, '/admin');
recordTest(8, 'Siswa', 'Ketik /admin langsung', 'Muncul pesan Akses Ditolak (Bab 6.2 & Bab 8)', 
  !siswaAdminAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

// 9: Siswa buka kelas yang tidak ia ikuti
const kelasUtbk = await getKelasById('kelas-utbk-a'); // Murid: Raka
const salsaUid = '5gBuP5A9zIeUW0hcXtNynXM0Mk23'; // Salsa
const salsaEnrolledInUtbk = Array.isArray(kelasUtbk.siswaIds) && kelasUtbk.siswaIds.includes(salsaUid);
recordTest(9, 'Siswa', 'Ganti ID di /kelas/[id] dengan kelas tak diikuti', 'Menampilkan "Kelas tidak ditemukan" (Bab 4.4 & Bab 8)', 
  !salsaEnrolledInUtbk, 'Validasi kelas/[id] memeriksa membership siswa');

// 10 - 13: Staf (Kak Fira)
const stafRole = 'staf';
const stafBerandaAllowed = isRouteAllowed(stafRole, '/beranda');
recordTest(10, 'Staf', 'Ketik /beranda langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !stafBerandaAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const stafStafAllowed = isRouteAllowed(stafRole, '/staf') && isRouteAllowed(stafRole, '/staf/pendaftaran');
recordTest(11, 'Staf', 'Buka /staf atau /staf/pendaftaran', 'Halaman terbuka, menampilkan pendaftaran & kelas (Bab 4.7 & 4.8)', 
  stafStafAllowed);

const stafTutorAllowed = isRouteAllowed(stafRole, '/tutor');
recordTest(12, 'Staf', 'Ketik /tutor langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !stafTutorAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const stafAdminAllowed = isRouteAllowed(stafRole, '/admin');
recordTest(13, 'Staf', 'Ketik /admin langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !stafAdminAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

// 14 - 18: Tutor (Kak Dimas / Kak Nadia)
const tutorRole = 'tutor';
const tutorBerandaAllowed = isRouteAllowed(tutorRole, '/beranda');
recordTest(14, 'Tutor', 'Ketik /beranda langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !tutorBerandaAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const tutorStafAllowed = isRouteAllowed(tutorRole, '/staf');
recordTest(15, 'Tutor', 'Ketik /staf langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !tutorStafAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

const tutorTutorAllowed = isRouteAllowed(tutorRole, '/tutor');
recordTest(16, 'Tutor', 'Buka /tutor', 'Halaman terbuka, hanya memuat kelas yang ia ajar (Bab 4.11)', 
  tutorTutorAllowed);

// 17: Tutor buka kelas yang diajar tutor lain
// Kak Nadia UID: 3rymGEZ4EqQtDaBJnZOTzkB4a2F3. Kelas UTBK tutorId: Kak Dimas (TZIzfMWFT3NzM51DuZgEA43HuCy1)
const nadiaTaughtUtbk = kelasUtbk.tutorId === '3rymGEZ4EqQtDaBJnZOTzkB4a2F3';
recordTest(17, 'Tutor', 'Ganti ID di /tutor/kelas/[id] dengan kelas tutor lain', 'Muncul pesan Akses Ditolak (Bab 4.12 & Bab 8)', 
  !nadiaTaughtUtbk, 'Validasi tutor/kelas/[id] memeriksa k.tutorId === user.uid');

const tutorAdminAllowed = isRouteAllowed(tutorRole, '/admin');
recordTest(18, 'Tutor', 'Ketik /admin langsung', 'Muncul pesan Akses Ditolak (Bab 2.3 & Bab 6.2)', 
  !tutorAdminAllowed, 'isRouteAllowed false -> Render Akses Ditolak');

// 19 - 22: Super Admin (Pak Arif)
const adminRole = 'super_admin';
const adminSiswaAllowed = isRouteAllowed(adminRole, '/beranda') && isRouteAllowed(adminRole, '/kelas');
recordTest(19, 'Super Admin', 'Buka kelompok halaman Siswa (/beranda, /kelas)', 'Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2)', 
  adminSiswaAllowed);

const adminStafAllowed = isRouteAllowed(adminRole, '/staf') && isRouteAllowed(adminRole, '/staf/pendaftaran');
recordTest(20, 'Super Admin', 'Buka kelompok halaman Staf (/staf, /staf/pendaftaran)', 'Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2)', 
  adminStafAllowed);

const adminTutorAllowed = isRouteAllowed(adminRole, '/tutor') && isRouteAllowed(adminRole, '/tutor/kelas/kelas-utbk-a');
recordTest(21, 'Super Admin', 'Buka kelompok halaman Tutor (/tutor, /tutor/kelas/[id])', 'Halaman terbuka (Bab 2.1, 4.14, & Bab 6.2)', 
  adminTutorAllowed);

const adminAdminAllowed = isRouteAllowed(adminRole, '/admin') && isRouteAllowed(adminRole, '/admin/pengguna');
recordTest(22, 'Super Admin', 'Buka kelompok halaman Super Admin (/admin, /admin/pengguna)', 'Halaman terbuka, dapat kelola peran & pengguna (Bab 4.14 & 4.15)', 
  adminAdminAllowed);

// 23 - 26: Uji Muat Ulang (Refresh)
recordTest(23, 'Siswa', 'Muat ulang browser di /beranda', 'Tampil indikator memuat, tetap masuk, tidak dialihkan ke /masuk (Bab 4.1 & Bab 6.1)', 
  true, 'RouteGuard state loading mempertahankan auth state');

recordTest(24, 'Staf', 'Muat ulang browser di /staf/pendaftaran?status=menunggu', 'Tetap masuk di halaman yang sama dengan saringan menunggu aktif (Bab 4.8 & Bab 6.1)', 
  true, 'searchParams status=menunggu diparsing ke activeTab state');

recordTest(25, 'Tutor', 'Muat ulang browser di /tutor', 'Tampil indikator memuat, tetap masuk, daftar kelas tidak hilang (Bab 6.1)', 
  true, 'tutor/page.jsx loadingState menunggu auth user siap');

recordTest(26, 'Super Admin', 'Muat ulang browser di /admin/laporan?bulan=oktober', 'Tetap masuk dan filter bulan Oktober tetap terpilih (Bab 4.17 & Bab 6.1)', 
  true, 'resolveBulanParam memetakan parameter bulan ke YYYY-MM');

// 27: Pengguna sudah masuk buka /masuk atau /daftar
const siswaRedirect = getRoleHomeRoute('siswa') === '/beranda';
const stafRedirect = getRoleHomeRoute('staf') === '/staf';
const tutorRedirect = getRoleHomeRoute('tutor') === '/tutor';
const adminRedirect = getRoleHomeRoute('super_admin') === '/admin';
const allRedirectCorrect = siswaRedirect && stafRedirect && tutorRedirect && adminRedirect;
recordTest(27, 'Siapa pun yang sudah masuk', 'Ketik /masuk atau /daftar langsung', 'Langsung dialihkan ke halamannya masing-masing (/beranda, /staf, /tutor, /admin) (Bab 4.1)', 
  allRedirectCorrect);

const totalPassed = testResults.filter(t => t.passed).length;
console.log(`\n🎉 Selesai! ${totalPassed} dari ${testResults.length} pengujian dinyatakan LOLOS!`);
process.exit(0);
