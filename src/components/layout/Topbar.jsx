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

        {/* Profil Singkat & Status Auth */}
        {user || profile ? (
          <div className="flex items-center gap-1.5">
            <Link
              href="/profil"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100/70 border border-transparent hover:border-gray-200 transition-all text-xs font-medium text-textMain"
              title="Buka profil"
            >
              <div className="w-7 h-7 rounded-lg bg-juara-100 text-juara flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight max-w-[130px]">
                <span className="font-semibold text-textMain truncate">
                  {profile?.nama || user?.displayName || user?.email?.split("@")[0] || "Pengguna"}
                </span>
                <span className="text-[10px] text-textMuted uppercase font-semibold">
                  {profile?.role || "Siswa"}
                </span>
              </div>
            </Link>

            <button
              onClick={async () => {
                await logout();
                router.push("/masuk");
              }}
              title="Keluar dari akun"
              className="p-1.5 rounded-xl hover:bg-rose-50 text-textMuted hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/masuk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-juara hover:bg-juara-600 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </Link>
        )}
      </div>
    </header>
  );
}
