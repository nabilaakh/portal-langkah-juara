import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { AuthProvider } from "@/context/AuthContext";
import RouteGuard from "@/components/auth/RouteGuard";

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
      <body className="min-h-screen bg-bgApp font-sans text-textMain antialiased selection:bg-juara/20 selection:text-juara">
        <AuthProvider>
          <RouteGuard>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                  {children}
                </main>
              </div>
            </div>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
