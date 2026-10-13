import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { COLLECTIONS } from "./firestoreService.js";

export const initialSeedData = {
  users: [
    {
      id: "siswa-raka",
      nama: "Raka Pratama",
      email: "raka@siswa.id",
      noHp: "081234567890",
      noHpOrangTua: "081298765432",
      role: "siswa",
      aktif: true,
    },
    {
      id: "siswa-salsa",
      nama: "Salsa Maharani",
      email: "salsa@siswa.id",
      noHp: "081345678901",
      noHpOrangTua: "081398765431",
      role: "siswa",
      aktif: true,
    },
    {
      id: "staf-fira",
      nama: "Kak Fira (Staf Administrasi)",
      email: "fira@langkahjuara.id",
      noHp: "085234567890",
      noHpOrangTua: "",
      role: "staf",
      aktif: true,
    },
    {
      id: "tutor-dimas",
      nama: "Kak Dimas (Tutor UTBK)",
      email: "dimas@langkahjuara.id",
      noHp: "085345678901",
      noHpOrangTua: "",
      role: "tutor",
      aktif: true,
    },
    {
      id: "tutor-nadia",
      nama: "Kak Nadia (Tutor Matematika)",
      email: "nadia@langkahjuara.id",
      noHp: "085456789012",
      noHpOrangTua: "",
      role: "tutor",
      aktif: true,
    },
    {
      id: "admin-arif",
      nama: "Pak Arif (Pemilik Bimbel)",
      email: "arif@langkahjuara.id",
      noHp: "081122334455",
      noHpOrangTua: "",
      role: "super_admin",
      aktif: true,
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
      siswaId: "siswa-raka",
      programId: "prog-utbk",
      status: "aktif",
      catatanStaf: "",
      dibuatPada: new Date().toISOString(),
    },
    {
      id: "pend-salsa-1",
      siswaId: "siswa-salsa",
      programId: "prog-smp-mat",
      status: "aktif",
      catatanStaf: "",
      dibuatPada: new Date().toISOString(),
    },
    {
      id: "pend-raka-2",
      siswaId: "siswa-raka",
      programId: "prog-sma-inggris",
      status: "menunggu",
      catatanStaf: "",
      dibuatPada: new Date().toISOString(),
    },
    {
      id: "pend-salsa-2",
      siswaId: "siswa-salsa",
      programId: "prog-utbk",
      status: "ditolak",
      catatanStaf: "Khusus untuk siswa jenjang SMA",
      dibuatPada: new Date().toISOString(),
    },
  ],
  kelas: [
    {
      id: "kelas-utbk-a",
      nama: "Intensif UTBK A",
      programId: "prog-utbk",
      tutorId: "tutor-dimas",
      siswaIds: ["siswa-raka"],
      hari: "Selasa",
      jam: "16.00",
      tempat: "Ruang 2",
    },
    {
      id: "kelas-smp-b",
      nama: "Matematika SMP B",
      programId: "prog-smp-mat",
      tutorId: "tutor-nadia",
      siswaIds: ["siswa-salsa"],
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
      hadirIds: ["siswa-salsa"],
    },
    {
      id: "pert-utbk-1",
      kelasId: "kelas-utbk-a",
      tanggal: "2026-10-08",
      topik: "Penalaran Analitik & Silogisme",
      materiUrl: "https://drive.google.com/sample-materi-utbk",
      hadirIds: ["siswa-raka"],
    },
  ],
  tugas: [
    {
      id: "tugas-utbk-1",
      kelasId: "kelas-utbk-a",
      judul: "Latihan Penalaran Umum 3",
      deskripsi: "Kerjakan 20 soal penalaran logis dari materi pertemuan 1 dan kumpulkan tautan Google Drive jawaban Anda.",
      batasWaktu: new Date(Date.now() + 7 * 86400000).toISOString(),
    },
    {
      id: "tugas-smp-1",
      kelasId: "kelas-smp-b",
      judul: "Latihan Aljabar Dasar",
      deskripsi: "Selesaikan 10 soal persamaan linear satu variabel pada lembar kerja.",
      batasWaktu: new Date(Date.now() + 10 * 86400000).toISOString(),
    },
  ],
  pengumpulan: [
    {
      id: "kumpul-raka-1",
      tugasId: "tugas-utbk-1",
      siswaId: "siswa-raka",
      kelasId: "kelas-utbk-a",
      tautan: "https://drive.google.com/sample-jawaban-raka",
      nilai: 85,
      komentar: "Bagus sekali, penalaran logis dan langkah eliminasi opsi sudah tepat.",
      dikumpulkanPada: new Date().toISOString(),
    },
  ],
};

export async function seedDatabase() {
  let count = 0;
  for (const [colName, docs] of Object.entries(initialSeedData)) {
    for (const item of docs) {
      const { id, ...data } = item;
      await setDoc(doc(db, colName, id), data, { merge: true });
      count++;
    }
  }
  return { success: true, seededCount: count };
}
