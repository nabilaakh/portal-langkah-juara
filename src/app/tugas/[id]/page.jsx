"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getTugasById,
  getPengumpulanBySiswa,
  submitJawaban,
  calculateTaskStatus,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import Button from "@/components/ui/Button";
import {
  FileText,
  Clock,
  Link2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Award,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export default function DetailTugasSiswaPage() {
  const params = useParams();
  const tugasId = params.id;
  const currentSiswaId = "siswa-raka";

  const [tugas, setTugas] = useState(null);
  const [pengumpulan, setPengumpulan] = useState(null);
  const [tautanInput, setTautanInput] = useState("");
  const [status, setStatus] = useState("Belum dikumpulkan");
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

      const p = await getPengumpulanBySiswa(tugasId, currentSiswaId);
      setPengumpulan(p);
      if (p && p.tautan) {
        setTautanInput(p.tautan);
      }

      const calculatedStatus = calculateTaskStatus(t, p);
      setStatus(calculatedStatus);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError("");
    setSuccessMsg("");

    const url = tautanInput.trim();
    // Validasi PRD Bab 4.5: tautan wajib diawali https://
    if (!url || !url.startsWith("https://")) {
      setActionError("Tautan jawaban wajib diisi dan harus diawali dengan 'https://'.");
      return;
    }

    // Validasi batas waktu jika belum dikumpulkan sama sekali
    const now = new Date();
    const deadline = tugas.batasWaktu ? new Date(tugas.batasWaktu) : null;
    if (deadline && now > deadline && !pengumpulan) {
      setActionError("Batas waktu pengumpulan telah lewat.");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitJawaban({
        tugasId: tugas.id,
        siswaId: currentSiswaId,
        kelasId: tugas.kelasId,
        tautan: url,
      });

      setSuccessMsg("Tautan jawaban berhasil dikumpulkan!");
      await loadData();
    } catch (err) {
      console.error(err);
      setActionError("Gagal mengirim pengumpulan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGraded = pengumpulan && pengumpulan.nilai !== null && pengumpulan.nilai !== undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href={tugas ? `/kelas/${tugas.kelasId}` : "/kelas"}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Kelas</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                      Tugas Kelas
                    </span>
                    <BadgeStatus status={status} />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-textMain">
                    {tugas.judul}
                  </h2>
                </div>
              </div>

              {/* Batas Waktu */}
              <div className="flex items-center gap-2 mt-4 text-xs text-textMuted font-mono bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <span>
                  Batas Waktu Pengumpulan:{" "}
                  <strong className="text-textMain tabular-nums">
                    {tugas.batasWaktu
                      ? new Date(tugas.batasWaktu).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WITA"
                      : "-"}
                  </strong>
                </span>
              </div>

              {/* Deskripsi */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-textMain uppercase tracking-wider mb-2">
                  Instruksi & Deskripsi Tugas:
                </h4>
                <div className="text-sm text-textMuted leading-relaxed whitespace-pre-line bg-gray-50/40 p-4 rounded-xl border border-gray-100">
                  {tugas.deskripsi || "Tidak ada deskripsi tambahan."}
                </div>
              </div>
            </div>

            {/* Hasil Penilaian Tutor bila sudah dinilai (PRD 4.5) */}
            {isGraded && (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm mb-4">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Nilai & Evaluasi Tutor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 text-center">
                    <span className="text-xs text-emerald-700 font-semibold block mb-1">
                      Nilai Tugas
                    </span>
                    <span className="text-4xl font-black text-emerald-600 tabular-nums">
                      {pengumpulan.nilai}
                    </span>
                    <span className="text-[10px] text-textMuted block mt-1">Skala 0 - 100</span>
                  </div>

                  <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-emerald-200 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold mb-1">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Komentar & Catatan Tutor:</span>
                    </div>
                    <p className="text-xs text-textMain italic leading-relaxed">
                      "{pengumpulan.komentar || "Tugas telah diperiksa dengan baik."}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Pengumpulan Tautan Jawaban (PRD 4.5) */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-textMain mb-1 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-juara" />
                <span>Pengumpulan Tautan Jawaban</span>
              </h3>
              <p className="text-xs text-textMuted mb-5">
                Unggah file tugas Anda ke Google Drive / Cloud Storage, atur izin akses ke publik, dan tempel tautannya di bawah ini.
              </p>

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {actionError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1.5">
                    Tautan Jawaban <span className="text-juara">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={tautanInput}
                    onChange={(e) => setTautanInput(e.target.value)}
                    disabled={isGraded}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 font-mono text-xs"
                  />
                  <p className="text-[11px] text-textMuted mt-1">
                    Format wajib diawali dengan <strong>https://</strong>.
                  </p>
                </div>

                {pengumpulan && pengumpulan.tautan && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-textMuted">Tautan tersimpan:</span>
                    <a
                      href={pengumpulan.tautan}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-juara hover:underline inline-flex items-center gap-1"
                    >
                      <span>Buka Tautan</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    disabled={isGraded}
                    className="w-full sm:w-auto"
                  >
                    <span>{pengumpulan ? "Perbarui Tautan Jawaban" : "Kumpulkan"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </StateHandler>
    </div>
  );
}
