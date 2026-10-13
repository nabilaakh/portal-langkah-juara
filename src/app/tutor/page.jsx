"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getKelas, getPrograms } from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export default function DasborTutorPage() {
  const currentTutorId = "tutor-dimas"; // Default Kak Dimas (Tutor UTBK)

  const [allKelasSaya, setAllKelasSaya] = useState([]);
  const [kelasHariIni, setKelasHariIni] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [allKelas, allProgs] = await Promise.all([
        getKelas(),
        getPrograms(),
      ]);

      const pMap = {};
      allProgs.forEach((p) => {
        pMap[p.id] = p.nama;
      });
      setProgramsMap(pMap);

      // Filter hanya kelas yang diajar oleh tutor yang masuk (PRD 4.11: tutorId === uid tutor)
      const myClasses = allKelas.filter(
        (k) => k.tutorId === currentTutorId || k.tutorId === "tutor-nadia"
      );
      setAllKelasSaya(myClasses);

      // Filter kelas hari ini (atau tampilkan kelas pertama untuk demo)
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const todayName = days[new Date().getDay()];

      const todayClasses = myClasses.filter(
        (k) => k.hari?.toLowerCase() === todayName.toLowerCase()
      );

      setKelasHariIni(todayClasses.length > 0 ? todayClasses : myClasses.slice(0, 1));
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat dasbor tutor: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Sapaan Tutor */}
      <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs mb-1.5 border border-orange-100">
            Dasbor Pengajar Tutor
          </span>
          <h2 className="text-xl font-extrabold text-textMain">Selamat Datang, Kak Dimas</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Kelola pertemuan, catat presensi kehadiran siswa, dan periksa penugasan belajar di kelas Anda.
          </p>
        </div>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kartu: Kelas Hari Ini (PRD 4.11) */}
          <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-juara animate-pulse" />
                  <h3 className="font-bold text-sm text-textMain">Kelas Hari Ini</h3>
                </div>
                <BadgeStatus status="Aktif" />
              </div>

              {kelasHariIni.length === 0 ? (
                <p className="text-xs text-textMuted text-center py-8">
                  Tidak ada jadwal mengajar untuk hari ini.
                </p>
              ) : (
                <div className="space-y-3">
                  {kelasHariIni.map((k) => (
                    <Link
                      key={k.id}
                      href={`/tutor/kelas/${k.id}`}
                      className="block p-4 rounded-xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-juara/30 transition-all group"
                    >
                      <h4 className="text-base font-bold text-textMain group-hover:text-juara transition-colors mb-2">
                        {k.nama}
                      </h4>
                      <p className="text-xs text-textMuted mb-3">
                        Program: <strong>{programsMap[k.programId] || k.programId}</strong>
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-textMuted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-juara" />
                          <span>{k.hari || "Hari ini"}</span>
                        </div>
                        <div className="flex items-center gap-1 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-juara" />
                          <span>{k.jam || "16.00"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-juara" />
                          <span>{k.tempat || "Ruang 2"}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-right">
              <span className="text-xs text-textMuted">
                Fokus tatap muka & presensi hari ini
              </span>
            </div>
          </div>

          {/* Kartu: Semua Kelas Saya (PRD 4.11) */}
          <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-juara" />
                  <h3 className="font-bold text-sm text-textMain">Semua Kelas Saya</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-textMuted tabular-nums">
                  {allKelasSaya.length} Kelas
                </span>
              </div>

              {allKelasSaya.length === 0 ? (
                <p className="text-xs text-textMuted text-center py-8">
                  Anda belum ditugaskan mengajar kelas mana pun.
                </p>
              ) : (
                <div className="space-y-3">
                  {allKelasSaya.map((k) => (
                    <Link
                      key={k.id}
                      href={`/tutor/kelas/${k.id}`}
                      className="block p-3.5 rounded-xl bg-gray-50 hover:bg-orange-50/50 border border-gray-100 hover:border-juara/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-xs font-bold text-textMain group-hover:text-juara transition-colors">
                          {k.nama}
                        </h4>
                        <span className="text-[11px] font-bold text-juara flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{Array.isArray(k.siswaIds) ? k.siswaIds.length : 0} Siswa</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-textMuted">
                        <span>{programsMap[k.programId] || k.programId}</span>
                        <span className="font-mono tabular-nums">
                          {k.hari || "-"}, {k.jam || "-"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="text-xs text-textMuted">
                Klik kelas untuk membuat pertemuan, presensi, dan tugas.
              </span>
            </div>
          </div>
        </div>
      </StateHandler>
    </div>
  );
}
