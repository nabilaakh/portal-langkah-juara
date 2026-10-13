import React from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

/**
 * StateHandler sesuai Bab 5.4 PRD:
 * Memuat (loading), Berhasil (success), Kosong (empty), Gagal (error) dengan tombol Coba lagi.
 */
export default function StateHandler({
  state = "success", // 'loading' | 'error' | 'empty' | 'success'
  loadingMessage = "Memuat data...",
  errorMessage = "Terjadi kendala saat memuat data.",
  onRetry,
  emptyTitle = "Belum Ada Data",
  emptyMessage = "Data yang Anda cari saat ini belum tersedia.",
  emptyAction,
  children,
}) {
  if (state === "loading") {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-orange-100/60 flex items-center justify-center text-juara mb-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-sm font-medium text-textMuted">{loadingMessage}</p>
        <div className="mt-6 w-full max-w-md space-y-3">
          <div className="h-4 bg-gray-200/70 rounded-full w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200/50 rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full py-12 px-4 rounded-2xl bg-white border border-rose-100 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-textMain mb-1">Gagal Memuat Data</h3>
        <p className="text-sm text-textMuted max-w-sm mb-5 leading-relaxed">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-juara hover:bg-juara-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba lagi</span>
          </button>
        )}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="w-full py-12 px-4 rounded-2xl bg-white border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-textMuted flex items-center justify-center mb-4 border border-gray-100">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-textMain mb-1">{emptyTitle}</h3>
        <p className="text-sm text-textMuted max-w-sm mb-5 leading-relaxed">{emptyMessage}</p>
        {emptyAction && <div>{emptyAction}</div>}
      </div>
    );
  }

  return <>{children}</>;
}
