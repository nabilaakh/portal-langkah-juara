"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getKelas,
  getTugas,
  getPengumpulanBySiswa,
  calculateTaskStatus,
  parseDate,
  formatDateTime,
} from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import Button from "@/components/ui/Button";
import { Calendar, Clock, MapPin, CheckCircle, BookOpen, ArrowRight, AlertCircle } from "lucide-react";

export default function BerandaPage() {
  const { user, profile } = useAuth();
  const currentSiswaId = user?.uid;

  const [kelasList, setKelasList] = useState([]);
  const [tugasBelumList, setTugasBelumList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadBerandaData = async () => {
    if (!currentSiswaId) {
      setLoadingState("loading");
      return;
    }

    try {
      setLoadingState("loading");
      setErrorMessage("");

      const allKelas = await getKelas();
      // Filter kelas yang memuat uid siswa di siswaIds (PRD 4.2)
      // Jika super_admin melihat beranda, tampilkan semua kelas untuk pemantauan
      const isSuperAdmin = profile?.role === "super_admin";
      const myKelas = isSuperAdmin
        ? allKelas
        : allKelas.filter(
            (k) => Array.isArray(k.siswaIds) && k.siswaIds.includes(currentSiswaId)
          );
      setKelasList(myKelas);

      // Ambil tugas dari setiap kelas siswa
      const unsubmittedTasks = [];
      for (const k of myKelas) {
        const tasks = await getTugas(k.id);
        for (const t of tasks) {
          const pengumpulan = await getPengumpulanBySiswa(t.id, currentSiswaId);
          const status = calculateTaskStatus(t, pengumpulan);
          if (status === "Belum dikumpulkan" || status === "Terlambat") {
            unsubmittedTasks.push({
              ...t,
              kelasNama: k.nama,
              status,
            });
          }
        }
      }

      // Urutkan dari batas waktu terdekat (PRD 4.2)
      unsubmittedTasks.sort((a, b) => {
        const da = parseDate(a.batasWaktu)?.getTime() || 0;
        const db = parseDate(b.batasWaktu)?.getTime() || 0;
        return da - db;
      });

      setTugasBelumList(unsubmittedTasks);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat beranda: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (currentSiswaId) {
      loadBerandaData();
    }
  }, [currentSiswaId, profile?.role]);

  const nextClass = kelasList.length > 0 ? kelasList[0] : null;

  return (
    <div className="space-y-6">
      {/* Banner Sapaan */}
      <div className="bg-gradient-to-r from-juara to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
            Selamat Datang, Siswa Langkah Juara!
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {profile?.nama || user?.displayName || user?.email?.split("@")[0] || "Siswa"}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Pantau jadwal tatap muka kelas, buka materi belajar, dan kumpulkan tugas tepat waktu untuk hasil maksimal.
          </p>
        </div>
        <Link href="/program">
          <Button variant="secondary" size="md" className="shrink-0 font-semibold shadow-xs">
            <span>Daftar Program Lain</span>
            <ArrowRight className="w-4 h-4 ml-1 text-juara" />
          </Button>
        </Link>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadBerandaData}
      >
        {/* Bila belum punya kelas sesuai PRD Bab 4.2 */}
        {kelasList.length === 0 ? (
          <div className="bg-panel rounded-2xl border border-gray-200/80 p-8 text-center shadow-xs">
            <div className="w-14 h-14 bg-orange-50 text-juara rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-textMain mb-1">
              Anda belum terdaftar di kelas mana pun
            </h3>
            <p className="text-xs text-textMuted max-w-md mx-auto mb-6 leading-relaxed">
              Pilih program bimbingan belajar Langkah Juara dan ajukan pendaftaran untuk mulai mengikuti kelas tatap muka.
            </p>
            <Link href="/program">
              <Button>
                <span>Lihat Program</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kartu: Kelas Berikutnya (PRD 4.2) */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-juara animate-pulse" />
                    <h3 className="font-bold text-sm text-textMain">Kelas Berikutnya</h3>
                  </div>
                  <BadgeStatus status="Aktif" />
                </div>

                {nextClass && (
                  <Link
                    href={`/kelas/${nextClass.id}`}
                    className="block group p-4 rounded-xl bg-gray-50/70 hover:bg-orange-50/50 border border-gray-100 hover:border-juara/30 transition-all"
                  >
                    <h4 className="text-lg font-extrabold text-textMain group-hover:text-juara transition-colors">
                      {nextClass.nama}
                    </h4>
                    <div className="mt-3 space-y-1.5 text-xs text-textMuted font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-juara shrink-0" />
                        <span>Hari: <strong>{nextClass.hari || "Selasa"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-juara shrink-0" />
                        <span>Waktu: <strong className="tabular-nums">{nextClass.jam || "16.00"} WITA</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-juara shrink-0" />
                        <span>Tempat: <strong>{nextClass.tempat || "Ruang 2"}</strong></span>
                      </div>
                    </div>
                  </Link>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-textMuted">
                  Total kelas Anda: <strong>{kelasList.length} kelas</strong>
                </span>
                <Link
                  href="/kelas"
                  className="text-xs font-bold text-juara hover:underline inline-flex items-center gap-1"
                >
                  <span>Buka Semua Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Kartu: Tugas Belum Dikumpulkan (PRD 4.2) */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-textMain">Tugas Belum Dikumpulkan</h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 tabular-nums">
                    {tugasBelumList.length} Tugas
                  </span>
                </div>

                {tugasBelumList.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-gray-50/70 border border-gray-100">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-textMain">Semua tugas telah dikumpulkan!</p>
                    <p className="text-[11px] text-textMuted mt-0.5">Pertahankan konsistensi belajarmu.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {tugasBelumList.map((tugas) => (
                      <Link
                        key={tugas.id}
                        href={`/tugas/${tugas.id}`}
                        className="block p-3 rounded-xl bg-gray-50/80 hover:bg-orange-50/60 border border-gray-100 hover:border-juara/30 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-textMain group-hover:text-juara transition-colors line-clamp-1">
                              {tugas.judul}
                            </h5>
                            <span className="text-[10px] text-textMuted">{tugas.kelasNama}</span>
                          </div>
                          <BadgeStatus status={tugas.status} />
                        </div>
                        <div className="mt-2 text-[11px] text-textMuted flex items-center gap-1.5 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>Batas: {formatDateTime(tugas.batasWaktu)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 text-right">
                <Link
                  href="/kelas"
                  className="text-xs font-bold text-juara hover:underline inline-flex items-center gap-1"
                >
                  <span>Lihat di Rincian Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </StateHandler>
    </div>
  );
}
