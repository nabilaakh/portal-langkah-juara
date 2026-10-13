import React from "react";

/**
 * BadgeStatus sesuai Bab 5.2 PRD
 * Menunggu, Dikumpulkan: #F59E0B
 * Aktif, Dinilai: #15A66A
 * Ditolak, Terlambat: #E53935
 * Belum dikumpulkan: #6B7280
 */
export default function BadgeStatus({ status, className = "" }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  let colorClasses = "bg-gray-100 text-[#6B7280] border-gray-200";
  let label = status;

  if (normalized === "menunggu") {
    colorClasses = "bg-amber-50 text-[#F59E0B] border-amber-200/60 font-semibold";
    label = "Menunggu";
  } else if (normalized === "dikumpulkan") {
    colorClasses = "bg-amber-50 text-[#F59E0B] border-amber-200/60 font-semibold";
    label = "Dikumpulkan";
  } else if (normalized === "aktif") {
    colorClasses = "bg-emerald-50 text-[#15A66A] border-emerald-200/60 font-semibold";
    label = "Aktif";
  } else if (normalized === "dinilai") {
    colorClasses = "bg-emerald-50 text-[#15A66A] border-emerald-200/60 font-semibold";
    label = "Dinilai";
  } else if (normalized === "ditolak") {
    colorClasses = "bg-rose-50 text-[#E53935] border-rose-200/60 font-semibold";
    label = "Ditolak";
  } else if (normalized === "terlambat") {
    colorClasses = "bg-rose-50 text-[#E53935] border-rose-200/60 font-semibold";
    label = "Terlambat";
  } else if (normalized === "belum dikumpulkan") {
    colorClasses = "bg-gray-100 text-[#6B7280] border-gray-200 font-medium";
    label = "Belum dikumpulkan";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border tracking-tight ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
