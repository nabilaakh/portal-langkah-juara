"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { Users, Search, Filter, ArrowRight, ShieldCheck } from "lucide-react";

export default function KelolaPenggunaAdminPage() {
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("semua");
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");
      const users = await getUsers();
      setUsersList(users);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat pengguna: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const roles = [
    { key: "semua", label: "Semua Peran" },
    { key: "siswa", label: "Siswa" },
    { key: "staf", label: "Staf" },
    { key: "tutor", label: "Tutor" },
    { key: "super_admin", label: "Super Admin" },
  ];

  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      (u.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole =
      selectedRole === "semua" || (u.role || "").toLowerCase() === selectedRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Kelola Pengguna</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Daftar seluruh akun pengguna portal dan pengelolaan wewenang peran
          </p>
        </div>

        {/* Live Search (PRD 4.15) */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara bg-white"
          />
        </div>
      </div>

      {/* Saringan Peran (PRD 4.15) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-textMuted mr-1 shrink-0" />
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => setSelectedRole(r.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedRole === r.key
                ? "bg-juara text-white shadow-xs"
                : "bg-white text-textMuted hover:text-textMain hover:bg-gray-100/70 border border-gray-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Tidak Ada Pengguna"
        emptyMessage="Tidak ada pengguna yang sesuai dengan kriteria saringan."
      >
        <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                  <th className="py-3 px-4 font-semibold">Nama Pengguna</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Peran (Role)</th>
                  <th className="py-3 px-4 font-semibold">Status Akun</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-textMuted">
                      Tidak ditemukan pengguna dengan kriteria pencarian saat ini.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-textMain">
                        <Link
                          href={`/admin/pengguna/${user.id}`}
                          className="hover:text-juara transition-colors"
                        >
                          {user.nama}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-textMuted font-mono">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight bg-gray-100 text-textMain border border-gray-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <BadgeStatus status={user.aktif !== false ? "Aktif" : "Ditolak"} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/pengguna/${user.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-juara hover:underline"
                        >
                          <span>Ubah Peran</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
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
