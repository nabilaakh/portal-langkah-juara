"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

const AUTH_ROUTES = ["/masuk", "/daftar"];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Tampilan bersih untuk halaman autentikasi (masuk dan daftar) tanpa sidebar & topbar
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-bgApp flex flex-col justify-center items-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    );
  }

  // Tampilan dasbor internal dengan sidebar dan topbar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
