"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { LogIn, ArrowRight, Mail, Lock, ShieldAlert } from "lucide-react";

export default function MasukPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper untuk navigasi berdasarkan peran
  const redirectByRole = (role) => {
    if (role === "staf") {
      router.push("/staf");
    } else if (role === "tutor") {
      router.push("/tutor");
    } else if (role === "super_admin") {
      router.push("/admin");
    } else {
      router.push("/beranda");
    }
  };

  // Masuk dengan Email & Kata Sandi Firebase Auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await loginWithEmail(email, password);
      const role = res.profile?.role || "siswa";
      redirectByRole(role);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  // Masuk dengan Google Firebase Auth
  const handleGoogleSignIn = async () => {
    setError("");
    try {
      setIsLoading(true);
      const res = await loginWithGoogle();
      const role = res.profile?.role || "siswa";
      redirectByRole(role);
    } catch (err) {
      console.error(err);
      setError(err.message || "Masuk dengan Google gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-juara text-white flex items-center justify-center font-black text-sm shadow-xs">
              LJ
            </div>
            <span className="font-extrabold text-base tracking-tight text-textMain">
              Langkah Juara
            </span>
          </div>
          <h2 className="text-xl font-bold text-textMain">Masuk ke Portal</h2>
          <p className="text-xs text-textMuted mt-1">
            Portal Belajar Langkah Juara
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-textMuted absolute left-3 top-3" />
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-textMuted absolute left-3 top-3" />
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            <span>Masuk</span>
          </Button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-panel px-3 text-[11px] text-textMuted uppercase tracking-wider font-semibold">
            atau
          </span>
          <div className="border-t border-gray-200 w-full" />
        </div>

        {/* Tombol Masuk dengan Google Sesuai PRD Bab 4.1 */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-textMain font-medium text-sm transition-all shadow-2xs mb-5 cursor-pointer"
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

        <p className="text-center text-xs text-textMuted mt-6 pt-5 border-t border-gray-100">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-juara font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
