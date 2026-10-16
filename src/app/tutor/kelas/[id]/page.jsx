"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getKelasById,
  getPertemuan,
  getTugas,
  getUsers,
  createPertemuan,
  updatePresensi,
  createTugas,
  formatDateTime,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  CheckSquare,
  Square,
  FileText,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function KelasYangDiajarTutorPage() {
  const params = useParams();
  const kelasId = params.id;

  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [pertemuanList, setPertemuanList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pertemuan"); // 'pertemuan' | 'presensi' | 'tugas'

  // Modal Buat Pertemuan
  const [isPertemuanModalOpen, setIsPertemuanModalOpen] = useState(false);
  const [pertemuanData, setPertemuanData] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    topik: "",
    materiUrl: "",
  });
  const [isSubmittingPertemuan, setIsSubmittingPertemuan] = useState(false);
  const [pertemuanError, setPertemuanError] = useState("");

  // Presensi State
  const [selectedPertemuanId, setSelectedPertemuanId] = useState("");
  const [hadirIdsState, setHadirIdsState] = useState([]);
  const [isSavingPresensi, setIsSavingPresensi] = useState(false);
  const [presensiSuccessMsg, setPresensiSuccessMsg] = useState("");

  // Modal Buat Tugas
  const [isTugasModalOpen, setIsTugasModalOpen] = useState(false);
  const [tugasData, setTugasData] = useState({
    judul: "",
    deskripsi: "",
    batasWaktu: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  });
  const [isSubmittingTugas, setIsSubmittingTugas] = useState(false);
  const [tugasError, setTugasError] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const k = await getKelasById(kelasId);
      if (!k) {
        setLoadingState("error");
        setErrorMessage("Kelas tidak ditemukan");
        return;
      }
      setKelas(k);

      const [allUsers, perts, tasks] = await Promise.all([
        getUsers(),
        getPertemuan(kelasId),
        getTugas(kelasId),
      ]);

      const enrolled = allUsers.filter((u) =>
        Array.isArray(k.siswaIds) && k.siswaIds.includes(u.id)
      );
      setSiswaList(enrolled);
      setPertemuanList(perts);
      setTugasList(tasks);

      // Inisialisasi pertemuan yang dipilih untuk presensi
      if (perts.length > 0) {
        const lastPert = perts[perts.length - 1];
        setSelectedPertemuanId(lastPert.id);
        setHadirIdsState(Array.isArray(lastPert.hadirIds) ? lastPert.hadirIds : []);
      }

      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Kelas tidak ditemukan");
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (kelasId) {
      loadData();
    }
  }, [kelasId]);

  // Handle pilih pertemuan untuk presensi
  const handleSelectPertemuan = (pertId) => {
    setSelectedPertemuanId(pertId);
    setPresensiSuccessMsg("");
    const target = pertemuanList.find((p) => p.id === pertId);
    if (target) {
      setHadirIdsState(Array.isArray(target.hadirIds) ? target.hadirIds : []);
    }
  };

  // Toggle checklist kehadiran siswa
  const toggleAttendance = (siswaId) => {
    if (hadirIdsState.includes(siswaId)) {
      setHadirIdsState(hadirIdsState.filter((id) => id !== siswaId));
    } else {
      setHadirIdsState([...hadirIdsState, siswaId]);
    }
  };

  // Simpan Presensi Sesuai PRD Bab 4.12
  const handleSavePresensi = async () => {
    if (!selectedPertemuanId) return;
    try {
      setIsSavingPresensi(true);
      await updatePresensi(selectedPertemuanId, hadirIdsState);
      setPresensiSuccessMsg("Presensi kehadiran berhasil disimpan ke Firestore!");
      setTimeout(() => setPresensiSuccessMsg(""), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan presensi: " + err.message);
    } finally {
      setIsSavingPresensi(false);
    }
  };

  // Buat Pertemuan Sesuai PRD Bab 4.12
  const handleCreatePertemuan = async (e) => {
    e.preventDefault();
    setPertemuanError("");

    if (!pertemuanData.topik.trim()) {
      setPertemuanError("Topik pertemuan wajib diisi.");
      return;
    }

    // Validasi materiUrl wajib diawali https:// jika diisi (PRD 4.12)
    if (
      pertemuanData.materiUrl.trim() &&
      !pertemuanData.materiUrl.trim().startsWith("https://")
    ) {
      setPertemuanError("Tautan materi wajib diawali dengan 'https://'.");
      return;
    }

    try {
      setIsSubmittingPertemuan(true);
      await createPertemuan({
        kelasId,
        tanggal: pertemuanData.tanggal,
        topik: pertemuanData.topik.trim(),
        materiUrl: pertemuanData.materiUrl.trim(),
        hadirIds: [],
      });

      setIsPertemuanModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setPertemuanError("Gagal membuat pertemuan: " + err.message);
    } finally {
      setIsSubmittingPertemuan(false);
    }
  };

  // Buat Tugas Sesuai PRD Bab 4.13
  const handleCreateTugas = async (e) => {
    e.preventDefault();
    setTugasError("");

    if (!tugasData.judul.trim()) {
      setTugasError("Judul tugas wajib diisi.");
      return;
    }
    if (!tugasData.deskripsi.trim()) {
      setTugasError("Deskripsi tugas wajib diisi.");
      return;
    }

    try {
      setIsSubmittingTugas(true);
      await createTugas({
        kelasId,
        judul: tugasData.judul.trim(),
        deskripsi: tugasData.deskripsi.trim(),
        batasWaktu: new Date(tugasData.batasWaktu),
      });

      setIsTugasModalOpen(false);
      await loadData();
    } catch (err) {
      console.error(err);
      setTugasError("Gagal membuat tugas: " + err.message);
    } finally {
      setIsSubmittingTugas(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/tutor"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Dasbor Tutor</span>
      </Link>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage || "Kelas tidak ditemukan"}
        onRetry={loadData}
      >
        {kelas && (
          <>
            {/* Header Kelas Tutor */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                      Kelas yang Diajar
                    </span>
                    <BadgeStatus status="Aktif" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-textMain">
                    {kelas.nama}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Tombol Buat Pertemuan PRD 4.12 */}
                  <Button
                    onClick={() => {
                      setPertemuanError("");
                      setIsPertemuanModalOpen(true);
                    }}
                    size="sm"
                    className="font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Buat Pertemuan</span>
                  </Button>

                  {/* Tombol Buat Tugas PRD 4.13 */}
                  <Button
                    onClick={() => {
                      setTugasError("");
                      setIsTugasModalOpen(true);
                    }}
                    variant="secondary"
                    size="sm"
                    className="font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1 text-juara" />
                    <span>Buat Tugas</span>
                  </Button>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-xs text-textMuted">
                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Jadwal Hari</span>
                    <strong className="text-textMain">{kelas.hari || "-"}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Jam Belajar</span>
                    <strong className="text-textMain tabular-nums">{kelas.jam || "-"} WITA</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Jumlah Siswa</span>
                    <strong className="text-textMain tabular-nums">{siswaList.length} Siswa</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigasi Modul Tutor */}
            <div className="flex items-center gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("pertemuan")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "pertemuan"
                    ? "border-juara text-juara"
                    : "border-transparent text-textMuted hover:text-textMain"
                }`}
              >
                Pertemuan ({pertemuanList.length})
              </button>
              <button
                onClick={() => setActiveTab("presensi")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "presensi"
                    ? "border-juara text-juara"
                    : "border-transparent text-textMuted hover:text-textMain"
                }`}
              >
                Isi Presensi Kehadiran
              </button>
              <button
                onClick={() => setActiveTab("tugas")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  activeTab === "tugas"
                    ? "border-juara text-juara"
                    : "border-transparent text-textMuted hover:text-textMain"
                }`}
              >
                Tugas Kelas ({tugasList.length})
              </button>
            </div>

            {/* Tab 1: Daftar Pertemuan */}
            {activeTab === "pertemuan" && (
              <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-textMain">Daftar Pertemuan Kelas</h3>
                  <Button
                    onClick={() => setIsPertemuanModalOpen(true)}
                    size="sm"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Tambah Pertemuan</span>
                  </Button>
                </div>

                {pertemuanList.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-8">
                    Belum ada pertemuan. Klik tombol "Tambah Pertemuan" untuk memulai tatap muka.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pertemuanList.map((pert, idx) => (
                      <div
                        key={pert.id}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-juara">
                              Pertemuan {idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-textMuted bg-white px-2 py-0.5 rounded border border-gray-200">
                              {pert.tanggal}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-textMain mt-1">
                            {pert.topik}
                          </h4>
                          {pert.materiUrl && (
                            <a
                              href={pert.materiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-juara hover:underline font-medium mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Tautan Materi</span>
                            </a>
                          )}
                        </div>

                        <div className="text-xs text-textMuted sm:text-right">
                          <span className="text-[11px] font-semibold block text-emerald-700">
                            {Array.isArray(pert.hadirIds) ? pert.hadirIds.length : 0} dari {siswaList.length} Siswa Hadir
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Presensi Kehadiran (PRD Bab 4.12: Mencentang siswa yang hadir -> Simpan Presensi) */}
            {activeTab === "presensi" && (
              <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-bold text-sm text-textMain">Catat Presensi Kehadiran Siswa</h3>
                    <p className="text-xs text-textMuted mt-0.5">
                      Pilih pertemuan dan centang siswa yang hadir mengikuti kelas
                    </p>
                  </div>

                  {/* Dropdown Pertemuan */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-textMuted">Pertemuan:</label>
                    <select
                      value={selectedPertemuanId}
                      onChange={(e) => handleSelectPertemuan(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-juara"
                    >
                      {pertemuanList.map((p, i) => (
                        <option key={p.id} value={p.id}>
                          Pertemuan {i + 1} ({p.tanggal} - {p.topik})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {presensiSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{presensiSuccessMsg}</span>
                  </div>
                )}

                {siswaList.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-6">
                    Tidak ada siswa di kelas ini untuk diabsen.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {siswaList.map((siswa) => {
                      const isHadir = hadirIdsState.includes(siswa.id);
                      return (
                        <div
                          key={siswa.id}
                          onClick={() => toggleAttendance(siswa.id)}
                          className="py-3 px-3 flex items-center justify-between hover:bg-gray-50/70 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                                isHadir
                                  ? "bg-juara text-white"
                                  : "border border-gray-300 bg-white"
                              }`}
                            >
                              {isHadir && <CheckSquare className="w-4 h-4" />}
                            </button>
                            <div>
                              <span className="font-bold text-xs text-textMain block">
                                {siswa.nama}
                              </span>
                              <span className="text-[11px] text-textMuted font-mono">
                                {siswa.email}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isHadir
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {isHadir ? "Hadir" : "Tidak Hadir"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-textMuted font-semibold">
                    Total Hadir: {hadirIdsState.length} dari {siswaList.length} Siswa
                  </span>
                  <Button
                    onClick={handleSavePresensi}
                    isLoading={isSavingPresensi}
                    disabled={!selectedPertemuanId}
                  >
                    Simpan Presensi
                  </Button>
                </div>
              </div>
            )}

            {/* Tab 3: Daftar Tugas Kelas */}
            {activeTab === "tugas" && (
              <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-textMain">Daftar Tugas & Penilaian</h3>
                  <Button onClick={() => setIsTugasModalOpen(true)} size="sm">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>Buat Tugas Baru</span>
                  </Button>
                </div>

                {tugasList.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-8">
                    Belum ada tugas dibuat untuk kelas ini. Klik "Buat Tugas Baru".
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tugasList.map((tugas) => (
                      <div
                        key={tugas.id}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-textMain">
                            {tugas.judul}
                          </h4>
                          <p className="text-[11px] text-textMuted mt-0.5 line-clamp-1">
                            {tugas.deskripsi}
                          </p>
                          <div className="text-[11px] text-textMuted font-mono tabular-nums mt-1">
                            Batas Waktu: {formatDateTime(tugas.batasWaktu)}
                          </div>
                        </div>

                        <Link href={`/tutor/tugas/${tugas.id}`}>
                          <Button size="sm" variant="outline" className="shrink-0 text-xs">
                            <span>Periksa Pengumpulan & Nilai</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </StateHandler>

      {/* Modal Buat Pertemuan (PRD 4.12) */}
      <Modal
        isOpen={isPertemuanModalOpen}
        onClose={() => setIsPertemuanModalOpen(false)}
        title="Buat Pertemuan Kelas Baru"
        description="Jadwalkan sesi tatap muka dan bagikan tautan materi pembelajaran kepada siswa."
      >
        <form onSubmit={handleCreatePertemuan} className="space-y-4">
          {pertemuanError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pertemuanError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Tanggal Pertemuan <span className="text-juara">*</span>
            </label>
            <input
              type="date"
              value={pertemuanData.tanggal}
              onChange={(e) =>
                setPertemuanData({ ...pertemuanData, tanggal: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Topik Pembelajaran <span className="text-juara">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Persamaan Linear Satu Variabel / Penalaran Logis"
              value={pertemuanData.topik}
              onChange={(e) =>
                setPertemuanData({ ...pertemuanData, topik: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Tautan Materi Pembelajaran
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={pertemuanData.materiUrl}
              onChange={(e) =>
                setPertemuanData({ ...pertemuanData, materiUrl: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara font-mono"
            />
            <p className="text-[11px] text-textMuted mt-1">
              Bila diisi, tautan wajib diawali dengan <strong>https://</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPertemuanModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmittingPertemuan}>
              Simpan Pertemuan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Buat Tugas (PRD 4.13) */}
      <Modal
        isOpen={isTugasModalOpen}
        onClose={() => setIsTugasModalOpen(false)}
        title="Buat Tugas Baru"
        description="Berikan soal latihan atau tugas kepada seluruh siswa di kelas ini."
      >
        <form onSubmit={handleCreateTugas} className="space-y-4">
          {tugasError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{tugasError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Judul Tugas <span className="text-juara">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Latihan Penalaran Umum 3"
              value={tugasData.judul}
              onChange={(e) =>
                setTugasData({ ...tugasData, judul: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Deskripsi & Instruksi <span className="text-juara">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Kerjakan 20 soal penalaran logis dari materi pertemuan 1..."
              value={tugasData.deskripsi}
              onChange={(e) =>
                setTugasData({ ...tugasData, deskripsi: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Batas Waktu Pengumpulan <span className="text-juara">*</span>
            </label>
            <input
              type="datetime-local"
              value={tugasData.batasWaktu}
              onChange={(e) =>
                setTugasData({ ...tugasData, batasWaktu: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara font-mono tabular-nums"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsTugasModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmittingTugas}>
              Simpan Tugas
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
