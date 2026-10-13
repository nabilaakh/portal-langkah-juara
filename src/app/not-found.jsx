import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgApp px-4">
      <div className="max-w-md w-full bg-panel rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-juara-50 text-juara rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-textMain mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-textMuted text-sm mb-6 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia atau alamat yang dimasukkan keliru.
        </p>
        <Link
          href="/beranda"
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-juara hover:bg-juara-600 text-white font-medium rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
}
