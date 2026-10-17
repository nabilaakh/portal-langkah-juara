// Helper fungsi otorisasi peran rute (Bab 6.2 & Bab 8 PRD)

export const PUBLIC_ROUTES = ["/masuk", "/daftar"];

export function getRoleHomeRoute(role) {
  if (role === "staf") return "/staf";
  if (role === "tutor") return "/tutor";
  if (role === "super_admin") return "/admin";
  return "/beranda";
}

export function isRouteAllowed(role, pathname) {
  if (role === "super_admin") return true;

  // Halaman profil dapat diakses oleh semua pengguna yang sudah login
  if (pathname === "/profil") return true;

  // Halaman Super Admin
  if (pathname.startsWith("/admin")) {
    return role === "super_admin";
  }

  // Halaman Staf
  if (pathname.startsWith("/staf")) {
    return role === "staf" || role === "super_admin";
  }

  // Halaman Tutor
  if (pathname.startsWith("/tutor")) {
    return role === "tutor" || role === "super_admin";
  }

  // Halaman Siswa
  if (
    pathname === "/beranda" ||
    pathname === "/program" ||
    pathname.startsWith("/kelas") ||
    pathname.startsWith("/tugas")
  ) {
    return role === "siswa" || role === "super_admin";
  }

  return true;
}
