"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPrograms,
  getPendaftaran,
  getKelas,
  getUsers,
} from "@/lib/firestoreService";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import StateHandler from "@/components/ui/StateHandler";
import {
  BarChart3,
  Calendar,
  Users,
  CheckCircle,
  GraduationCap,
  Layers,
} from "lucide-react";

function LaporanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pilihan bulan dinamis sesuai tanggal berjalan (PRD 4.17)
  const now = new Date();
  const defaultYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const queryMonth = searchParams.get("bulan") || defaultYm;
  const [selectedBulan, setSelectedBulan] = useState(queryMonth);

  const [siswaPerProgram, setSiswaPerProgram] = useState([]);
  const [kehadiranPerKelas, setKehadiranPerKelas] = useState([]);
  const [bebanPerTutor, setBebanPerTutor] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [progs, allPends, allKelas, allUsers, pertsSnapshot] = await Promise.all([
        getPrograms(),
        getPendaftaran("aktif"), // pendaftaran aktif
        getKelas(),
        getUsers(),
        getDocs(collection(db, "pertemuan")),
      ]);

      const allPerts = pertsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Filter pertemuan bulan berjalan sesuai query (misal '2026-10')
      const pertsInMonth = allPerts.filter((p) =>
        (p.tanggal || "").startsWith(selectedBulan)
      );

      // 1. Tabel: Siswa aktif per program (PRD 4.17)
      const table1 = progs.map((prog) => {
        const studentIds = new Set();
        allPends.forEach((p) => {
          if (p.programId === prog.id && p.status === "aktif" && p.siswaId) {
            studentIds.add(p.siswaId);
          }
        });
        return {
          id: prog.id,
          nama: prog.nama,
          jenjang: prog.jenjang,
          siswaAktifCount: studentIds.size,
        };
      });
      setSiswaPerProgram(table1);

      // 2. Tabel: Kehadiran per kelas (rata-rata persentase hadir) (PRD 4.17)
      const tutorsMap = {};
      allUsers.forEach((u) => {
        tutorsMap[u.id] = u.nama;
      });

      const table2 = allKelas.map((k) => {
        const kelasPerts = pertsInMonth.filter((p) => p.kelasId === k.id);
        const enrolledCount = Array.isArray(k.siswaIds) ? k.siswaIds.length : 0;

        let totalHadir = 0;
        let totalPossible = 0;

        kelasPerts.forEach((pert) => {
          const hadirCount = Array.isArray(pert.hadirIds) ? pert.hadirIds.length : 0;
          totalHadir += hadirCount;
          totalPossible += Math.max(enrolledCount, 1);
        });

        const persentase =
          totalPossible > 0 ? Math.round((totalHadir / totalPossible) * 100) : 100;

        return {
          id: k.id,
          nama: k.nama,
          tutorNama: tutorsMap[k.tutorId] || k.tutorId || "Tutor",
          enrolledCount,
          pertemuanBulanIni: kelasPerts.length,
          persentaseHadir: persentase,
        };
      });
      setKehadiranPerKelas(table2);

      // 3. Tabel: Jumlah kelas per tutor (jumlah kelas dan jumlah pertemuan bulan itu) (PRD 4.17)
      const tutorUsers = allUsers.filter((u) => u.role === "tutor");
      const table3 = tutorUsers.map((tut) => {
        const tutKelas = allKelas.filter((k) => k.tutorId === tut.id);
        const tutPerts = pertsInMonth.filter((p) => {
          const parent = allKelas.find((k) => k.id === p.kelasId);
          return parent?.tutorId === tut.id;
        });

        return {
          id: tut.id,
          nama: tut.nama,
          email: tut.email,
          jumlahKelas: tutKelas.length,
          jumlahPertemuan: tutPerts.length,
        };
      });
      setBebanPerTutor(table3);

      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal menyusun laporan bulanan: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBulan]);

  const handleBulanChange = (val) => {
    setSelectedBulan(val);
    // Simpan pilihan bulan ke alamat URL query sesuai PRD Bab 4.17
    router.push(`/admin/laporan?bulan=${val}`);
  };

  const getDynamicMonthOptions = () => {
    const list = [];
    const base = new Date();
    for (let i = -3; i <= 2; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
      list.push({ value: val, label });
    }
    return list;
  };

  const monthOptions = getDynamicMonthOptions();

  return (
    <div className="space-y-8">
      {/* Header Laporan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Laporan Rekap Bulanan</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Rekap otomatis siswa aktif, persentase kehadiran per kelas, dan beban pertemuan per tutor
          </p>
        </div>

        {/* Pilihan Bulan Sesuai PRD Bab 4.17 */}
        <div className="flex items-center gap-2 bg-panel px-3.5 py-2 rounded-xl border border-gray-200 shadow-2xs">
          <Calendar className="w-4 h-4 text-juara shrink-0" />
          <span className="text-xs font-semibold text-textMuted">Periode Bulan:</span>
          <select
            value={selectedBulan}
            onChange={(e) => handleBulanChange(e.target.value)}
            className="text-xs font-bold text-textMain bg-transparent focus:outline-none cursor-pointer"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
      >
        <div className="space-y-6">
          {/* TABEL 1: Siswa Aktif per Program (PRD 4.17) */}
          <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                  <Users className="w-4 h-4 text-juara" />
                  <span>1. Siswa Aktif per Program</span>
                </h3>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Jumlah siswa yang memiliki pendaftaran berstatus aktif
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                    <th className="py-3 px-4 font-semibold">Nama Program</th>
                    <th className="py-3 px-4 font-semibold">Jenjang</th>
                    <th className="py-3 px-4 font-semibold text-right">Jumlah Siswa Aktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {siswaPerProgram.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-bold text-textMain">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-textMain font-semibold border border-gray-200 text-[11px]">
                          {item.jenjang}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-juara text-right font-mono tabular-nums text-sm">
                        {item.siswaAktifCount} Siswa
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 2: Kehadiran per Kelas (PRD 4.17) */}
          <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>2. Kehadiran per Kelas (Rata-rata Persentase Hadir)</span>
                </h3>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Rata-rata tingkat kehadiran siswa pada seluruh pertemuan di bulan terpilih
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                    <th className="py-3 px-4 font-semibold">Nama Kelas</th>
                    <th className="py-3 px-4 font-semibold">Tutor Pengampu</th>
                    <th className="py-3 px-4 font-semibold">Jumlah Siswa</th>
                    <th className="py-3 px-4 font-semibold">Pertemuan Bulan Ini</th>
                    <th className="py-3 px-4 font-semibold text-right">Rata-rata Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {kehadiranPerKelas.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-bold text-textMain">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4 text-textMuted font-medium">
                        {item.tutorNama}
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-textMuted">
                        {item.enrolledCount} Siswa
                      </td>
                      <td className="py-3.5 px-4 font-mono tabular-nums text-textMuted">
                        {item.pertemuanBulanIni} Sesi
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black font-mono tabular-nums text-sm px-2.5 py-0.5 rounded-lg ${
                            item.persentaseHadir >= 80
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.persentaseHadir}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABEL 3: Jumlah Kelas per Tutor (PRD 4.17) */}
          <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-textMain flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-juara" />
                  <span>3. Beban Kelas & Pertemuan per Tutor</span>
                </h3>
                <p className="text-[11px] text-textMuted mt-0.5">
                  Jumlah kelas yang diampu dan total pertemuan yang terlaksana bulan ini
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                    <th className="py-3 px-4 font-semibold">Nama Tutor</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Jumlah Kelas</th>
                    <th className="py-3 px-4 font-semibold text-right">Pertemuan Bulan Ini</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bebanPerTutor.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-bold text-textMain">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-4 text-textMuted font-mono">
                        {item.email}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-textMain font-mono tabular-nums">
                        {item.jumlahKelas} Kelas
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-juara text-right font-mono tabular-nums text-sm">
                        {item.jumlahPertemuan} Pertemuan
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StateHandler>
    </div>
  );
}

export default function LaporanAdminPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-textMuted">Memuat data laporan bulanan...</div>}>
      <LaporanContent />
    </Suspense>
  );
}
