"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getKelas,
  createKelas,
  getPrograms,
  getUsers,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Calendar,
  Plus,
  Users,
  Clock,
  MapPin,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function KelolaKelasStafPage() {
  const router = useRouter();

  const [kelasList, setKelasList] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [programsMap, setProgramsMap] = useState({});
  const [tutorsMap, setTutorsMap] = useState({});
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal Buat Kelas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    programId: "",
    tutorId: "",
    hari: "Senin",
    jam: "16.00",
    tempat: "Ruang 1",
  });

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [allKelas, allProgs, allUsers] = await Promise.all([
        getKelas(),
        getPrograms(),
        getUsers(),
      ]);

      const tuts = allUsers.filter((u) => u.role === "tutor" || u.role === "super_admin");
      setTutors(tuts);
      setPrograms(allProgs);

      const pMap = {};
      allProgs.forEach((p) => {
        pMap[p.id] = p.nama;
      });
      setProgramsMap(pMap);

      const tMap = {};
      allUsers.forEach((u) => {
        tMap[u.id] = u.nama;
      });
      setTutorsMap(tMap);

      setKelasList(allKelas);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat kelas: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      nama: "",
      programId: programs[0]?.id || "",
      tutorId: tutors[0]?.id || "",
      hari: "Selasa",
      jam: "16.00",
      tempat: "Ruang 2",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleCreateKelas = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.nama.trim()) {
      setModalError("Nama kelas wajib diisi.");
      return;
    }
    if (!formData.programId) {
      setModalError("Program wajib dipilih.");
      return;
    }
    if (!formData.tutorId) {
      setModalError("Tutor pengajar wajib dipilih.");
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await createKelas({
        nama: formData.nama.trim(),
        programId: formData.programId,
        tutorId: formData.tutorId,
        hari: formData.hari,
        jam: formData.jam,
        tempat: formData.tempat,
        siswaIds: [],
      });

      setIsModalOpen(false);
      // Sesuai PRD Bab 4.9: Rincian kelas terbuka di /staf/kelas/[id]
      router.push(`/staf/kelas/${created.id}`);
    } catch (err) {
      console.error(err);
      setModalError("Gagal membuat kelas: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Kelola Kelas Bimbel</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Daftar kelompok kelas bimbingan belajar, pengajar tutor, dan jadwal tatap muka
          </p>
        </div>
        <Button onClick={handleOpenModal} className="shrink-0 text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1" />
          <span>Buat Kelas</span>
        </Button>
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Belum Ada Kelas"
        emptyMessage="Belum ada kelas yang dibuat oleh staf."
        emptyAction={
          <Button onClick={handleOpenModal} className="text-xs">
            <Plus className="w-4 h-4 mr-1" />
            <span>Buat Kelas Pertama</span>
          </Button>
        }
      >
        <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                  <th className="py-3 px-4 font-semibold">Nama Kelas</th>
                  <th className="py-3 px-4 font-semibold">Program</th>
                  <th className="py-3 px-4 font-semibold">Tutor Pengampu</th>
                  <th className="py-3 px-4 font-semibold">Hari & Jam</th>
                  <th className="py-3 px-4 font-semibold">Tempat</th>
                  <th className="py-3 px-4 font-semibold">Jumlah Siswa</th>
                  <th className="py-3 px-4 font-semibold text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kelasList.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-textMain">
                      {k.nama}
                    </td>
                    <td className="py-3.5 px-4 text-textMain font-medium">
                      {programsMap[k.programId] || k.programId}
                    </td>
                    <td className="py-3.5 px-4 text-textMuted font-medium">
                      {tutorsMap[k.tutorId] || k.tutorId || "Tutor"}
                    </td>
                    <td className="py-3.5 px-4 text-textMuted font-mono tabular-nums">
                      {k.hari || "-"}, {k.jam || "-"} WITA
                    </td>
                    <td className="py-3.5 px-4 text-textMuted">
                      {k.tempat || "-"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-juara tabular-nums">
                      {Array.isArray(k.siswaIds) ? k.siswaIds.length : 0} Siswa
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/staf/kelas/${k.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-juara hover:underline"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StateHandler>

      {/* Modal Buat Kelas Sesuai PRD Bab 4.9 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Kelas Bimbingan Belajar"
        description="Langkah 1: Isi rincian kelompok kelas, pilih program, dan tentukan tutor pengampu."
      >
        <form onSubmit={handleCreateKelas} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Nama Kelas <span className="text-juara">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Intensif UTBK A / Matematika SMP B"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Program Belajar <span className="text-juara">*</span>
              </label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 bg-white"
                required
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama} ({p.jenjang})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Tutor Pengampu <span className="text-juara">*</span>
              </label>
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 bg-white"
                required
              >
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Hari Belajar <span className="text-juara">*</span>
              </label>
              <select
                value={formData.hari}
                onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 bg-white"
              >
                {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Jam / Waktu <span className="text-juara">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 16.00"
                value={formData.jam}
                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30 tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Tempat / Ruang <span className="text-juara">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Ruang 2"
                value={formData.tempat}
                onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan & Buka Rincian
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
