import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.js";

export const COLLECTIONS = {
  USERS: "users",
  PROGRAM: "program",
  PENDAFTARAN: "pendaftaran",
  KELAS: "kelas",
  PERTEMUAN: "pertemuan",
  TUGAS: "tugas",
  PENGUMPULAN: "pengumpulan",
};

/**
 * Komputasi Status Tugas Siswa sesuai PRD Bab 4.5 & 7.1
 * - Belum dikumpulkan: belum ada pengumpulan dan batas waktu belum lewat
 * - Dikumpulkan: tautan terkirim, belum dinilai
 * - Dinilai: tutor sudah mengisi nilai (0-100)
 * - Terlambat: batas waktu lewat tanpa pengumpulan
 */
export function calculateTaskStatus(tugas, pengumpulan) {
  if (!tugas) return "Belum dikumpulkan";

  const now = new Date();
  let deadline = null;
  if (tugas.batasWaktu) {
    if (typeof tugas.batasWaktu.toDate === "function") {
      deadline = tugas.batasWaktu.toDate();
    } else {
      deadline = new Date(tugas.batasWaktu);
    }
  }

  const isPastDeadline = deadline ? now > deadline : false;

  if (pengumpulan && pengumpulan.tautan) {
    if (pengumpulan.nilai !== null && pengumpulan.nilai !== undefined && pengumpulan.nilai !== "") {
      return "Dinilai";
    }
    return "Dikumpulkan";
  }

  if (isPastDeadline) {
    return "Terlambat";
  }

  return "Belum dikumpulkan";
}

/* ==================== USERS ==================== */
export async function getUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, COLLECTIONS.USERS, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createUser(id, data) {
  const userRef = doc(db, COLLECTIONS.USERS, id);
  const payload = {
    ...data,
    aktif: data.aktif ?? true,
    dibuatPada: serverTimestamp(),
  };
  await setDoc(userRef, payload, { merge: true });
  return { id, ...payload };
}

export async function updateUser(id, data) {
  const userRef = doc(db, COLLECTIONS.USERS, id);
  await updateDoc(userRef, data);
  return { id, ...data };
}

/* ==================== PROGRAM ==================== */
export async function getPrograms(onlyActive = false) {
  const ref = collection(db, COLLECTIONS.PROGRAM);
  const q = onlyActive ? query(ref, where("aktif", "==", true)) : ref;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProgramById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, COLLECTIONS.PROGRAM, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createProgram(data) {
  const ref = collection(db, COLLECTIONS.PROGRAM);
  const docRef = await addDoc(ref, {
    ...data,
    jumlahPertemuan: Number(data.jumlahPertemuan) || 0,
    harga: Number(data.harga) || 0,
    aktif: data.aktif ?? true,
  });
  return { id: docRef.id, ...data };
}

export async function updateProgram(id, data) {
  const ref = doc(db, COLLECTIONS.PROGRAM, id);
  await updateDoc(ref, {
    ...data,
    ...(data.jumlahPertemuan !== undefined && { jumlahPertemuan: Number(data.jumlahPertemuan) }),
    ...(data.harga !== undefined && { harga: Number(data.harga) }),
  });
  return { id, ...data };
}

/* ==================== PENDAFTARAN ==================== */
export async function getPendaftaran(filterStatus = null) {
  const ref = collection(db, COLLECTIONS.PENDAFTARAN);
  let q = ref;
  if (filterStatus && filterStatus !== "semua") {
    q = query(ref, where("status", "==", filterStatus.toLowerCase()));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPendaftaranBySiswa(siswaId) {
  if (!siswaId) return [];
  const q = query(collection(db, COLLECTIONS.PENDAFTARAN), where("siswaId", "==", siswaId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createPendaftaran({ siswaId, programId }) {
  const ref = collection(db, COLLECTIONS.PENDAFTARAN);
  const payload = {
    siswaId,
    programId,
    status: "menunggu",
    catatanStaf: "",
    dibuatPada: serverTimestamp(),
  };
  const docRef = await addDoc(ref, payload);
  return { id: docRef.id, ...payload };
}

export async function updatePendaftaranStatus(id, { status, catatanStaf = "" }) {
  const ref = doc(db, COLLECTIONS.PENDAFTARAN, id);
  await updateDoc(ref, {
    status: status.toLowerCase(),
    catatanStaf,
  });
  return { id, status, catatanStaf };
}

/* ==================== KELAS ==================== */
export async function getKelas() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.KELAS));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getKelasById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, COLLECTIONS.KELAS, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createKelas(data) {
  const ref = collection(db, COLLECTIONS.KELAS);
  const payload = {
    ...data,
    siswaIds: Array.isArray(data.siswaIds) ? data.siswaIds : [],
  };
  const docRef = await addDoc(ref, payload);
  return { id: docRef.id, ...payload };
}

export async function addSiswaToKelas(kelasId, siswaId) {
  const kelas = await getKelasById(kelasId);
  if (!kelas) throw new Error("Kelas tidak ditemukan");
  const siswaIds = new Set(kelas.siswaIds || []);
  siswaIds.add(siswaId);
  const ref = doc(db, COLLECTIONS.KELAS, kelasId);
  await updateDoc(ref, { siswaIds: Array.from(siswaIds) });
  return { id: kelasId, siswaIds: Array.from(siswaIds) };
}

/* ==================== PERTEMUAN ==================== */
export async function getPertemuan(kelasId) {
  if (!kelasId) return [];
  const q = query(collection(db, COLLECTIONS.PERTEMUAN), where("kelasId", "==", kelasId));
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  return data.sort((a, b) => (a.tanggal || "").localeCompare(b.tanggal || ""));
}

export async function createPertemuan(data) {
  const ref = collection(db, COLLECTIONS.PERTEMUAN);
  const payload = {
    ...data,
    hadirIds: Array.isArray(data.hadirIds) ? data.hadirIds : [],
  };
  const docRef = await addDoc(ref, payload);
  return { id: docRef.id, ...payload };
}

export async function updatePresensi(pertemuanId, hadirIds) {
  const ref = doc(db, COLLECTIONS.PERTEMUAN, pertemuanId);
  await updateDoc(ref, { hadirIds: Array.isArray(hadirIds) ? hadirIds : [] });
  return { id: pertemuanId, hadirIds };
}

/* ==================== TUGAS ==================== */
export async function getTugas(kelasId) {
  if (!kelasId) return [];
  const q = query(collection(db, COLLECTIONS.TUGAS), where("kelasId", "==", kelasId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTugasById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, COLLECTIONS.TUGAS, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function createTugas(data) {
  const ref = collection(db, COLLECTIONS.TUGAS);
  const docRef = await addDoc(ref, data);
  return { id: docRef.id, ...data };
}

/* ==================== PENGUMPULAN ==================== */
export async function getPengumpulan(tugasId) {
  if (!tugasId) return [];
  const q = query(collection(db, COLLECTIONS.PENGUMPULAN), where("tugasId", "==", tugasId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPengumpulanBySiswa(tugasId, siswaId) {
  if (!tugasId || !siswaId) return null;
  const q = query(
    collection(db, COLLECTIONS.PENGUMPULAN),
    where("tugasId", "==", tugasId),
    where("siswaId", "==", siswaId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const first = snapshot.docs[0];
  return { id: first.id, ...first.data() };
}

export async function submitJawaban({ tugasId, siswaId, kelasId, tautan }) {
  const existing = await getPengumpulanBySiswa(tugasId, siswaId);
  if (existing) {
    const ref = doc(db, COLLECTIONS.PENGUMPULAN, existing.id);
    await updateDoc(ref, {
      tautan,
      dikumpulkanPada: serverTimestamp(),
    });
    return { ...existing, tautan };
  } else {
    const ref = collection(db, COLLECTIONS.PENGUMPULAN);
    const payload = {
      tugasId,
      siswaId,
      kelasId,
      tautan,
      nilai: null,
      komentar: "",
      dikumpulkanPada: serverTimestamp(),
    };
    const docRef = await addDoc(ref, payload);
    return { id: docRef.id, ...payload };
  }
}

export async function gradePengumpulan(id, { nilai, komentar = "" }) {
  const ref = doc(db, COLLECTIONS.PENGUMPULAN, id);
  const payload = {
    nilai: Number(nilai),
    komentar,
  };
  await updateDoc(ref, payload);
  return { id, ...payload };
}
