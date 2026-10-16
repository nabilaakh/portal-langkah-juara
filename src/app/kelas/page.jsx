"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getKelas, getUsers } from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { Calendar, Clock, MapPin, User, ArrowRight, BookOpen } from "lucide-react";

export default function KelasSayaPage() {
  const { user, profile } = useAuth();
  const currentSiswaId = user?.uid;

  const [kelasList, setKelasList] = useState([]);
  const [tutorMap, setTutorMap] = useState({});
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    if (!currentSiswaId) {
      setLoadingState("loading");
      return;
    }

    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [allKelas, allUsers] = await Promise.all([
        getKelas(),
        getUsers(),
      ]);

      const tutors = {};
      allUsers.forEach((u) => {
        tutors[u.id] = u.nama;
      });
      setTutorMap(tutors);

      // Filter kelas yang memuat uid siswa di siswaIds (PRD 4.4)
      const isSuperAdmin = profile?.role === "super_admin";
      const myKelas = isSuperAdmin
        ? allKelas
        : allKelas.filter(
          (k) => Array.isArray(k.siswaIds) && k.siswaIds.includes(currentSiswaId)
        );

      setKelasList(myKelas);
      setLoadingState(myKelas.length === 0 ? "empty" : "success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat kelas saya: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (currentSiswaId) {
      loadData();
    }
  }, [currentSiswaId, profile?.role]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-textMain">Kelas Saya</h2>
        <p className="text-xs text-textMuted mt-0.5">
          Daftar kelas bimbingan belajar aktif yang Anda ikuti
        </p>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Belum Terdaftar di Kelas"
        emptyMessage="Anda belum memiliki kelas di Langkah Juara."
        emptyAction={
          <Link
            href="/program"
            className="inline-flex items-center gap-2 px-4 py-2 bg-juara hover:bg-juara-600 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span>Lihat Program Tersedia</span>
          </Link>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {kelasList.map((k) => (
            <Link
              key={k.id}
              href={`/kelas/${k.id}`}
              className="bg-panel rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-juara/40 hover:shadow-sm transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <BadgeStatus status="Aktif" />
                  <span className="text-[11px] text-textMuted font-mono">
                    ID: {k.id}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-textMain group-hover:text-juara transition-colors mb-3">
                  {k.nama}
                </h3>

                <div className="space-y-2 text-xs text-textMuted">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-juara shrink-0" />
                    <span>Tutor: <strong className="text-textMain">{tutorMap[k.tutorId] || k.tutorId || "Tutor Langkah Juara"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-juara shrink-0" />
                    <span>Hari: <strong className="text-textMain">{k.hari || "-"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-juara shrink-0" />
                    <span>Jam: <strong className="text-textMain tabular-nums">{k.jam || "-"} WITA</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-juara shrink-0" />
                    <span>Tempat: <strong className="text-textMain">{k.tempat || "-"}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-juara group-hover:translate-x-0.5 transition-transform">
                <span>Buka Rincian Kelas</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </StateHandler>
    </div>
  );
}
