"use client";

import React, { useState, useEffect } from "react";
import { getUsers, getPendaftaran, getPrograms } from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { Users, Search, Phone, Mail, BookOpen } from "lucide-react";

export default function DataSiswaStafPage() {
  const [siswaList, setSiswaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [allUsers, allPends, allProgs] = await Promise.all([
        getUsers(),
        getPendaftaran("aktif"), // pendaftaran aktif
        getPrograms(),
      ]);

      const progsMap = {};
      allProgs.forEach((p) => {
        progsMap[p.id] = p.nama;
      });

      // Filter pengguna yang ber-role siswa
      const students = allUsers.filter((u) => u.role === "siswa");

      // Pasangkan program aktif dari pendaftaran (PRD 4.10: Program diambil dari pendaftaran berstatus aktif)
      const mapped = students.map((s) => {
        const studentPends = allPends.filter((p) => p.siswaId === s.id);
        const programNames = studentPends
          .map((p) => progsMap[p.programId] || p.programId)
          .filter(Boolean);

        return {
          ...s,
          programs: programNames.length > 0 ? programNames : ["Belum ada program aktif"],
        };
      });

      setSiswaList(mapped);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat data siswa: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = siswaList.filter((s) =>
    (s.nama || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Data Siswa & Kontak Orang Tua</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Daftar siswa bimbingan belajar dan kontak darurat orang tua untuk komunikasi presensi
          </p>
        </div>

        {/* Kolom Pencarian Nama Live (PRD Bab 4.10) */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 bg-white"
          />
        </div>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Tidak Ada Siswa"
        emptyMessage="Belum ada data siswa yang tersimpan."
      >
        <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                  <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Nomor HP Siswa</th>
                  <th className="py-3 px-4 font-semibold">Nomor HP Orang Tua</th>
                  <th className="py-3 px-4 font-semibold">Program Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-textMuted">
                      Tidak ditemukan siswa dengan kata kunci "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-textMain">
                        {s.nama}
                      </td>
                      <td className="py-3.5 px-4 text-textMuted font-mono">
                        {s.email}
                      </td>
                      <td className="py-3.5 px-4 text-textMuted font-mono tabular-nums">
                        {s.noHp ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-juara" />
                            {s.noHp}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-textMain font-mono tabular-nums">
                        {s.noHpOrangTua ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {s.noHpOrangTua}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {s.programs.map((prog, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-gray-100 text-textMain text-[11px] font-medium border border-gray-200"
                            >
                              {prog}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </StateHandler>
    </div>
  );
}
