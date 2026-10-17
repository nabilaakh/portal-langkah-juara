"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPendaftaran,
  updatePendaftaranStatus,
  getUsers,
  getPrograms,
  formatDate,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  CheckCircle2,
  Calendar,
} from "lucide-react";

function PendaftaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "semua";

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [programsMap, setProgramsMap] = useState({});
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  // State Modal Penolakan (Catatan Staf wajib PRD 4.8)
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedPendaftaran, setSelectedPendaftaran] = useState(null);
  const [catatanStaf, setCatatanStaf] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [pends, allUsers, allPrograms] = await Promise.all([
        getPendaftaran(activeTab === "semua" ? null : activeTab),
        getUsers(),
        getPrograms(),
      ]);

      const uMap = {};
      allUsers.forEach((u) => {
        uMap[u.id] = u.nama || u.email;
      });
      setUsersMap(uMap);

      const pMap = {};
      allPrograms.forEach((p) => {
        pMap[p.id] = p.nama;
      });
      setProgramsMap(pMap);

      setPendaftaranList(pends);
      setLoadingState("success");
    } catch (err) {
      console.error(err);
      setErrorMessage("Gagal memuat pendaftaran: " + err.message);
      setLoadingState("error");
    }
  };

  useEffect(() => {
    const statusFromUrl = searchParams.get("status") || "semua";
    setActiveTab(statusFromUrl);
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleTabChange = (status) => {
    setActiveTab(status);
    // Sinkronisasi status ke URL query param sesuai PRD 4.8
    if (status === "semua") {
      router.push("/staf/pendaftaran");
    } else {
      router.push(`/staf/pendaftaran?status=${status}`);
    }
  };

  const handleSetujui = async (item) => {
    try {
      setIsProcessing(true);
      setActionSuccess("");
      await updatePendaftaranStatus(item.id, {
        status: "aktif",
        catatanStaf: "",
      });

      setActionSuccess(`Pendaftaran siswa "${usersMap[item.siswaId] || item.siswaId}" berhasil disetujui (Aktif)!`);
      await loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui pendaftaran: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (item) => {
    setSelectedPendaftaran(item);
    setCatatanStaf(item.catatanStaf || "");
    setRejectError("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    setRejectError("");

    // Validasi PRD Bab 4.8: Catatan Staf wajib saat menolak
    if (!catatanStaf.trim()) {
      setRejectError("Catatan Staf wajib diisi saat menolak pendaftaran.");
      return;
    }

    try {
      setIsProcessing(true);
      await updatePendaftaranStatus(selectedPendaftaran.id, {
        status: "ditolak",
        catatanStaf: catatanStaf.trim(),
      });

      setRejectModalOpen(false);
      setActionSuccess(`Pendaftaran siswa "${usersMap[selectedPendaftaran.siswaId] || selectedPendaftaran.siswaId}" telah ditolak dengan catatan.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setRejectError("Gagal menolak pendaftaran: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return "-";
    let d = null;
    if (typeof val.toDate === "function") {
      d = val.toDate();
    } else {
      d = new Date(val);
    }
    if (!d || isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const tabs = [
    { key: "semua", label: "Semua" },
    { key: "menunggu", label: "Menunggu" },
    { key: "aktif", label: "Aktif" },
    { key: "ditolak", label: "Ditolak" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textMain">Kelola Pendaftaran Siswa</h2>
          <p className="text-xs text-textMuted mt-0.5">
            Verifikasi pengajuan pendaftaran program bimbingan belajar dan kelola status siswa
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Filter Status Sesuai PRD Bab 4.8 */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <Filter className="w-4 h-4 text-textMuted mr-1 shrink-0" />
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.key
                ? "bg-juara text-white shadow-xs"
                : "bg-white text-textMuted hover:text-textMain hover:bg-gray-100/70 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
        emptyTitle="Tidak Ada Pendaftaran"
        emptyMessage={`Tidak ada pendaftaran dengan status "${activeTab}".`}
      >
        <div className="bg-panel rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70 text-textMuted">
                  <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                  <th className="py-3 px-4 font-semibold">Program</th>
                  <th className="py-3 px-4 font-semibold">Tanggal</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Catatan Staf</th>
                  <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendaftaranList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-textMain">
                      {usersMap[item.siswaId] || item.siswaId}
                    </td>
                    <td className="py-3 px-4 text-textMain font-medium">
                      {programsMap[item.programId] || item.programId}
                    </td>
                    <td className="py-3 px-4 text-textMuted font-mono tabular-nums">
                      {formatDate(item.dibuatPada)}
                    </td>
                    <td className="py-3 px-4">
                      <BadgeStatus status={item.status} />
                    </td>
                    <td className="py-3 px-4 text-textMuted max-w-xs truncate">
                      {item.catatanStaf ? (
                        <span className="text-rose-600 font-medium">
                          {item.catatanStaf}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {item.status !== "aktif" && (
                          <button
                            onClick={() => handleSetujui(item)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200"
                            title="Setujui pendaftaran"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}
                        {item.status !== "ditolak" && (
                          <button
                            onClick={() => openRejectModal(item)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors border border-rose-200"
                            title="Tolak pendaftaran dengan catatan staf"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </StateHandler>

      {/* Modal Tolak Pendaftaran (PRD Bab 4.8: Catatan Staf Wajib) */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Pengajuan Pendaftaran"
        description="Isi catatan staf alasan penolakan (misal: pembayaran belum diterima / jenjang tidak sesuai)."
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          {rejectError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rejectError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-textMain mb-1.5">
              Catatan Staf <span className="text-juara">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Bukti transfer belum valid / Pembayaran belum diselesaikan di kantor"
              value={catatanStaf}
              onChange={(e) => setCatatanStaf(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-juara focus:ring-1 focus:ring-juara/30"
              required
            />
            <p className="text-[11px] text-textMuted mt-1">
              Catatan staf ini akan tampil di bawah status pendaftaran pada akun siswa.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setRejectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              isLoading={isProcessing}
            >
              Tolak Pendaftaran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function PendaftaranStafPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-textMuted">Memuat data pendaftaran...</div>}>
      <PendaftaranContent />
    </Suspense>
  );
}
