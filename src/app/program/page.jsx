"use client";

import React, { useState, useEffect } from "react";
import {
  getPrograms,
  getPendaftaranBySiswa,
  createPendaftaran,
} from "@/lib/firestoreService";
import StateHandler from "@/components/ui/StateHandler";
import BadgeStatus from "@/components/ui/BadgeStatus";
import Button from "@/components/ui/Button";
import { BookOpen, Calendar, CheckCircle2, AlertCircle, ArrowRight, Tag } from "lucide-react";

export default function ProgramPage() {
  const currentSiswaId = "siswa-raka"; // Default siswa aktif (Raka)

  const [programs, setPrograms] = useState([]);
  const [pendaftaranList, setPendaftaranList] = useState([]);
  const [loadingState, setLoadingState] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingProgramId, setSubmittingProgramId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = async () => {
    try {
      setLoadingState("loading");
      setErrorMessage("");

      const [progs, pends] = await Promise.all([
        getPrograms(true), // hanya program aktif
        getPendaftaranBySiswa(currentSiswaId),
      ]);

      setPrograms(progs);
      setPendaftaranList(pends);
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

  const handleAjukan = async (program) => {
    setActionError("");
    setSuccessMessage("");

    // Validasi PRD Bab 4.3: siswa tidak bisa mengajukan program yang sama bila pendaftarannya masih menunggu atau aktif
    const existing = pendaftaranList.find(
      (p) =>
        p.programId === program.id &&
        (p.status === "menunggu" || p.status === "aktif")
    );

    if (existing) {
      setActionError(
        `Anda sudah memiliki pendaftaran dengan status "${existing.status}" untuk program ${program.nama}.`
      );
      return;
    }

    try {
      setSubmittingProgramId(program.id);
      await createPendaftaran({
        siswaId: currentSiswaId,
        programId: program.id,
      });

      // Pesan resmi sesuai PRD Bab 4.3 butir 2
      setSuccessMessage(
        "Pendaftaran terkirim. Selesaikan pembayaran di kantor Langkah Juara."
      );

      // Muat ulang daftar pendaftaran
      const updatedPends = await getPendaftaranBySiswa(currentSiswaId);
      setPendaftaranList(updatedPends);
    } catch (err) {
      console.error(err);
      setActionError("Gagal mengajukan pendaftaran: " + err.message);
    } finally {
      setSubmittingProgramId(null);
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-textMain">Program Bimbingan Belajar</h2>
        <p className="text-xs text-textMuted mt-0.5">
          Pilih program belajar sesuai jenjang Anda dan ajukan pendaftaran kelas
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      <StateHandler
        state={loadingState}
        errorMessage={errorMessage}
        onRetry={loadData}
      >
        {/* Katalog Kartu Program Aktif (PRD 4.3) */}
        <div>
          <h3 className="text-sm font-bold text-textMain uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-juara" />
            <span>Katalog Program Aktif</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((prog) => {
              const activeReg = pendaftaranList.find(
                (p) =>
                  p.programId === prog.id &&
                  (p.status === "menunggu" || p.status === "aktif")
              );

              return (
                <div
                  key={prog.id}
                  className="bg-panel rounded-2xl border border-gray-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-juara/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-juara font-bold text-[11px] border border-orange-100">
                        {prog.jenjang}
                      </span>
                      <span className="text-[11px] font-semibold text-textMuted flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3.5 h-3.5" />
                        {prog.jumlahPertemuan} Pertemuan
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-textMain group-hover:text-juara transition-colors mb-2">
                      {prog.nama}
                    </h4>

                    <div className="mt-3 py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] text-textMuted block font-medium">Biaya Program</span>
                      <span className="text-lg font-black text-juara tabular-nums">
                        {formatRupiah(prog.harga)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    {activeReg ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-textMuted">Status Pendaftaran:</span>
                        <BadgeStatus status={activeReg.status} />
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleAjukan(prog)}
                        isLoading={submittingProgramId === prog.id}
                        className="w-full text-xs font-semibold"
                      >
                        <span>Ajukan Pendaftaran</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabel Pendaftaran Saya (PRD 4.3) */}
        <div className="bg-panel rounded-2xl border border-gray-200/80 p-6 shadow-xs mt-8">
          <h3 className="text-sm font-bold text-textMain mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-juara" />
            <span>Pendaftaran Saya</span>
          </h3>

          {pendaftaranList.length === 0 ? (
            <p className="text-xs text-textMuted text-center py-6">
              Anda belum pernah mengajukan pendaftaran program.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/60 text-textMuted">
                    <th className="py-2.5 px-3 font-semibold">Program</th>
                    <th className="py-2.5 px-3 font-semibold">Jenjang</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Catatan Staf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendaftaranList.map((pend) => {
                    const prog = programs.find((p) => p.id === pend.programId);
                    return (
                      <tr key={pend.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-3 font-bold text-textMain">
                          {prog ? prog.nama : pend.programId}
                        </td>
                        <td className="py-3 px-3 text-textMuted">
                          {prog?.jenjang || "-"}
                        </td>
                        <td className="py-3 px-3">
                          <BadgeStatus status={pend.status} />
                        </td>
                        <td className="py-3 px-3 text-textMuted">
                          {pend.status === "ditolak" ? (
                            <span className="text-rose-600 font-medium">
                              {pend.catatanStaf || "Tidak ada catatan"}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </StateHandler>
    </div>
  );
}
