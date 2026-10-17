"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert, Home, LogOut } from "lucide-react";

import { PUBLIC_ROUTES, getRoleHomeRoute, isRouteAllowed } from "@/lib/authGuardHelpers";

export { PUBLIC_ROUTES, getRoleHomeRoute, isRouteAllowed };

export default function RouteGuard({ children }) {
  const { user, profile, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;

    // 1. Belum login & mengakses halaman privat -> arahkan ke /masuk (Bab 6.2)
    if (!user && !isPublicRoute) {
      router.replace("/masuk");
      return;
    }

    // 2. Sudah login & membuka halaman /masuk atau /daftar -> langsung arahkan ke dasbor perannya (Bab 4.1)
    if (user && isPublicRoute) {
      const role = profile?.role || "siswa";
      router.replace(getRoleHomeRoute(role));
      return;
    }

    // 3. Root landing redirect jika user membuka '/'
    if (user && profile && pathname === "/") {
      const role = profile.role || "siswa";
      if (role !== "siswa" && role !== "super_admin") {
        router.replace(getRoleHomeRoute(role));
      }
    }
  }, [user, profile, loading, pathname, router, isPublicRoute]);

  // Loading spinner saat memeriksa autentikasi awal (Bab 6.1)
  if (loading) {
    return (
      <div className="min-h-screen bg-bgApp flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-juara animate-spin" />
        <p className="text-xs font-semibold text-textMuted tracking-wide">
          Memeriksa autentikasi...
        </p>
      </div>
    );
  }

  // Belum login & di rute privat -> sembunyikan tampilan saat redirect ke /masuk
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-bgApp flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-juara animate-spin" />
        <p className="text-xs text-textMuted">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  // Sudah login tapi berada di /masuk atau /daftar -> sembunyikan tampilan saat redirect ke dasbor
  if (user && isPublicRoute) {
    return (
      <div className="min-h-screen bg-bgApp flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-juara animate-spin" />
        <p className="text-xs text-textMuted">Mengarahkan ke dasbor...</p>
      </div>
    );
  }

  // Pemeriksaan Hak Akses (Role-based Authorization)
  // Sesuai PRD Bab 2.3, 6.2, dan Bab 8: Peran yang tidak berhak melihat pesan "Akses Ditolak"
  if (user && profile) {
    const role = profile.role || "siswa";
    const allowed = isRouteAllowed(role, pathname);

    if (!allowed) {
      const homeRoute = getRoleHomeRoute(role);
      const formattedRole = role.replace("_", " ");

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 mb-2">
            Akses Ditolak
          </span>
          <p className="text-xs text-textMuted max-w-md leading-relaxed mb-6">
            Anda tidak memiliki hak akses untuk membuka halaman ini.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={homeRoute}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-juara text-white hover:bg-juara/90 transition-colors shadow-xs"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dasbor ({formattedRole})</span>
            </Link>
          </div>
        </div>
      );
    }
  }

  return children;
}
