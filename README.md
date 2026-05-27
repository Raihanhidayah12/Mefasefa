<div align="center">

# 🏥 MefaSafe — Platform Asuransi Kesehatan Digital

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Sanctum](https://img.shields.io/badge/Sanctum-Auth-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/docs/sanctum)

**Kelompok 4 · Kelas T2D**  
D3 Teknologi Informasi — Fakultas Vokasi, Universitas Brawijaya  
Tahun Akademik 2025/2026

</div>

---

## 📋 Deskripsi Proyek

**MefaSafe** adalah platform asuransi kesehatan digital berbasis web yang memungkinkan pengguna mengelola polis asuransi, mengajukan klaim, mendaftar ke rumah sakit, berkonsultasi dengan dokter, memantau kesehatan, dan mendapatkan pengingat jadwal kontrol — semuanya dalam satu aplikasi yang modern dan responsif.

Dibangun menggunakan **Laravel 11** sebagai backend REST API dan **React 19** sebagai Single Page Application (SPA) di frontend, dengan desain glassmorphism dan animasi modern.

---

## ✨ Fitur Utama

### 🔐 Autentikasi & Profil
- Registrasi akun baru dengan syarat & ketentuan
- Login dengan token berbasis **Laravel Sanctum**
- Manajemen profil lengkap (foto, KTP, tanda tangan digital)
- Avatar inisial nama otomatis jika foto belum diunggah

### 🏠 Dashboard Utama
- Saldo asuransi real-time dengan toggle visibilitas
- Status polis aktif/tidak aktif + tanggal kadaluarsa
- Statistik: perlindungan, klaim disetujui, member aktif, rating
- Akses cepat ke semua layanan (8 menu utama)
- Notifikasi pengingat dengan badge counter

### 🛡️ Manajemen Asuransi
- Lihat semua polis aktif milik pengguna
- Paket asuransi tersedia (Basic, Standard, Premium, Komprehensif)
- Detail coverage, premi, dan periode perlindungan

### 💰 Klaim Asuransi
- Pengajuan klaim dengan upload dokumen pendukung
- Tracking status klaim (menunggu, diproses, disetujui, ditolak)
- Riwayat klaim lengkap

### 🏨 Daftar & Pendaftaran Rumah Sakit
- Peta interaktif berbasis **Leaflet.js** dengan marker RS mitra
- Filter RS mitra vs umum
- Pendaftaran online dengan pilihan dokter & jadwal
- Barcode otomatis sebagai tiket pendaftaran
- QR Code untuk verifikasi di lokasi

### 👨‍⚕️ Konsultasi Dokter
- Daftar dokter spesialis dari database (avatar inisial nama)
- Pencarian dokter berdasarkan nama / spesialisasi
- Status ketersediaan dokter real-time
- Chat konsultasi dengan sistem pesan
- Riwayat konsultasi + hapus konsultasi

### 📋 Pendaftaran Layanan Kesehatan
- Layanan dinamis dari database (MCU, Lab, Fisioterapi, dll.)
- Pilih jadwal, waktu, dan catatan tambahan
- Nomor antrian dan barcode otomatis

### 📊 Monitor Asuransi
- Grafik statistik polis dan klaim dengan **Recharts**
- Ringkasan penggunaan limit asuransi

### 🗓️ Kalender Pengingat
- Tambah, edit, hapus pengingat jadwal kontrol
- Kategori: kontrol, minum obat, vaksin, dll.
- Pengulangan: harian, mingguan, bulanan
- **Popup notifikasi real-time** di semua halaman
- Badge counter di menu navigasi

### 🤖 MefaBot (AI Chatbot)
- Chatbot berbasis **Google Gemini AI**
- Menjawab pertanyaan seputar kesehatan & asuransi
- Fallback responses jika API tidak tersedia
- Quick reply suggestions

### 📜 Riwayat Lengkap
- Riwayat pendaftaran RS, konsultasi, klaim, dan transaksi
- Filter dan tampilan per kategori

### 🔔 Sistem Notifikasi
- Notifikasi terintegrasi dari semua modul
- Ringkasan notifikasi belum dibaca

### 💬 Feedback & Rating
- Formulir masukan pengguna dengan kategori dan rating bintang

### ℹ️ Halaman Informasi
- **Tentang Kami**: profil MefaSafe, visi misi, tim pengembang
- **Pusat Bantuan**, **FAQ**, **Syarat & Ketentuan**, **Kebijakan Privasi**

---

## 🛠️ Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| **Backend** | Laravel 13, PHP 8.2+, Laravel Sanctum |
| **Frontend** | React 19, React Router DOM v7, Axios |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS (utility-first) |
| **Database** | MySQL 8.0 |
| **Peta** | Leaflet.js + React-Leaflet |
| **Grafik** | Recharts |
| **Icon** | Lucide React |
| **AI** | Google Gemini AI API |
| **Auth** | Laravel Sanctum (SPA token) |

---

## 📁 Struktur Proyek

```
MefaSafe/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php              # Login & Register
│   │   ├── UserController.php              # CRUD user & profil
│   │   ├── HomeDashboardController.php     # Data dashboard utama
│   │   ├── InsurancePolicyController.php   # Manajemen polis
│   │   ├── InsurancePackageController.php  # Paket asuransi
│   │   ├── ClaimController.php             # Pengajuan klaim
│   │   ├── TransactionController.php       # Riwayat transaksi
│   │   ├── HospitalController.php          # Data rumah sakit & dokter
│   │   ├── HospitalRegistrationController.php  # Pendaftaran RS
│   │   ├── DoctorConsultationController.php    # Konsultasi dokter
│   │   ├── HealthServiceController.php     # Layanan kesehatan
│   │   ├── ServiceRegistrationController.php   # Pendaftaran layanan
│   │   ├── MonitorController.php           # Statistik & grafik
│   │   ├── ReminderController.php          # Kalender pengingat
│   │   ├── NotificationController.php      # Sistem notifikasi
│   │   ├── RiwayatController.php           # Riwayat lengkap
│   │   ├── FeedbackController.php          # Feedback pengguna
│   │   └── ChatBotController.php           # MefaBot AI
│   └── Models/
│       ├── User.php, Profile.php
│       ├── InsurancePolicy.php, InsurancePackage.php
│       ├── Claim.php, Transaction.php
│       ├── Hospital.php, Doctor.php
│       ├── HospitalRegistration.php
│       ├── DoctorConsultation.php, ConsultationMessage.php
│       ├── HealthService.php, ServiceRegistration.php
│       ├── Reminder.php, Feedback.php
│
├── resources/js/components/
│   ├── App.jsx                     # Root SPA + routing
│   ├── Dashboard.jsx               # Shell utama + navbar + sidebar
│   ├── Login.jsx, Register.jsx, TermAgreement.jsx
│   ├── Profile.jsx                 # Manajemen profil
│   ├── Asuransi.jsx                # Polis asuransi
│   ├── Klaim.jsx                   # Pengajuan klaim
│   ├── Monitor.jsx                 # Grafik & statistik
│   ├── DaftarRS.jsx                # Peta & daftar RS
│   ├── PendaftaranRS.jsx           # Form pendaftaran RS
│   ├── PendaftaranLayanan.jsx      # Pendaftaran layanan kesehatan
│   ├── Konsultasi.jsx              # Chat dokter
│   ├── Riwayat.jsx                 # Riwayat transaksi
│   ├── KalenderPengingat.jsx       # Kalender & pengingat
│   ├── ReminderPopup.jsx           # Popup notifikasi pengingat
│   ├── Notifikasi.jsx              # Pusat notifikasi
│   ├── ChatBot.jsx                 # MefaBot UI
│   ├── HealthService.jsx           # Health tracking
│   ├── Feedback.jsx                # Formulir masukan
│   ├── TentangKami.jsx             # Profil MefaSafe
│   └── SupportPage.jsx             # Bantuan, FAQ, Kebijakan
│
├── database/
│   ├── migrations/                 # 15+ tabel migrasi
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── HospitalSeeder.php      # 20 rumah sakit
│       ├── DoctorSeeder.php        # Data dokter spesialis
│       └── HealthServiceSeeder.php # Paket layanan kesehatan
│
└── routes/api.php                  # Semua API routes
```

---

## 🗄️ Database Schema

### Tabel Utama

| Tabel | Deskripsi | Kolom Penting |
|-------|-----------|---------------|
| `users` | Data pengguna | `name`, `email`, `password`, `role` |
| `profiles` | Profil lengkap | `full_name`, `birth_info`, `address`, `identity_card_path`, `digital_signature_path`, `profile_picture` |
| `insurance_policies` | Polis asuransi | `policy_number`, `insurance_type`, `premium_amount`, `coverage_limit`, `start_date`, `end_date`, `status` |
| `insurance_packages` | Paket yang tersedia | `name`, `type`, `premium_amount`, `coverage_limit`, `description` |
| `claims` | Pengajuan klaim | `claim_amount`, `description`, `document_path`, `status` |
| `transactions` | Transaksi keuangan | `transaction_type`, `amount`, `transaction_date`, `status` |
| `hospitals` | Data rumah sakit | `name`, `address`, `city`, `latitude`, `longitude`, `is_partner` |
| `doctors` | Data dokter | `hospital_id`, `name`, `specialist`, `availability` |
| `hospital_registrations` | Pendaftaran RS | `hospital_name`, `doctor_name`, `schedule_date`, `queue_number`, `barcode_data` |
| `doctor_consultations` | Konsultasi dokter | `doctor_name`, `specialist_type`, `consultation_type`, `status` |
| `consultation_messages` | Pesan konsultasi | `consultation_id`, `sender`, `message` |
| `health_services` | Layanan kesehatan | `name`, `type`, `description`, `price`, `duration_minutes` |
| `service_registrations` | Pendaftaran layanan | `health_service_id`, `schedule_date`, `schedule_time`, `queue_number`, `barcode_data`, `status` |
| `feedbacks` | Masukan pengguna | `category`, `content`, `rating` |
| `reminders` | Kalender pengingat | `title`, `reminder_date`, `reminder_time`, `category`, `repeat`, `is_done`, `is_notified` |

### Relasi Utama

```
users ──< insurance_policies ──< claims
users ──< transactions
users ──< hospital_registrations >── hospitals
         hospital_registrations >── doctors
users ──< doctor_consultations ──< consultation_messages
users ──< service_registrations >── health_services
users ──< feedbacks
users ──< reminders
users ── profiles
hospitals ──< doctors
```

---

## 🚀 Instalasi & Setup

### Prasyarat

- PHP >= 8.2
- Composer
- Node.js >= 18.x & npm
- MySQL >= 8.0
- Git

### 1. Clone Repository

```bash
git clone https://github.com/Raihanhidayah12/Mefasefa.git
cd Mefasefa
```

### 2. Setup Backend (Laravel)

```bash
# Install dependencies PHP
composer install

# Salin file environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=mefasafe
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrasi + seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
# → http://127.0.0.1:8000
```

### 3. Setup Frontend (React + Vite)

```bash
# Install dependencies JS
npm install

# Jalankan dev server
npm run dev
# → http://localhost:5173

# Atau build untuk production
npm run build
```

### 4. Konfigurasi Gemini AI (Opsional)

Untuk mengaktifkan MefaBot dengan Gemini AI:

```env
# Di file .env
GEMINI_API_KEY=your_api_key_here
```

> Tanpa API key, chatbot tetap berfungsi menggunakan fallback responses bawaan.

---

## 🔌 API Endpoints

### Base URL
```
http://127.0.0.1:8000/api
```

### Autentikasi (Publik)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/register` | Registrasi pengguna baru |
| `POST` | `/login` | Login dan dapatkan token |

### Endpoints Utama (`/api/v1/`) — *Butuh Auth Token*

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/home-dashboard` | Data dashboard utama (saldo, stats, polis) |
| `GET` | `/my-policies` | Polis asuransi milik user |
| `GET` | `/insurance-packages` | Daftar paket asuransi tersedia |
| `GET/POST` | `/claims` | Daftar & ajukan klaim |
| `GET/POST` | `/transactions` | Riwayat & tambah transaksi |
| `GET` | `/hospitals` | Daftar rumah sakit (+ filter mitra) |
| `GET` | `/hospitals/{id}/doctors` | Dokter di RS tertentu |
| `GET/POST` | `/hospital-registrations` | Pendaftaran RS online |
| `GET` | `/doctors` | Semua dokter (untuk konsultasi) |
| `GET/POST` | `/doctor-consultations` | Buat & lihat konsultasi |
| `DELETE` | `/doctor-consultations/{id}` | Hapus konsultasi |
| `GET/POST` | `/doctor-consultations/{id}/messages` | Chat konsultasi |
| `GET` | `/health-services` | Daftar layanan kesehatan |
| `GET/POST` | `/service-registrations` | Pendaftaran layanan kesehatan |
| `GET` | `/monitor` | Data grafik & statistik asuransi |
| `GET` | `/riwayat` | Riwayat lengkap user |
| `GET` | `/notifications` | Semua notifikasi |
| `GET` | `/notifications/summary` | Ringkasan notifikasi belum dibaca |
| `GET/POST` | `/reminders` | Semua & buat pengingat |
| `PUT` | `/reminders/{id}` | Update pengingat |
| `DELETE` | `/reminders/{id}` | Hapus pengingat |
| `GET` | `/reminders/today` | Pengingat hari ini |
| `GET` | `/reminders/upcoming` | Pengingat 7 hari ke depan |
| `GET/POST` | `/feedbacks` | Lihat & kirim feedback |
| `POST` | `/chatbot/chat` | Chat dengan MefaBot |
| `GET` | `/chatbot/quick-replies` | Saran pertanyaan chatbot |
| `GET/PUT` | `/users/{id}` | Profil user & update |


## 📝 Changelog

### v2.1.0 · Penyempurnaan (Mei 2026)
- ✅ **Pendaftaran Layanan Kesehatan** — modul baru (MCU, Lab, Fisioterapi, dll.)
- ✅ **Monitor Asuransi** — grafik statistik dengan Recharts
- ✅ **Avatar Inisial** — foto dokter & profil diganti inisial nama jika null
- ✅ **Modal Portal** — modal konsultasi tampil di atas navbar & footer
- ✅ **20 Data RS** di-seed untuk testing
- ✅ Data layanan kesehatan dinamis dari database

### v2.0.0 · UAS (Mei 2026)
- ✅ Full-stack implementation (Laravel 13 + React 19)
- ✅ Autentikasi dengan Laravel Sanctum
- ✅ Dashboard dengan data real-time
- ✅ Manajemen polis, klaim, dan transaksi
- ✅ Konsultasi dokter (chat)
- ✅ Daftar rumah sakit dengan peta Leaflet
- ✅ Pendaftaran RS online dengan barcode
- ✅ Riwayat transaksi lengkap
- ✅ **Kalender Pengingat** dengan popup notifikasi otomatis
- ✅ Sistem notifikasi terintegrasi
- ✅ MefaBot — chatbot AI berbasis Gemini
- ✅ Health Tracking
- ✅ Feedback & rating sistem
- ✅ Manajemen profil dengan foto dan tanda tangan digital
- ✅ Halaman Tentang Kami & Pusat Bantuan
- ✅ Admin: CRUD user & manajemen konsultasi

### v1.0.0 · UTS (Mei 2026)
- ✅ Database design & normalisasi
- ✅ Use case & activity diagrams
- ✅ UI/UX wireframes & prototype Figma
- ✅ User persona & journey mapping

---

## 📄 License

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">
  <strong>Made with ❤️ by Kelompok 4 · MefaSafe</strong><br>
  <sub>D3 Teknologi Informasi · Universitas Brawijaya · 2025/2026</sub>
</div>
