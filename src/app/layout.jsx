import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Portal Belajar Langkah Juara",
  description: "Aplikasi Pendaftaran, Kelas, dan Tugas Bimbingan Belajar Langkah Juara Makassar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-bgApp font-sans text-textMain selection:bg-juara/20 selection:text-juara">
        {children}
      </body>
    </html>
  );
}
