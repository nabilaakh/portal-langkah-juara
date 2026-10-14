"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { UserPlus, ArrowRight, ShieldAlert, Mail, Lock, User } from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle, user } = useAuth();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.nama.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Email wajib diisi dan harus berupa email yang valid.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      setIsLoading(true);
      await registerWithEmail(formData.email, formData.password, formData.nama);
      // Bawa siswa ke /beranda sesuai PRD 4.1
      router.push("/beranda");
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal membuat akun.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      setIsLoading(true);
      await loginWithGoogle();
      router.push("/beranda");
    } catch (err) {
      console.error(err);
      setError(err.message || "Masuk dengan Google gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-juara-50 text-juara rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-textMain">Daftar Akun Siswa</h2>
          <p className="text-xs text-textMuted mt-1">
            Bergabung dengan Portal Belajar Bimbel Langkah Juara
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
            {error}
          </div>
        )}

        {/* Tombol Google Sesuai PRD Bab 4.1 */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-textMain font-medium text-sm transition-all shadow-2xs mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-panel px-3 text-[11px] text-textMuted uppercase tracking-wider font-semibold">
            atau dengan email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Nama Lengkap <span className="text-juara">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-textMuted absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Contoh: Salsa Maharani"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Email <span className="text-juara">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-textMuted absolute left-3 top-3" />
              <input
                type="email"
                placeholder="salsa@siswa.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Kata Sandi <span className="text-juara">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-textMuted absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              />
            </div>
            <p className="text-[11px] text-textMuted mt-1">
              Kata sandi minimal 6 karakter.
            </p>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            <span>Daftar Sekarang</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <p className="text-center text-xs text-textMuted mt-5">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-juara font-semibold hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
