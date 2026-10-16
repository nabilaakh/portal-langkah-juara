"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getUserById, updateUser } from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import StateHandler from "@/components/ui/StateHandler";
import Button from "@/components/ui/Button";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  User,
  Shield,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function DetailPenggunaAdminPage() {
  const params = useParams();
  const userId = params.id;
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("siswa");
  const [isAktif, setIsAktif] = useState(true);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [validationError, setValidationError] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const u = await getUserById(userId);
      if (!u) {
        setLoadingState("error");
        setErrorMessage("Pengguna tidak ditemukan");
        return;
      }

      setUser(u);
      setSelectedRole(u.role || "siswa");
      setIsAktif(u.aktif !== false);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Pengguna tidak ditemukan");
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSaveSuccessMsg("");

    // Validasi PRD Bab 4.15: Super Admin tidak bisa menurunkan peran atau menonaktifkan akunnya sendiri
    const isSelf = user.id === authUser?.uid;
    if (isSelf && (selectedRole !== "super_admin" || !isAktif)) {
      setValidationError(
        "Super Admin tidak bisa menurunkan peran atau menonaktifkan akunnya sendiri."
      );
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(userId, {
        role: selectedRole,
        aktif: isAktif,
      });

      setUser({
        ...user,
        role: selectedRole,
        aktif: isAktif,
      });

      setSaveSuccessMsg("Peran dan status akun pengguna berhasil diperbarui!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setValidationError("Gagal memperbarui pengguna: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const roleOptions = [
    { value: "siswa", label: "Siswa (Akses Kelas Saya & Tugas)" },
    { value: "staf", label: "Staf Administrasi (Kelola Pendaftaran & Kelas)" },
    { value: "tutor", label: "Tutor Pengajar (Buat Pertemuan, Presensi & Nilai)" },
    { value: "super_admin", label: "Super Admin (Pemilik Bimbel - Semua Akses)" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/admin/pengguna"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Kelola Pengguna</span>
      </Link>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage || "Pengguna tidak ditemukan"}
        onRetry={loadData}
      >
        {user && (
          <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                    Pengaturan Pengguna
                  </span>
                  <BadgeStatus status={user.aktif !== false ? "Aktif" : "Ditolak"} />
                </div>
                <h2 className="text-xl font-bold text-textMain">{user.nama}</h2>
                <p className="text-xs text-textMuted font-mono">{user.email}</p>
              </div>
              <span className="text-xs text-textMuted font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                ID: {user.id}
              </span>
            </div>

            {saveSuccessMsg && (
              <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{saveSuccessMsg}</span>
              </div>
            )}

            {validationError && (
              <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6 mt-6">
              {/* Ubah Peran (PRD 4.15) */}
              <div>
                <label className="block text-xs font-semibold text-textMain mb-2">
                  Hak Akses Peran (Role) <span className="text-juara">*</span>
                </label>
                <div className="space-y-2">
                  {roleOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedRole === opt.value
                          ? "bg-orange-50/70 border-juara text-textMain shadow-2xs"
                          : "bg-white border-gray-200 text-textMuted hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={opt.value}
                        checked={selectedRole === opt.value}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="mt-0.5 text-juara focus:ring-juara"
                      />
                      <div className="text-xs">
                        <strong className="text-textMain block font-bold capitalize">
                          {opt.value}
                        </strong>
                        <span className="text-[11px] text-textMuted">{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggle Aktif / Nonaktif Akun (PRD 4.15) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-textMain">Status Keaktifan Akun</h4>
                  <p className="text-[11px] text-textMuted mt-0.5">
                    Bila dimatikan, akun tidak bisa masuk ke portal, tetapi data nilai dan riwayat tetap tersimpan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAktif(!isAktif)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isAktif
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-rose-50 text-rose-700 border border-rose-300"
                  }`}
                >
                  {isAktif ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600" />
                      <span>Akun Aktif</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-rose-600" />
                      <span>Dinonaktifkan</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/admin/pengguna")}
                >
                  Batal
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        )}
      </StateHandler>
    </div>
  );
}
