"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getKelasById,
  getUserById,
  getUsers,
  getPrograms,
  getPendaftaran,
  addSiswaToKelas,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export default function RincianKelasStafPage() {
  const params = useParams();
  const kelasId = params.id;

  const [kelas, setKelas] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [program, setProgram] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal Tambah Siswa (PRD 4.9)
  const [isAddSiswaModalOpen, setIsAddSiswaModalOpen] = useState(false);
  const [activeStudentsForProgram, setActiveStudentsForProgram] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isAddingSiswa, setIsAddingSiswa] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState("");
  const [addErrorMsg, setAddErrorMsg] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const k = await getKelasById(kelasId);
      if (!k) {
        setLoadingState("error");
        setErrorMessage("Kelas tidak ditemukan");
        return;
      }
      setKelas(k);

      const [tut, progs, allUsers] = await Promise.all([
        k.tutorId ? getUserById(k.tutorId) : null,
        getPrograms(),
        getUsers(),
      ]);

      setTutor(tut);
      const prg = progs.find((p) => p.id === k.programId);
      setProgram(prg);

      // Siswa terdaftar di kelas
      const enrolled = allUsers.filter((u) =>
        Array.isArray(k.siswaIds) && k.siswaIds.includes(u.id)
      );
      setSiswaList(enrolled);

      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Kelas tidak ditemukan");
      setLoadingState("error");
    }
  };

  useEffect(() => {
    if (kelasId) {
      loadData();
    }
  }, [kelasId]);

  const handleOpenAddSiswa = async () => {
    setAddErrorMsg("");
    setAddSuccessMsg("");
    try {
      // Ambil siswa yang pendaftarannya aktif untuk program kelas ini (PRD 4.9 butir 3)
      const [allPends, allUsers] = await Promise.all([
        getPendaftaran("aktif"),
        getUsers(),
      ]);

      const activePendsForProg = allPends.filter(
        (p) => p.programId === kelas.programId
      );

      // Filter siswa yang belum terdaftar di kelas ini
      const candidates = [];
      activePendsForProg.forEach((p) => {
        const u = allUsers.find((usr) => usr.id === p.siswaId);
        if (u && !kelas.siswaIds?.includes(u.id)) {
          candidates.push(u);
        }
      });

      setActiveStudentsForProgram(candidates);
      setSelectedStudentId(candidates[0]?.id || "");
      setIsAddSiswaModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Gagal memuat kandidat siswa: " + err.message);
    }
  };

  const handleConfirmAddSiswa = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setAddErrorMsg("Silakan pilih siswa yang akan ditambahkan.");
      return;
    }

    try {
      setIsAddingSiswa(true);
      await addSiswaToKelas(kelas.id, selectedStudentId);

      setIsAddSiswaModalOpen(false);
      setAddSuccessMsg("Siswa berhasil ditambahkan ke kelas!");
      await loadData();
    } catch (err) {
      console.error(err);
      setAddErrorMsg("Gagal menambahkan siswa: " + err.message);
    } finally {
      setIsAddingSiswa(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/staf/kelas"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-textMuted hover:text-juara transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Kelas Staf</span>
      </Link>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage || "Kelas tidak ditemukan"}
        onRetry={loadData}
      >
        {kelas && (
          <>
            {/* Header Rincian Kelas Staf */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-xs border border-orange-100">
                      Rincian Kelas (Staf)
                    </span>
                    <BadgeStatus status="Aktif" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-textMain">
                    {kelas.nama}
                  </h2>
                  <p className="text-xs text-textMuted mt-1">
                    Program: <strong className="text-textMain">{program?.nama || kelas.programId}</strong> ({program?.jenjang})
                  </p>
                </div>

                {/* Tombol Tambah Siswa PRD Bab 4.9 */}
                <Button onClick={handleOpenAddSiswa} className="shrink-0 text-xs font-semibold">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  <span>Tambah Siswa</span>
                </Button>
              </div>

              {addSuccessMsg && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{addSuccessMsg}</span>
                </div>
              )}

              {/* Grid Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-xs text-textMuted">
                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Tutor Pengampu</span>
                    <strong className="text-textMain">{tutor?.nama || kelas.tutorId}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Hari Belajar</span>
                    <strong className="text-textMain">{kelas.hari || "-"}</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Jam / Waktu</span>
                    <strong className="text-textMain tabular-nums">{kelas.jam || "-"} WITA</strong>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-juara shrink-0" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-textMuted/80">Tempat / Ruang</span>
                    <strong className="text-textMain">{kelas.tempat || "-"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Daftar Siswa di Kelas Ini */}
            <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-juara" />
                  <h3 className="font-bold text-sm text-textMain">Siswa Terdaftar di Kelas</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-juara border border-orange-100 tabular-nums">
                  {siswaList.length} Siswa
                </span>
              </div>

              {siswaList.length === 0 ? (
                <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-gray-100">
                  <p className="text-xs text-textMuted mb-3">
                    Belum ada siswa yang dimasukkan ke kelas ini.
                  </p>
                  <Button onClick={handleOpenAddSiswa} size="sm">
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    <span>Tambah Siswa Sekarang</span>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                        <th className="py-2.5 px-3 font-semibold">Nama Siswa</th>
                        <th className="py-2.5 px-3 font-semibold">Email</th>
                        <th className="py-2.5 px-3 font-semibold">No. HP Siswa</th>
                        <th className="py-2.5 px-3 font-semibold">No. HP Orang Tua</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {siswaList.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-bold text-textMain">
                            {s.nama}
                          </td>
                          <td className="py-3 px-3 text-textMuted font-mono">
                            {s.email}
                          </td>
                          <td className="py-3 px-3 text-textMuted font-mono tabular-nums">
                            {s.noHp || "-"}
                          </td>
                          <td className="py-3 px-3 text-textMuted font-mono tabular-nums">
                            {s.noHpOrangTua || "-"}
                          </td>
                          <td className="py-3 px-3">
                            <BadgeStatus status="Aktif" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </StateHandler>

      {/* Modal Tambah Siswa (PRD 4.9: Hanya siswa dengan pendaftaran aktif program itu) */}
      <Modal
        isOpen={isAddSiswaModalOpen}
        onClose={() => setIsAddSiswaModalOpen(false)}
        title="Tambah Siswa ke Kelas"
        description={`Pilih siswa dengan pendaftaran aktif pada program "${program?.nama || kelas?.programId}".`}
      >
        <form onSubmit={handleConfirmAddSiswa} className="space-y-4">
          {addErrorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{addErrorMsg}</span>
            </div>
          )}

          {activeStudentsForProgram.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                Tidak ada siswa lain yang memiliki pendaftaran aktif untuk program ini. Pastikan siswa telah disetujui pendaftarannya terlebih dahulu di menu Pendaftaran.
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Pilih Siswa Aktif <span className="text-juara">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 bg-white"
                required
              >
                {activeStudentsForProgram.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    {stu.nama} ({stu.email})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-textMuted mt-1">
                Siswa yang ditambahkan akan langsung melihat kelas ini di halaman Kelas Saya miliknya.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddSiswaModalOpen(false)}
            >
              Batal
            </Button>
            {activeStudentsForProgram.length > 0 && (
              <Button type="submit" isLoading={isAddingSiswa}>
                Tambahkan Siswa
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
