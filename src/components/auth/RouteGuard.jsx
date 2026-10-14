"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/masuk", "/daftar"];

export default function RouteGuard({ children }) {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;

    // 1. Jika belum login dan mengakses halaman selain /masuk atau /daftar -> Arahkan ke /masuk
    if (!user && !isPublicRoute) {
      router.replace("/masuk");
      return;
    }

    // 2. Jika sudah login dan membuka halaman /masuk atau /daftar -> Arahkan ke dasbor sesuai peran
    if (user && isPublicRoute) {
      const role = profile?.role || "siswa";
      if (role === "staf") router.replace("/staf");
      else if (role === "tutor") router.replace("/tutor");
      else if (role === "super_admin") router.replace("/admin");
      else router.replace("/beranda");
      return;
    }

    // 3. Proteksi berdasarkan Peran Pengguna (Role-based Route Guard)
    if (user && profile) {
      const role = profile.role || "siswa";

      // Halaman Super Admin (/admin, /admin/*) hanya boleh diakses oleh super_admin
      if (pathname.startsWith("/admin") && role !== "super_admin") {
        if (role === "staf") router.replace("/staf");
        else if (role === "tutor") router.replace("/tutor");
        else router.replace("/beranda");
        return;
      }

      // Halaman Staf (/staf, /staf/*) hanya boleh diakses oleh staf dan super_admin
      if (pathname.startsWith("/staf") && role !== "staf" && role !== "super_admin") {
        if (role === "tutor") router.replace("/tutor");
        else router.replace("/beranda");
        return;
      }

      // Halaman Tutor (/tutor, /tutor/*) hanya boleh diakses oleh tutor dan super_admin
      if (pathname.startsWith("/tutor") && role !== "tutor" && role !== "super_admin") {
        if (role === "staf") router.replace("/staf");
        else router.replace("/beranda");
        return;
      }

      // Halaman Siswa (/beranda, /program, /kelas, /tugas) untuk siswa dan super_admin
      if (
        (pathname === "/" ||
          pathname === "/beranda" ||
          pathname.startsWith("/kelas") ||
          pathname.startsWith("/tugas") ||
          pathname === "/program") &&
        role !== "siswa" &&
        role !== "super_admin"
      ) {
        if (role === "staf") router.replace("/staf");
        else if (role === "tutor") router.replace("/tutor");
        return;
      }
    }
  }, [user, profile, loading, pathname, router, isPublicRoute]);

  // Tampilkan loading saat inisialisasi status autentikasi
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

  // Jika belum login dan di rute privat, sembunyikan tampilan selama pengalihan ke /masuk
  if (!user && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-bgApp flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-juara animate-spin" />
        <p className="text-xs text-textMuted">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  return children;
}
