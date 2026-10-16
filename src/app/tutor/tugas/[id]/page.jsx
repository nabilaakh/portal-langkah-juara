"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getTugasById,
  getPengumpulan,
  getKelasById,
  getUsers,
  gradePengumpulan,
  calculateTaskStatus,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  FileText,
  Clock,
  ArrowLeft,
  ExternalLink,
  Award,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Edit,
} from "lucide-react";

export default function TugasDanNilaiTutorPage() {
  const params = useParams();
  const tugasId = params.id;

  const [tugas, setTugas] = useState(null);
  const [kelas, setKelas] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal Penilaian
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [nilaiInput, setNilaiInput] = useState("");
  const [komentarInput, setKomentarInput] = useState("");
  const [gradeError, setGradeError] = useState("");
  const [isSavingGrade, setIsSavingGrade] = useState(false);
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const t = await getTugasById(tugasId);
      if (!t) {
        setLoadingState("error");
        setErrorMessage("Tugas tidak ditemukan");
        return;
      }
      setTugas(t);

      const [k, subs, allUsers] = await Promise.all([
        getKelasById(t.kelasId),
        getPengumpulan(tugasId),
        getUsers(),
      ]);

      setKelas(k);

      const uMap = {};
      allUsers.forEach((u) => {
        uMap[u.id] = u.nama || u.email;
      });
      setUsersMap(uMap);

      // Hitung status untuk setiap pengumpulan atau siswa di kelas
      // Tampilkan seluruh siswa di kelas tersebut agar tutor melihat siapa yang belum kumpul
      const list = [];
      const enrolledSiswaIds = Array.isArray(k?.siswaIds) ? k.siswaIds : [];

      enrolledSiswaIds.forEach((sId) => {
        const foundSub = subs.find((sub) => sub.siswaId === sId);
        const status = calculateTaskStatus(t, foundSub);
        list.push({
          siswaId: sId,
          siswaNama: uMap[sId] || sId,
          subId: foundSub?.id || null,
          tautan: foundSub?.tautan || "",
          dikumpulkanPada: foundSub?.dikumpulkanPada || null,
          nilai: foundSub?.nilai ?? null,
          komentar: foundSub?.komentar || "",
          status,
        });
      });

      setSubmissions(list);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Tugas tidak ditemukan");
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (tugasId) {
      loadData();
    }
  }, [tugasId]);

  const formatDateTime = (val) => {
    if (!val) return "-";
    let d = null;
    if (typeof val.toDate === "function") {
      d = val.toDate();
    } else {
      d = new Date(val);
    }
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openGradeModal = (sub) => {
    setSelectedSub(sub);
    setNilaiInput(sub.nilai !== null ? String(sub.nilai) : "");
    setKomentarInput(sub.komentar || "");
    setGradeError("");
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setGradeError("");

    const val = Number(nilaiInput);
    // Validasi PRD Bab 4.13: nilai bilangan bulat 0 sampai 100
    if (isNaN(val) || val < 0 || val > 100 || !Number.isInteger(val)) {
      setGradeError("Nilai harus berupa bilangan bulat antara 0 sampai 100.");
      return;
    }

    try {
      setIsSavingGrade(true);
      await gradePengumpulan(selectedSub.subId, {
        nilai: val,
        komentar: komentarInput.trim(),
      });

      setIsGradeModalOpen(false);
      setGradeSuccessMsg(`Nilai untuk ${selectedSub.siswaNama} berhasil disimpan!`);
      setTimeout(() => setGradeSuccessMsg(""), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
      setGradeError("Gagal menyimpan nilai: " + err.message);
    } finally {
      setIsSavingGrade(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href={tugas ? `/tutor/kelas/${tugas.kelasId}` : "/tutor"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Kelas yang Diajar</span>
      </Link>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage || "Tugas tidak ditemukan"}
        onRetry={loadData}
      >
        {tugas && (
          <div className="space-y-6">
            {/* Header Informasi Tugas */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <div className="pb-4 border-b border-gray-100">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                  Tugas dan Nilai (Tutor)
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-textMain mt-2">
                  {tugas.judul}
                </h2>
                <p className="text-xs text-textMuted mt-1">
                  Kelas: <strong className="text-textMain">{kelas?.nama || tugas.kelasId}</strong>
                </p>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-textMuted">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    Batas Pengumpulan:{" "}
                    <strong className="text-textMain tabular-nums">
                      {formatDateTime(tugas.batasWaktu)}
                    </strong>
                  </span>
                </div>
                <span className="text-xs text-textMuted font-mono">
                  ID: {tugas.id}
                </span>
              </div>
            </div>

            {gradeSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{gradeSuccessMsg}</span>
              </div>
            )}

            {/* Tabel Pengumpulan Tugas Sesuai PRD Bab 4.13 */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-textMain">
                    Pengumpulan & Penilaian Siswa
                  </h3>
                  <p className="text-xs text-textMuted mt-0.5">
                    Periksa jawaban tugas siswa dan inputkan nilai evaluasi
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-textMuted tabular-nums">
                  {submissions.length} Siswa
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                      <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Waktu Kumpul</th>
                      <th className="py-3 px-4 font-semibold">Tautan Jawaban</th>
                      <th className="py-3 px-4 font-semibold">Nilai</th>
                      <th className="py-3 px-4 font-semibold">Komentar</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-textMuted">
                          Belum ada siswa terdaftar di kelas tugas ini.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.siswaId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-textMain">
                            {sub.siswaNama}
                          </td>
                          <td className="py-3.5 px-4">
                            <BadgeStatus status={sub.status} />
                          </td>
                          <td className="py-3.5 px-4 text-textMuted font-mono tabular-nums">
                            {formatDateTime(sub.dikumpulkanPada)}
                          </td>
                          <td className="py-3.5 px-4">
                            {sub.tautan ? (
                              <a
                                href={sub.tautan}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-juara hover:underline"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka Jawaban</span>
                              </a>
                            ) : (
                              <span className="text-gray-400 italic">Belum ada tautan</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-base tabular-nums">
                            {sub.nilai !== null ? (
                              <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                {sub.nilai}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-textMuted max-w-xs truncate">
                            {sub.komentar ? (
                              <span>"{sub.komentar}"</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {sub.subId ? (
                              <Button
                                size="sm"
                                variant={sub.nilai !== null ? "secondary" : "primary"}
                                onClick={() => openGradeModal(sub)}
                                className="text-xs"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1" />
                                <span>{sub.nilai !== null ? "Ubah Nilai" : "Beri Nilai"}</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-textMuted italic">
                                Belum mengumpulkan
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </StateHandler>

      {/* Modal Penilaian Tutor (PRD Bab 4.13: Nilai 0-100 & Komentar) */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title={`Beri Nilai: ${selectedSub?.siswaNama}`}
        description="Masukkan nilai evaluasi (bilangan bulat 0 - 100) dan berikan catatan komentar untuk siswa."
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          {gradeError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gradeError}</span>
            </div>
          )}

          {selectedSub?.tautan && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <span className="text-textMuted">Tautan Jawaban Siswa:</span>
              <a
                href={selectedSub.tautan}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-juara hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Dokumen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Nilai (0 - 100) <span className="text-juara">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              placeholder="Contoh: 85"
              value={nilaiInput}
              onChange={(e) => setNilaiInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold tabular-nums focus:outline-none focus:border-juara"
              required
            />
            <p className="text-[11px] text-textMuted mt-1">
              Nilai wajib berupa bilangan bulat dari 0 hingga 100.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Komentar & Catatan Tutor
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Bagus sekali, penalaran logis dan langkah eliminasi opsi sudah tepat."
              value={komentarInput}
              onChange={(e) => setKomentarInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGradeModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSavingGrade}>
              Simpan Nilai
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
