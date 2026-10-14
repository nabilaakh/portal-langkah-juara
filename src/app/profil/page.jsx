"use client";

import React, { useState, useEffect } from "react";
import { getUserById, updateUser, getUsers } from "@/lib/firestoreService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import { User, Phone, Mail, Shield, CheckCircle2, AlertCircle, LogOut } from "lucide-react";

export default function ProfilPage() {
  const { user: authUser, profile: contextProfile, logout, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingState, setLoadingState] = useState("loading"); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    noHp: "",
    noHpOrangTua: "",
  });

  const loadProfile = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      let user = null;
      if (contextProfile) {
        user = contextProfile;
      } else if (authUser?.uid) {
        user = await getUserById(authUser.uid);
      }

      if (!user) {
        // Fallback default user Raka (siswa) atau user pertama dari Firestore
        user = await getUserById("siswa-raka");
        if (!user) {
          const users = await getUsers();
          user = users[0];
        }
      }

      if (user) {
        setProfile(user);
        setFormData({
          nama: user.nama || "",
          noHp: user.noHp || "",
          noHpOrangTua: user.noHpOrangTua || "",
        });
        setLoadingState("success");
      } else {
        setLoadingState("empty");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Gagal memuat profil.");
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const validatePhone = (phone) => {
    if (!phone) return true; // Boleh kosong menurut Bab 7.1
    // Validasi Bab 4.6: hanya angka, 10 sampai 13 digit, diawali 08
    const regex = /^08\d{8,11}$/;
    return regex.test(phone);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSaveSuccess(false);

    if (!formData.nama.trim()) {
      setValidationError("Nama lengkap wajib diisi.");
      return;
    }

    if (formData.noHp && !validatePhone(formData.noHp)) {
      setValidationError("Nomor HP harus berupa angka 10-13 digit dan diawali '08'.");
      return;
    }

    if (formData.noHpOrangTua && !validatePhone(formData.noHpOrangTua)) {
      setValidationError(
        "Nomor HP orang tua harus berupa angka 10-13 digit dan diawali '08'."
      );
      return;
    }

    try {
      setIsSaving(true);
      await updateUser(profile.id, {
        nama: formData.nama.trim(),
        noHp: formData.noHp.trim(),
        ...(profile.role === "siswa" && {
          noHpOrangTua: formData.noHpOrangTua.trim(),
        }),
      });

      setProfile({
        ...profile,
        nama: formData.nama.trim(),
        noHp: formData.noHp.trim(),
        noHpOrangTua: formData.noHpOrangTua.trim(),
      });

      if (refreshProfile) {
        await refreshProfile();
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setValidationError("Gagal menyimpan profil: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-textMain">Profil Pengguna</h2>
        <p className="text-xs text-textMuted mt-0.5">
          Kelola data diri dan kontak akun bimbingan belajar Anda
        </p>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadProfile}
      >
        {profile && (
          <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-sm p-6 sm:p-8">
            {saveSuccess && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Perubahan profil berhasil disimpan ke Firestore!</span>
              </div>
            )}

            {validationError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              {/* Header Info */}
              <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-juara-50 text-juara flex items-center justify-center font-black text-xl">
                  {profile.nama?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-textMain">{profile.nama}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-textMuted font-mono">
                      Peran: <strong className="capitalize">{profile.role || "siswa"}</strong>
                    </span>
                    <BadgeStatus status={profile.aktif ? "Aktif" : "Ditolak"} />
                  </div>
                </div>
              </div>

              {/* Input Nama */}
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1.5">
                  Nama Lengkap <span className="text-juara">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
                  />
                </div>
              </div>

              {/* Email (Read Only PRD 4.6) */}
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1.5">
                  Email Akun (Tidak dapat diubah)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                  <input
                    type="email"
                    value={profile.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-textMuted text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-textMuted mt-1">
                  Sesuai PRD Bab 4.6, email akun tidak dapat diubah dari halaman profil.
                </p>
              </div>

              {/* Nomor HP */}
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1.5">
                  Nomor HP (Pribadi)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tabular-nums focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
                  />
                </div>
                <p className="text-[11px] text-textMuted mt-1">
                  Hanya angka, 10 sampai 13 digit, diawali <strong>08</strong>.
                </p>
              </div>

              {/* Nomor HP Orang Tua (Khusus Siswa PRD 4.6) */}
              {profile.role === "siswa" && (
                <div>
                  <label className="block text-xs font-semibold text-textMain mb-1.5">
                    Nomor HP Orang Tua
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                    <input
                      type="tel"
                      placeholder="Contoh: 081298765432"
                      value={formData.noHpOrangTua}
                      onChange={(e) =>
                        setFormData({ ...formData, noHpOrangTua: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tabular-nums focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
                    />
                  </div>
                  <p className="text-[11px] text-textMuted mt-1">
                    Dipakai staf untuk komunikasi presensi dan kehadiran belajar.
                  </p>
                </div>
              )}

              {/* Peran (Read Only PRD 4.6) */}
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1.5">
                  Peran Pengguna (Role)
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-textMuted absolute left-3 top-3" />
                  <input
                    type="text"
                    value={profile.role?.toUpperCase() || "SISWA"}
                    disabled
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-textMuted text-sm font-semibold cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-textMuted mt-1">
                  Peran hanya dapat diubah oleh Super Admin melalui menu Kelola Pengguna.
                </p>
              </div>

              <div className="pt-3">
                <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </StateHandler>
    </div>
  );
}
