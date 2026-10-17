"use client";

import React, { useState, useEffect } from "react";
import { getPrograms, createProgram, updateProgram } from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import BadgeStatus from "@/components/ui/BadgeStatus";
import {
  Settings,
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function ProgramAdminPage() {
  const [programsList, setProgramsList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // Modal Tambah Program (PRD 4.16)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    jenjang: "SMP",
    jumlahPertemuan: "16",
    harga: "800000",
    aktif: true,
  });

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");
      const progs = await getPrograms();
      setProgramsList(progs);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat program: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      nama: "",
      jenjang: "SMP",
      jumlahPertemuan: "16",
      harga: "800000",
      aktif: true,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleToggleAktif = async (prog) => {
    try {
      const nextAktif = !prog.aktif;
      await updateProgram(prog.id, { aktif: nextAktif });
      setSuccessMsg(`Status keaktifan program "${prog.nama}" berhasil diperbarui!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status program: " + err.message);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.nama.trim()) {
      setModalError("Nama program wajib diisi.");
      return;
    }

    const pertemuan = Number(formData.jumlahPertemuan);
    const harga = Number(formData.harga);

    // Validasi PRD Bab 4.16: jumlah pertemuan dan harga berupa angka lebih dari 0
    if (isNaN(pertemuan) || pertemuan <= 0) {
      setModalError("Jumlah pertemuan harus berupa angka lebih dari 0.");
      return;
    }
    if (isNaN(harga) || harga <= 0) {
      setModalError("Harga program harus berupa angka lebih dari 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createProgram({
        nama: formData.nama.trim(),
        jenjang: formData.jenjang,
        jumlahPertemuan: pertemuan,
        harga,
        aktif: formData.aktif,
      });

      setIsModalOpen(false);
      setSuccessMsg(`Program baru "${formData.nama}" berhasil ditambahkan!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      await loadData();
    } catch (err) {
      console.error(err);
      setModalError("Gagal menambahkan program: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Pengaturan Program Bimbel</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Kelola paket bimbingan belajar, jenjang pendidikan, kuota pertemuan, dan tarif harga
          </p>
        </div>

        <Button onClick={handleOpenModal} className="shrink-0 text-xs font-semibold">
          <Plus className="w-4 h-4 mr-1" />
          <span>Tambah Program</span>
        </Button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Belum Ada Program"
        emptyMessage="Belum ada program bimbingan belajar yang dibuat."
      >
        <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                  <th className="py-3 px-4 font-semibold">Nama Program</th>
                  <th className="py-3 px-4 font-semibold">Jenjang</th>
                  <th className="py-3 px-4 font-semibold">Jumlah Pertemuan</th>
                  <th className="py-3 px-4 font-semibold">Harga Paket</th>
                  <th className="py-3 px-4 font-semibold">Status Aktif</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {programsList.map((prog) => (
                  <tr key={prog.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-textMain">
                      {prog.nama}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-textMain font-semibold border border-gray-200 text-[11px]">
                        {prog.jenjang}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-textMuted font-mono tabular-nums">
                      {prog.jumlahPertemuan} Pertemuan
                    </td>
                    <td className="py-3.5 px-4 font-bold text-juara font-mono tabular-nums">
                      {formatRupiah(prog.harga)}
                    </td>
                    <td className="py-3.5 px-4">
                      <BadgeStatus status={prog.aktif ? "Aktif" : "Ditolak"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleAktif(prog)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border ${prog.aktif
                          ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          }`}
                        title="Program yang dipakai kelas tidak dihapus, cukup dimatikan status aktifnya (PRD 4.16)"
                      >
                        {prog.aktif ? (
                          <>
                            <ToggleRight className="w-3.5 h-3.5" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3.5 h-3.5" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StateHandler>

      {/* Modal Tambah Program Sesuai PRD Bab 4.16 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Program Bimbingan Belajar"
        description="Program baru akan langsung tampil di katalog program siswa untuk pendaftaran."
      >
        <form onSubmit={handleCreateProgram} className="space-y-4">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Nama Program <span className="text-juara">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Intensif UTBK / Matematika SMP"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Jenjang Pendidikan <span className="text-juara">*</span>
              </label>
              <select
                value={formData.jenjang}
                onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara bg-white font-semibold"
                required
              >
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1.5">
                Jumlah Pertemuan <span className="text-juara">*</span>
              </label>
              <input
                type="number"
                min={1}
                placeholder="16"
                value={formData.jumlahPertemuan}
                onChange={(e) =>
                  setFormData({ ...formData, jumlahPertemuan: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara tabular-nums"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Harga Program (Rupiah) <span className="text-juara">*</span>
            </label>
            <input
              type="number"
              min={1}
              step="any"
              placeholder="800000"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara font-mono tabular-nums font-bold"
              required
            />
            <p className="text-[11px] text-textMuted mt-1">
              Contoh: 800000 untuk Rp 800.000.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-textMain">Status Program Langsung Aktif</span>
            <input
              type="checkbox"
              checked={formData.aktif}
              onChange={(e) => setFormData({ ...formData, aktif: e.target.checked })}
              className="w-4 h-4 text-juara focus:ring-juara rounded"
            />
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
              Simpan Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
