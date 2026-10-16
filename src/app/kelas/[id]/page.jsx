"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getKelasById,
  getPertemuan,
  getTugas,
  getUserById,
  getPengumpulanBySiswa,
  calculateTaskStatus,
  formatDateTime,
} from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function RincianKelasSiswaPage() {
  const params = useParams();
  const kelasId = params.id;
  const { user } = useAuth();
  const currentSiswaId = user?.uid;

  const [kelas, setKelas] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [pertemuanList, setPertemuanList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

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

      const [tut, perts, tasks] = await Promise.all([
        k.tutorId ? getUserById(k.tutorId) : null,
        getPertemuan(kelasId),
        getTugas(kelasId),
      ]);

      setTutor(tut);
      setPertemuanList(perts);

      // Hitung status untuk setiap tugas jika siswa ID tersedia
      const tasksWithStatus = [];
      for (const t of tasks) {
        const pengumpulan = currentSiswaId
          ? await getPengumpulanBySiswa(t.id, currentSiswaId)
          : null;
        const status = calculateTaskStatus(t, pengumpulan);
        tasksWithStatus.push({
          ...t,
          status,
        });
      }
      setTugasList(tasksWithStatus);

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
  }, [kelasId, currentSiswaId]);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/kelas"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Kelas</span>
      </Link>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage || "Kelas tidak ditemukan"}
        onRetry={loadData}
      >
        {kelas && (
          <>
            {/* Header Rincian Kelas */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                      Rincian Kelas
                    </span>
                    <BadgeStatus status="Aktif" />
                  </div>
                  <h2 className="text-xl font-extrabold text-textMain">{kelas.nama}</h2>
                </div>
                <div className="text-xs text-textMuted font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200/60 self-start">
                  ID: {kelas.id}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs text-textMuted">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <User className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Tutor Pengampu</span>
                    <strong className="text-textMain">{tutor?.nama || kelas.tutorId || "Kak Dimas"}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <Calendar className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Hari Belajar</span>
                    <strong className="text-textMain">{kelas.hari || "Selasa"}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <Clock className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Waktu / Jam</span>
                    <strong className="text-textMain tabular-nums">{kelas.jam || "16.00"} WITA</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <MapPin className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Tempat / Ruang</span>
                    <strong className="text-textMain">{kelas.tempat || "Ruang 2"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Dua Kolom: Daftar Pertemuan & Daftar Tugas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Kolom 1: Daftar Pertemuan (PRD 4.4) */}
              <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-juara" />
                    <h3 className="font-bold text-sm text-textMain">Daftar Pertemuan & Materi</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-textMuted tabular-nums">
                    {pertemuanList.length} Pertemuan
                  </span>
                </div>

                {pertemuanList.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-8">
                    Belum ada pertemuan yang dijadwalkan oleh tutor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pertemuanList.map((pert, idx) => (
                      <div
                        key={pert.id}
                        className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-juara">
                              Pertemuan {idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-textMain mt-0.5">
                              {pert.topik}
                            </h4>
                          </div>
                          <span className="text-[11px] font-mono text-textMuted tabular-nums bg-white px-2 py-0.5 rounded border border-gray-200">
                            {pert.tanggal}
                          </span>
                        </div>

                        {/* Tautan Materi (PRD 4.4: Salsa mengklik tautan Materi) */}
                        {pert.materiUrl ? (
                          <div className="mt-1 pt-2 border-t border-gray-200/60">
                            <a
                              href={pert.materiUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-juara hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka Tautan Materi Pembelajaran</span>
                            </a>
                          </div>
                        ) : (
                          <div className="text-[11px] text-textMuted/70 italic mt-1">
                            Materi belum diunggah
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kolom 2: Daftar Tugas (PRD 4.4) */}
              <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-juara" />
                    <h3 className="font-bold text-sm text-textMain">Daftar Tugas Kelas</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-textMuted tabular-nums">
                    {tugasList.length} Tugas
                  </span>
                </div>

                {tugasList.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-8">
                    Belum ada tugas untuk kelas ini.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tugasList.map((tugas) => (
                      <Link
                        key={tugas.id}
                        href={`/tugas/${tugas.id}`}
                        className="block p-4 rounded-xl bg-gray-50/80 hover:bg-orange-50/60 border border-gray-100 hover:border-juara/30 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h4 className="text-xs font-bold text-textMain group-hover:text-juara transition-colors line-clamp-1">
                            {tugas.judul}
                          </h4>
                          <BadgeStatus status={tugas.status} />
                        </div>
                        <p className="text-[11px] text-textMuted line-clamp-2 mb-3">
                          {tugas.deskripsi}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-textMuted border-t border-gray-200/60 pt-2">
                          <span className="tabular-nums">
                            Batas: {formatDateTime(tugas.batasWaktu)}
                          </span>
                          <span className="font-sans font-bold text-juara flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Kumpulkan <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </StateHandler>
    </div>
  );
}
