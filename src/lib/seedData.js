import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase.js";
import { COLLECTIONS } from "./firestoreService.js";

/**
 * Standard UID akun Firebase Authentication untuk Data Seed PRD Bab 7.1
 * Mengikuti ketentuan PRD:
 * - Koleksi users ID dokumen = uid akun Firebase Authentication
 * - Koleksi pendaftaran siswaId = uid siswa
 * - Koleksi kelas tutorId = uid tutor pengajar, siswaIds = array of uid siswa
 * - Koleksi pertemuan hadirIds = array of uid siswa yang hadir
 * - Koleksi pengumpulan siswaId = uid siswa pengumpul
 */
export const DEFAULT_SEED_UIDS = {
  siswaRaka: "VuNGPLSgKNZQQ2ugXVwch1POqQh1",
  siswaSalsa: "5gBuP5A9zIeUW0hcXtNynXM0Mk23",
  stafFira: "ThuisFndqiebxk0gKZlLIuXaxmz1",
  tutorDimas: "TZIzfMWFT3NzM51DuZgEA43HuCy1",
  tutorNadia: "3rymGEZ4EqQtDaBJnZOTzkB4a2F3",
  adminArif: "GKOU6Mx8SHaxRQsn9evZmd4n62o1",
};

/**
 * Pembangkit Data Seed sesuai persis dengan PRD Bab 7.1
 * Menerima customUids untuk menghubungkan UID akun Firebase Auth nyata pengguna
 */
export function generateSeedData(customUids = {}) {
  const uids = {
    siswaRaka: customUids.siswaRaka || customUids.siswaUid || customUids.targetUid || DEFAULT_SEED_UIDS.siswaRaka,
    siswaSalsa: customUids.siswaSalsa || DEFAULT_SEED_UIDS.siswaSalsa,
    stafFira: customUids.stafFira || customUids.stafUid || DEFAULT_SEED_UIDS.stafFira,
    tutorDimas: customUids.tutorDimas || customUids.tutorUid || DEFAULT_SEED_UIDS.tutorDimas,
    tutorNadia: customUids.tutorNadia || DEFAULT_SEED_UIDS.tutorNadia,
    adminArif: customUids.adminArif || customUids.adminUid || DEFAULT_SEED_UIDS.adminArif,
  };

  const now = new Date();
  const pastDay = new Date(now.getTime() - 2 * 86400000);
  const deadlineUtbk = new Date(now.getTime() + 7 * 86400000);
  const deadlineSmp = new Date(now.getTime() + 10 * 86400000);

  return {
    users: [
      {
        id: uids.siswaRaka,
        nama: customUids.siswaNama || "Raka Pratama",
        email: customUids.siswaEmail || "raka@siswa.id",
        noHp: "081234567890",
        noHpOrangTua: "081298765432",
        role: "siswa",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: uids.siswaSalsa,
        nama: "Salsa Maharani",
        email: "salsa@siswa.id",
        noHp: "081345678901",
        noHpOrangTua: "081398765431",
        role: "siswa",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: uids.stafFira,
        nama: "Kak Fira (Staf Administrasi)",
        email: "fira@langkahjuara.id",
        noHp: "085234567890",
        noHpOrangTua: "",
        role: "staf",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: uids.tutorDimas,
        nama: "Kak Dimas (Tutor UTBK)",
        email: "dimas@langkahjuara.id",
        noHp: "085345678901",
        noHpOrangTua: "",
        role: "tutor",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: uids.tutorNadia,
        nama: "Kak Nadia (Tutor Matematika)",
        email: "nadia@langkahjuara.id",
        noHp: "085456789012",
        noHpOrangTua: "",
        role: "tutor",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: uids.adminArif,
        nama: "Pak Arif (Pemilik Bimbel)",
        email: "arif@langkahjuara.id",
        noHp: "081122334455",
        noHpOrangTua: "",
        role: "super_admin",
        aktif: true,
        dibuatPada: Timestamp.fromDate(pastDay),
      },
    ],
    program: [
      {
        id: "prog-utbk",
        nama: "Intensif UTBK",
        jenjang: "SMA",
        jumlahPertemuan: 24,
        harga: 1500000,
        aktif: true,
      },
      {
        id: "prog-smp-mat",
        nama: "Matematika SMP",
        jenjang: "SMP",
        jumlahPertemuan: 16,
        harga: 800000,
        aktif: true,
      },
      {
        id: "prog-sma-inggris",
        nama: "Bahasa Inggris SMA",
        jenjang: "SMA",
        jumlahPertemuan: 12,
        harga: 650000,
        aktif: true,
      },
    ],
    pendaftaran: [
      {
        id: "pend-raka-1",
        siswaId: uids.siswaRaka,
        programId: "prog-utbk",
        status: "aktif",
        catatanStaf: "",
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: "pend-salsa-1",
        siswaId: uids.siswaSalsa,
        programId: "prog-smp-mat",
        status: "aktif",
        catatanStaf: "",
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: "pend-raka-2",
        siswaId: uids.siswaRaka,
        programId: "prog-sma-inggris",
        status: "menunggu",
        catatanStaf: "",
        dibuatPada: Timestamp.fromDate(pastDay),
      },
      {
        id: "pend-salsa-2",
        siswaId: uids.siswaSalsa,
        programId: "prog-utbk",
        status: "ditolak",
        catatanStaf: "Khusus untuk siswa jenjang SMA",
        dibuatPada: Timestamp.fromDate(pastDay),
      },
    ],
    kelas: [
      {
        id: "kelas-utbk-a",
        nama: "Intensif UTBK A",
        programId: "prog-utbk",
        tutorId: uids.tutorDimas,
        siswaIds: [uids.siswaRaka],
        hari: "Selasa",
        jam: "16.00",
        tempat: "Ruang 2",
      },
      {
        id: "kelas-smp-b",
        nama: "Matematika SMP B",
        programId: "prog-smp-mat",
        tutorId: uids.tutorNadia,
        siswaIds: [uids.siswaSalsa],
        hari: "Rabu",
        jam: "14.30",
        tempat: "Ruang 1",
      },
    ],
    pertemuan: [
      {
        id: "pert-smp-1",
        kelasId: "kelas-smp-b",
        tanggal: "2026-10-07",
        topik: "Persamaan Linear Satu Variabel",
        materiUrl: "https://drive.google.com/sample-materi-aljabar",
        hadirIds: [uids.siswaSalsa],
      },
      {
        id: "pert-utbk-1",
        kelasId: "kelas-utbk-a",
        tanggal: "2026-10-08",
        topik: "Penalaran Analitik & Silogisme",
        materiUrl: "https://drive.google.com/sample-materi-utbk",
        hadirIds: [uids.siswaRaka],
      },
    ],
    tugas: [
      {
        id: "tugas-utbk-1",
        kelasId: "kelas-utbk-a",
        judul: "Latihan Penalaran Umum 3",
        deskripsi:
          "Kerjakan 20 soal penalaran logis dari materi pertemuan 1 dan kumpulkan tautan Google Drive jawaban Anda.",
        batasWaktu: Timestamp.fromDate(deadlineUtbk),
      },
      {
        id: "tugas-smp-1",
        kelasId: "kelas-smp-b",
        judul: "Latihan Aljabar Dasar",
        deskripsi:
          "Selesaikan 10 soal persamaan linear satu variabel pada lembar kerja.",
        batasWaktu: Timestamp.fromDate(deadlineSmp),
      },
    ],
    pengumpulan: [
      {
        id: "kumpul-raka-1",
        tugasId: "tugas-utbk-1",
        siswaId: uids.siswaRaka,
        kelasId: "kelas-utbk-a",
        tautan: "https://drive.google.com/sample-jawaban-raka",
        nilai: 85,
        komentar:
          "Bagus sekali, penalaran logis dan langkah eliminasi opsi sudah tepat.",
        dikumpulkanPada: Timestamp.fromDate(pastDay),
      },
    ],
  };
}

export const initialSeedData = {
  ...generateSeedData(),
  // Alias legacy users agar verifikasi pengujian lama tetap valid
  users: [
    ...generateSeedData().users,
    {
      id: "siswa-raka",
      nama: "Raka Pratama",
      email: "raka@siswa.id",
      noHp: "081234567890",
      noHpOrangTua: "081298765432",
      role: "siswa",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
    {
      id: "siswa-salsa",
      nama: "Salsa Maharani",
      email: "salsa@siswa.id",
      noHp: "081345678901",
      noHpOrangTua: "081398765431",
      role: "siswa",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
    {
      id: "staf-fira",
      nama: "Kak Fira (Staf Administrasi)",
      email: "fira@langkahjuara.id",
      noHp: "085234567890",
      noHpOrangTua: "",
      role: "staf",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
    {
      id: "tutor-dimas",
      nama: "Kak Dimas (Tutor UTBK)",
      email: "dimas@langkahjuara.id",
      noHp: "085345678901",
      noHpOrangTua: "",
      role: "tutor",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
    {
      id: "tutor-nadia",
      nama: "Kak Nadia (Tutor Matematika)",
      email: "nadia@langkahjuara.id",
      noHp: "085456789012",
      noHpOrangTua: "",
      role: "tutor",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
    {
      id: "admin-arif",
      nama: "Pak Arif (Pemilik Bimbel)",
      email: "arif@langkahjuara.id",
      noHp: "081122334455",
      noHpOrangTua: "",
      role: "super_admin",
      aktif: true,
      dibuatPada: Timestamp.fromDate(new Date("2026-10-13T17:41:02.617Z")),
    },
  ],
};

export async function seedDatabase(customUids = {}) {
  const data = generateSeedData(customUids);
  let count = 0;
  for (const [colName, docs] of Object.entries(data)) {
    for (const item of docs) {
      const { id, ...payload } = item;
      await setDoc(doc(db, colName, id), payload, { merge: true });
      count++;
    }
  }
  return { success: true, seededCount: count, uids: { ...DEFAULT_SEED_UIDS, ...customUids } };
}
