"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  registerWithEmail: async () => {},
  loginWithEmail: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function getFriendlyAuthErrorMessage(error) {
  if (!error) return "Terjadi kesalahan.";
  const code = error.code || error.message || "";

  if (code.includes("auth/user-not-found") || code.includes("auth/wrong-password") || code.includes("auth/invalid-credential")) {
    return "Email atau kata sandi tidak cocok. Silakan periksa kembali.";
  }
  if (code.includes("auth/email-already-in-use")) {
    return "Email ini sudah terdaftar. Silakan masuk menggunakan akun tersebut.";
  }
  if (code.includes("auth/weak-password")) {
    return "Kata sandi terlalu pendek. Gunakan minimal 6 karakter.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Format email tidak valid.";
  }
  if (code.includes("auth/popup-closed-by-user") || code.includes("auth/cancelled-popup-request")) {
    return "Proses masuk dengan Google dibatalkan oleh pengguna.";
  }
  if (code.includes("auth/popup-blocked")) {
    return "Jendela pop-up Google diblokir peramban. Izinkan pop-up untuk melanjutkan.";
  }
  if (code.includes("auth/operation-not-allowed") || code.includes("auth/configuration-not-found")) {
    return "Metode masuk ini belum diaktifkan di Konsol Firebase. Silakan aktifkan penyedia autentikasi di tab Authentication > Sign-in method.";
  }
  if (code.includes("auth/unauthorized-domain")) {
    return "Domain ini belum diotorisasi di Konsol Firebase. Tambahkan domain di Authentication > Settings > Authorized domains.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Terlalu banyak percobaan gagal. Silakan coba kembali beberapa saat lagi.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Koneksi jaringan terputus. Periksa sambungan internet Anda.";
  }

  return error.message || "Gagal melakukan autentikasi.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper untuk memeriksa atau membuat dokumen users/{uid} di Firestore
  // Aturan sesuai instruksi:
  // 1. Cek dokumen users/{uid}.
  // 2. Bila belum ada, buat dokumen users/{uid}.
  // 3. Bila sudah ada, jangan diubah sama sekali.
  // 4. Jangan simpan kata sandi di dokumen ini.
  const ensureUserProfile = async (firebaseUser, initialNama = "") => {
    if (!firebaseUser || !firebaseUser.uid) {
      setProfile(null);
      return null;
    }

    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        // Bila dokumen users/{uid} SUDAH ADA: Jangan diubah! Ambil data apa adanya.
        const existingData = { id: docSnap.id, ...docSnap.data() };
        setProfile(existingData);
        return existingData;
      }

      // Bila dokumen users/{uid} BELUM ADA: Buat dokumen baru tanpa menyimpan kata sandi.
      const fallbackNama =
        initialNama ||
        firebaseUser.displayName ||
        (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Pengguna Baru");

      const newProfileData = {
        nama: fallbackNama,
        email: firebaseUser.email || "",
        role: "siswa",
        aktif: true,
        noHp: "",
        noHpOrangTua: "",
        dibuatPada: serverTimestamp(),
      };

      await setDoc(userDocRef, newProfileData);
      const createdProfile = { id: firebaseUser.uid, ...newProfileData };
      setProfile(createdProfile);
      return createdProfile;
    } catch (err) {
      console.error("Error pada pemeriksaan dokumen users/{uid}:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await ensureUserProfile(currentUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Registrasi dengan Email & Kata Sandi
  const registerWithEmail = async (email, password, nama) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const newUser = userCredential.user;

      if (nama && nama.trim()) {
        try {
          await updateProfile(newUser, { displayName: nama.trim() });
        } catch (e) {
          console.warn("Could not update auth displayName:", e);
        }
      }

      // Cek dan buat dokumen users/{uid} (tanpa kata sandi)
      const userProfile = await ensureUserProfile(newUser, nama);
      setUser(newUser);

      return { user: newUser, profile: userProfile };
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  // Masuk dengan Email & Kata Sandi
  const loginWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const loggedInUser = userCredential.user;

      // Cek dokumen users/{uid}. Bila belum ada buat, bila sudah ada jangan diubah
      const userProfile = await ensureUserProfile(loggedInUser);

      if (userProfile && userProfile.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan oleh administrator. Hubungi staf Langkah Juara.");
      }

      setUser(loggedInUser);
      return { user: loggedInUser, profile: userProfile };
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  // Masuk dengan Akun Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Cek dokumen users/{uid}. Bila belum ada buat, bila sudah ada jangan diubah
      const userProfile = await ensureUserProfile(googleUser);

      if (userProfile && userProfile.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan oleh administrator. Hubungi staf Langkah Juara.");
      }

      setUser(googleUser);
      return { user: googleUser, profile: userProfile };
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  };

  // Keluar dari Akun (Logout)
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Muat ulang profil dari Firestore users/{uid}
  const refreshProfile = async () => {
    if (auth.currentUser) {
      return await ensureUserProfile(auth.currentUser);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
