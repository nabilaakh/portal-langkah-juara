import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/auth/RouteGuard";
import AppLayout from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Portal Belajar Langkah Juara",
  description: "Aplikasi Pendaftaran, Kelas, dan Tugas Bimbingan Belajar Langkah Juara",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen bg-bgApp font-sans text-textMain antialiased selection:bg-juara/20 selection:text-juara">
        <AuthProvider>
          <RouteGuard>
            <AppLayout>{children}</AppLayout>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
