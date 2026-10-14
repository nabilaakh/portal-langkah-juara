"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Database, CheckCircle2, User, RefreshCw, LogOut, LogIn } from "lucide-react";
import { seedDatabase } from "@/lib/seedData";
import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const getPageTitle = (path) => {
    if (!path || path === "/" || path === "/beranda") return "Beranda Siswa";
    if (path === "/program") return "Program Bimbingan Belajar";
    if (path.startsWith("/kelas")) return "Kelas Saya";
    if (path.startsWith("/tugas")) return "Tugas Pembelajaran";
    if (path === "/profil") return "Profil Pengguna";
    if (path === "/staf") return "Dasbor Staf";
    if (path.startsWith("/staf/pendaftaran")) return "Kelola Pendaftaran Siswa";
    if (path.startsWith("/staf/kelas")) return "Kelola Kelas Bimbel";
    if (path.startsWith("/staf/siswa")) return "Data Siswa & Kontak Orang Tua";
    if (path === "/tutor") return "Dasbor Tutor";
    if (path.startsWith("/tutor/kelas")) return "Kelas yang Diajar";
    if (path.startsWith("/tutor/tugas")) return "Tugas & Penilaian Nilai";
    if (path === "/admin") return "Dasbor Super Admin";
    if (path.startsWith("/admin/pengguna")) return "Kelola Pengguna";
    if (path.startsWith("/admin/program")) return "Pengaturan Program";
    if (path.startsWith("/admin/laporan")) return "Laporan Rekap Bulanan";
    if (path === "/daftar") return "Pendaftaran Akun Baru";
    if (path === "/masuk") return "Masuk ke Akun";
    return "Portal Langkah Juara";
  };

  const handleSeed = async () => {
    try {
      setIsSeeding(true);
      await seedDatabase();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
      // Reload current page data
      window.location.reload();
    } catch (err) {
      console.error("Gagal melakukan seeding data demo:", err);
      alert("Gagal menginisialisasi data Firestore: " + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-gray-200/80 bg-panel sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3 pl-12 lg:pl-0">
        <div>
          <h1 className="text-base font-bold text-textMain tracking-tight">
            {getPageTitle(pathname)}
          </h1>
          <p className="text-[11px] text-textMuted hidden sm:block">
            Portal Belajar Langkah Juara Makassar
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Tombol Seeder Data Demo Firestore */}
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
            seedSuccess
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white hover:bg-orange-50/50 text-juara border-juara/30 hover:border-juara"
          }`}
          title="Isi database Firestore dengan data contoh PRD (Raka, Salsa, Kak Fira, Kak Dimas, Pak Arif)"
        >
          {isSeeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : seedSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {isSeeding ? "Mengisi Data..." : seedSuccess ? "Data Terisi!" : "Isi Data Demo"}
          </span>
        </button>

        {/* Profil Singkat & Status Auth (Dibaca langsung dari dokumen users/{uid}) */}
        {user || profile ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profil"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50/80 hover:bg-orange-50/50 border border-gray-200/80 hover:border-juara/30 transition-all text-xs text-textMain shadow-2xs"
              title={`Akun: ${profile?.nama || user?.email} (ID: ${user?.uid || profile?.id || "-"})`}
            >
              <div className="w-8 h-8 rounded-xl bg-juara text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {(profile?.nama || user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-textMain text-xs max-w-[120px] sm:max-w-[160px] truncate">
                  {profile?.nama || user?.displayName || user?.email?.split("@")[0]}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded-md text-[10px] font-bold border uppercase tracking-wider ${
                      profile?.role === "super_admin"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : profile?.role === "tutor"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : profile?.role === "staf"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {profile?.role === "super_admin"
                      ? "Super Admin"
                      : profile?.role === "tutor"
                      ? "Tutor"
                      : profile?.role === "staf"
                      ? "Staf"
                      : "Siswa"}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={async () => {
                await logout();
                router.push("/masuk");
              }}
              title="Keluar (Logout)"
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 text-textMuted hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-gray-100 text-textMuted text-[11px] font-medium border border-gray-200">
              Tamu
            </span>
            <Link
              href="/masuk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-juara hover:bg-juara-600 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
