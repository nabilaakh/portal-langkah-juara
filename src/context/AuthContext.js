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
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { getUsers } from "@/lib/firestoreService";

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

  // Helper untuk mengambil profil dari Firestore
  const fetchUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setProfile(null);
      return null;
    }

    try {
      // 1. Coba cari berdasarkan UID dokumen
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setProfile(data);
        return data;
      }

      // 2. Jika tidak ada berdasarkan UID, cari berdasarkan email (cocok dengan akun seed)
      if (firebaseUser.email) {
        const allUsers = await getUsers();
        const matchedUser = allUsers.find(
          (u) => u.email?.toLowerCase() === firebaseUser.email.toLowerCase()
        );

        if (matchedUser) {
          // Sinkronkan UID dokumen jika perlu atau simpan matched user
          setProfile(matchedUser);
          return matchedUser;
        }
      }

      // 3. Jika benar-benar baru (misal Google login pertama kali), buatkan profil siswa
      const newProfileData = {
        nama: firebaseUser.displayName || "Siswa Baru",
        email: firebaseUser.email || "",
        role: "siswa",
        aktif: true,
        noHp: "",
        noHpOrangTua: "",
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newProfileData);
      const createdProfile = { id: firebaseUser.uid, ...newProfileData };
      setProfile(createdProfile);
      return createdProfile;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
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

      // Update displayName di Firebase Auth
      if (nama && nama.trim()) {
        try {
          await updateProfile(newUser, { displayName: nama.trim() });
        } catch (e) {
          console.warn("Could not update auth displayName:", e);
        }
      }

      // Simpan data profil ke koleksi users di Firestore
      const userDocRef = doc(db, "users", newUser.uid);
      const newProfile = {
        nama: nama ? nama.trim() : "Siswa Baru",
        email: newUser.email,
        role: "siswa",
        aktif: true,
        noHp: "",
        noHpOrangTua: "",
        createdAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, newProfile);
      setProfile({ id: newUser.uid, ...newProfile });
      setUser(newUser);

      return { user: newUser, profile: { id: newUser.uid, ...newProfile } };
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
      const userProfile = await fetchUserProfile(loggedInUser);

      if (userProfile && userProfile.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan oleh administrator. Hubungi staf Langkah Juara.");
      }

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
      const userProfile = await fetchUserProfile(googleUser);

      if (userProfile && userProfile.aktif === false) {
        await signOut(auth);
        throw new Error("Akun Anda dinonaktifkan oleh administrator. Hubungi staf Langkah Juara.");
      }

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

  // Muat ulang profil dari Firestore
  const refreshProfile = async () => {
    if (auth.currentUser) {
      return await fetchUserProfile(auth.currentUser);
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
