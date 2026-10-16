"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  Home,
  BookOpen,
  Calendar,
  ClipboardList,
  User,
  Users,
  Settings,
  Shield,
  BarChart3,
  Layers,
  LogIn,
  UserPlus,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = profile?.role || (user ? "siswa" : null);

  // Buat menu terproteksi yang disesuaikan secara dinamis dengan peran pengguna
  const getMenuGroups = () => {
    if (!user) return [];

    const groups = [];

    // Menu Siswa
    if (role === "siswa" || role === "super_admin") {
      groups.push({
        group: "Menu Siswa",
        items: [
          { label: "Beranda", href: "/beranda", icon: Home },
          { label: "Program Bimbel", href: "/program", icon: BookOpen },
          { label: "Kelas Saya", href: "/kelas", icon: Calendar },
        ],
      });
    }

    // Menu Staf
    if (role === "staf" || role === "super_admin") {
      groups.push({
        group: "Operasional Staf",
        items: [
          { label: "Dasbor Staf", href: "/staf", icon: Layers },
          { label: "Pendaftaran Siswa", href: "/staf/pendaftaran", icon: ClipboardList },
          { label: "Kelola Kelas", href: "/staf/kelas", icon: Calendar },
          { label: "Data Siswa", href: "/staf/siswa", icon: Users },
        ],
      });
    }

    // Menu Tutor
    if (role === "tutor" || role === "super_admin") {
      groups.push({
        group: "Pengajaran Tutor",
        items: [
          { label: "Dasbor Tutor", href: "/tutor", icon: GraduationCap },
        ],
      });
    }

    // Menu Super Admin
    if (role === "super_admin") {
      groups.push({
        group: "Super Admin",
        items: [
          { label: "Dasbor Pemilik", href: "/admin", icon: Shield },
          { label: "Kelola Pengguna", href: "/admin/pengguna", icon: Users },
          { label: "Program (Admin)", href: "/admin/program", icon: Settings },
          { label: "Laporan Rekap", href: "/admin/laporan", icon: BarChart3 },
        ],
      });
    }

    return groups;
  };

  const menuGroups = getMenuGroups();

  const isActive = (href) => {
    const exactRoutes = ["/beranda", "/staf", "/admin", "/tutor"];

    if (exactRoutes.includes(href)) {
      if (href === "/beranda") {
        return pathname === "/" || pathname === "/beranda";
      }
      return pathname === href;
    }

    return pathname === href || pathname?.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-md text-textMain hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-panel border-r border-gray-200/80 flex flex-col transition-transform duration-200 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-gray-100 bg-white shrink-0">
          <div className="w-9 h-9 rounded-xl bg-juara flex items-center justify-center text-white shadow-sm font-black text-lg">
            LJ
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-textMain leading-tight">
              Langkah Juara
            </span>
            <span className="text-[11px] text-textMuted font-medium">
              Portal Belajar Siswa
            </span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.group}>
              <div className="px-3 mb-1.5 text-[11px] font-bold tracking-wider uppercase text-textMuted/80">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${active
                        ? "bg-juara-50 text-juara border border-juara/20 shadow-xs"
                        : "text-textMuted hover:text-textMain hover:bg-gray-50"
                        }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-juara" : "text-textMuted"
                          }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
