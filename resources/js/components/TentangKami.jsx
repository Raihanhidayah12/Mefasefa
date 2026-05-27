import { ShieldCheck, Sparkles, Users, MessageSquare, CalendarDays, Database } from "lucide-react";

export default function TentangKami() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/80 to-indigo-50 relative overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] right-[-80px] h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[-60px] h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 md:px-8 md:py-12">
        <div className="rounded-[32px] border border-white/80 bg-white/90 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(15,23,42,0.28)] overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-10 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Tentang Kami</p>
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">MefaSafe — Solusi Asuransi Kesehatan Digital</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-100/90">
              MefaSafe dikembangkan sebagai proyek tugas akhir yang menggabungkan pengalaman pengguna modern dengan sistem asuransi kesehatan digital lengkap. Platform ini menghadirkan pengelolaan polis, klaim digital, konsultasi dokter, pengingat kesehatan, serta chatbot AI demi layanan yang lebih cepat dan transparan.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-8 md:p-10">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Misi Utama</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">
                Menyederhanakan akses layanan kesehatan dan asuransi melalui aplikasi web yang aman, terintegrasi, dan mudah digunakan oleh seluruh keluarga.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 mb-4">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Apa yang Kami Bangun</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">
                Platform ini dilengkapi dengan dashboard real-time, manajemen polis, klaim otomatis, peta rumah sakit mitra, fitur pengingat kesehatan, dan chatbot Gemini AI untuk bantu pelanggan kapan saja.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 mb-4">
                <Users className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Tim Pengembang</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">
                Dikerjakan oleh Kelompok 4 Kelas T2D, Program Studi D3 Teknologi Informasi Fakultas Vokasi Universitas Brawijaya, angkatan 2025/2026.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.3fr_0.9fr] p-8 md:p-10 border-t border-slate-200/80 bg-white">
            <section className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Tentang Proyek Ini</h2>
                <p className="mt-4 text-slate-600 leading-7">
                  MefaSafe dibuat sebagai proyek akhir yang menitikberatkan pada proses digitalisasi layanan asuransi kesehatan. Dengan dukungan backend Laravel dan frontend React, aplikasi ini dirancang supaya pengguna dapat mengelola polis, mengajukan klaim, melakukan konsultasi, serta mengatur jadwal kesehatan tanpa harus meninggalkan satu platform.
                </p>
                <p className="mt-4 text-slate-600 leading-7">
                  Hasil laporan menyebutkan bahwa sistem ini bertujuan membantu meningkatkan efisiensi administrasi, menjaga keamanan data pengguna, dan mempercepat layanan kesehatan melalui fitur otomatis dan interaktif.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 text-slate-900 font-semibold mb-3">
                    <CalendarDays className="w-5 h-5 text-cyan-600" />
                    Visi & Misi
                  </div>
                  <p className="text-sm text-slate-600 leading-6">
                    Menghadirkan platform asuransi kesehatan yang digital, mudah diakses, dan mampu mendukung pengambilan keputusan kesehatan pengguna keluarga Indonesia.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
                  <div className="flex items-center gap-3 text-slate-900 font-semibold mb-3">
                    <Database className="w-5 h-5 text-blue-600" />
                    Teknologi Utama
                  </div>
                  <p className="text-sm text-slate-600 leading-6">
                    Laravel 13, React 19, Vite 8, Tailwind CSS 4, dan Gemini AI menjadi tulang punggung proyek ini untuk pengalaman yang cepat, responsif, dan modern.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-slate-900">Struktur Tim</h3>
              <div className="mt-6 space-y-4 text-slate-700">
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Anisa Dwi Ariyanti</p>
                  <p className="mt-1 text-sm text-slate-600">Activity Diagram, User Persona, User Flow, Wireframe, Diagram Navigasi</p>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Latisha Syifa Pratiwi</p>
                  <p className="mt-1 text-sm text-slate-600">Identifikasi User, Normalisasi Database, Relasi Tabel, User Journey Map</p>
                </div>
                <div className="rounded-3xl bg-white p-4 border border-slate-200">
                  <p className="text-sm font-semibold text-slate-900">Nasywa Putri Rachmita</p>
                  <p className="mt-1 text-sm text-slate-600">Use Case Diagram, Skenario, Sitemap, Wireframe Low Fidelity</p>
                </div>
              </div>
            </section>
          </div>

          <div className="px-8 py-8 bg-slate-950 text-white">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Kenapa MefaSafe</p>
                <h3 className="mt-3 text-2xl font-bold">Memberikan nilai lebih untuk layanan kesehatan digital.</h3>
              </div>
              <div className="space-y-4">
                <p className="text-sm leading-7 text-slate-300">Integrasi penuh antara manajemen polis, klaim, konsultasi dokter, pengingat kesehatan, dan chatbot AI dalam satu platform.</p>
                <p className="text-sm leading-7 text-slate-300">Fokus pada kenyamanan pengguna, keamanan data, serta transparansi proses asuransi dan kesehatan.</p>
              </div>
              <div className="space-y-4">
                <p className="text-sm leading-7 text-slate-300">Dirancang untuk mendukung skenario tugas akhir dan laporan akademik dengan implementasi penuh feature UAS dan UTS.</p>
                <p className="text-sm leading-7 text-slate-300">Dibangun oleh tim mahasiswa yang menggabungkan keahlian UX, database, frontend, dan backend.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
