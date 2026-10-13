import http from 'http';

const routes = [
  '/daftar',
  '/masuk',
  '/beranda',
  '/program',
  '/kelas',
  '/kelas/kelas-01',
  '/tugas/tugas-01',
  '/profil',
  '/staf',
  '/staf/pendaftaran',
  '/staf/kelas',
  '/staf/kelas/kelas-01',
  '/staf/siswa',
  '/tutor',
  '/tutor/kelas/kelas-01',
  '/tutor/tugas/tugas-01',
  '/admin',
  '/admin/pengguna',
  '/admin/pengguna/user-siswa-01',
  '/admin/program',
  '/admin/laporan'
];

async function checkRoute(route) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ route, statusCode: res.statusCode, size: data.length });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log('Testing HTTP GET endpoints on http://localhost:3000 ...\n');
  let passCount = 0;
  for (const r of routes) {
    try {
      const result = await checkRoute(r);
      if (result.statusCode === 200) {
        console.log(`✅ ${result.route.padEnd(20)}: ${result.statusCode} OK (${result.size} bytes)`);
        passCount++;
      } else {
        console.error(`❌ ${result.route.padEnd(20)}: Status ${result.statusCode}`);
      }
    } catch (e) {
      console.error(`❌ ${r.padEnd(20)}: Request Error - ${e.message}`);
    }
  }

  console.log(`\nResults: ${passCount}/${routes.length} HTTP routes responded 200 OK.`);
  if (passCount === routes.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run();
