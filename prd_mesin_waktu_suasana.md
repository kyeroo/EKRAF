# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Nama Produk:** Mesin Waktu Suasana (*Hyper-Local Vibe & Micro-Weather*)  
**Tipe Produk:** Web Application (Responsive Desktop & Mobile)  
**Status:** Perencanaan / MVP Development  

---

## 1. Ringkasan Produk (*Product Overview*)
**Mesin Waktu Suasana** adalah aplikasi web cuaca hiper-lokal berbasis suasana (*mood-based weather & lifestyle*) yang menerjemahkan data meteorologi, waktu lokal, dan kondisi lingkungan menjadi pengalaman visual atmosferik, rekomendasi aktivitas harian, saran kuliner, peringatan lalu lintas, serta kurasi musik otomatis. 

Berbeda dari aplikasi cuaca konvensional yang hanya menampilkan angka suhu dan ikon statis, aplikasi ini membantu pengguna mengambil keputusan harian dengan cepat melalui pendekatan visual dan kontekstual.

---

## 2. Masalah & Solusi (*Problem & Solution*)
* **Masalah:** Pengguna (terutama mahasiswa dan pekerja muda yang aktif beraktivitas di luar ruangan atau WFC) harus membuka banyak aplikasi secara terpisah—cek aplikasi cuaca untuk suhu, buka aplikasi peta untuk cek macet/banjir, buka aplikasi musik untuk mencari lagu yang sesuai suasana, serta tetap bingung menentukan aktivitas atau makanan yang pas untuk kondisi saat itu.
* **Solusi:** Menyediakan satu dasbor terpadu yang menggabungkan prakiraan cuaca *real-time*, simulasi atmosfer visual pada layar, rekomendasi aktivitas & kuliner kontekstual, pemutar *playlist* otomatis, serta pemetaan kondisi jalan dalam satu antarmuka interaktif.

---

## 3. Target Pengguna (*Target Audience*)
* **Mahasiswa & Pelajar:** Membutuhkan informasi cepat mengenai cuaca kampus, tempat nugas yang nyaman, dan kondisi jalan sebelum berangkat kuliah.
* **Pekerja Muda / *Remote Worker* (WFC):** Mencari suasana kerja yang mendukung, rekomendasi kafe/makanan sesuai cuaca, serta latar musik yang relevan.
* **Komuter Harian:** Membutuhkan peringatan dini terkait potensi hujan, kemacetan, dan titik genangan banjir pada jam berangkat maupun pulang.

---

## 4. Ruang Lingkup Fitur & Roadmap Fase (*Feature Breakdown*)

Pengembangan dibagi menjadi **4 Fase** sesuai diagram arsitektur fitur untuk memastikan fitur inti (*MVP*) siap didemonstrasikan terlebih dahulu:

### FASE 1: Core Experience & MVP (Prioritas Utama Demo)
Fokus pada pengalaman visual utama dan nilai guna langsung saat pengguna pertama kali membuka aplikasi.

1. **Layar Suasana Kota (*Ambient Vibe Screen*)**
   * **Animasi Atmosfer:** Latar belakang layar dinamis (kanvas animasi CSS/Canvas/WebGL) yang berubah secara *real-time* mengikuti kondisi cuaca dan waktu lokal (misal: rintik hujan dengan efek embun kaca, langit senja jingga, cerah berawan, atau malam berbintang).
   * **Cuaca Saat Ini:** Menampilkan suhu aktual, suhu terasa (*feels like*), kelembapan, kecepatan angin, dan nama lokasi pengguna secara otomatis via Geolocation API.
   * **Sapaan Suasana:** Teks sapaan kontekstual yang berubah sesuai kombinasi waktu dan cuaca (misal: *"Sore mendung di Depok, pas banget buat ngopi hangat sambil nugas."*).
   * **Mode Simulasi Mesin Waktu *(Fitur Pendukung Demo)*:** *Slider* interaktif untuk mengubah jam dan kondisi cuaca secara manual agar efek visual dan rekomendasi dapat diuji kapan saja.

2. **Saran Aktivitas Harian (*Contextual Recommendations*)**
   * **Rekomendasi Aktivitas:** Daftar saran kegiatan yang relevan dengan cuaca saat ini (misal: *indoor WFC* saat hujan deras, olahraga ringan saat pagi cerah).
   * **Saran Makanan & Minuman:** Rekomendasi kuliner yang cocok dengan suhu dan suasana (misal: minuman hangat/berkuah saat dingin atau hujan, minuman segar saat terik).
   * **Peringatan Jalanan:** Ringkasan status kondisi perjalanan di sekitar lokasi pengguna (aman, rawan macet, atau waspada hujan/genangan).

---

### FASE 2: Utilitas Lanjutan & Pengalaman Audio
Menambah kedalaman data cuaca, navigasi jalan, dan integrasi audio.

3. **Playlist Musik Otomatis (*Mood Audio Player*)**
   * **Playlist Sesuai Suasana:** Kurasi otomatis daftar putar musik (integrasi Spotify Embed API / YouTube Audio / Web Audio API) yang menyesuaikan cuaca dan waktu (misal: *Lo-Fi Rainy* saat hujan, *Upbeat Morning* saat cerah).
   * **Pemutar Mini (*Mini Player*):** Kontrol pemutar musik melayang (*floating bar*) untuk *play/pause*, *next*, dan pengaturan volume tanpa mengganggu tampilan utama.
   * **Pilih Mood Musik:** Opsi manual bagi pengguna untuk mengganti nuansa musik (Fokus, Santai, Semangat, Melankolis).

4. **Peta Kondisi Jalan (*Hyper-Local Traffic & Flood Map*)**
   * **Peta Lalu Lintas:** Peta interaktif yang menampilkan kepadatan lalu lintas di sekitar area pengguna.
   * **Penanda Banjir:** Titik lokasi rawan genangan air atau laporan banjir terkini berbasis data cuaca ekstrem.
   * **Rute Alternatif:** Saran jalur penghindar macet atau genangan air.

5. **Prakiraan & Tren Cuaca (*Forecast & Trends*)**
   * **Prakiraan Per Jam:** Grafik perubahan suhu dan kondisi cuaca dalam 24 jam ke depan.
   * **Prakiraan Beberapa Hari:** Ringkasan cuaca untuk 5–7 hari ke depan.
   * **Peluang Hujan:** Indikator persentase kemungkinan turun hujan per jam untuk membantu perencanaan keberangkatan.

---

### FASE 3: Personalisasi & Manajemen Akun
Memberikan kontrol penuh kepada pengguna untuk menyimpan preferensi pribadi.

6. **Akun & Sinkronisasi (*User Account & Sync*)**
   * **Daftar Akun & Masuk/Keluar:** Autentikasi pengguna (Email/Password atau Google OAuth).
   * **Sinkron Preferensi:** Menyimpan riwayat kota, pengaturan tema animasi, dan preferensi aktivitas lintas perangkat.

7. **Pengaturan Suasana (*Vibe Customization*)**
   * **Kota Favorit:** Menyimpan daftar kota lain untuk memantau suasana di lokasi berbeda dengan cepat.
   * **Intensitas Animasi:** Pengaturan tingkat efek visual (Tinggi, Sedang, Hemat Baterai/Minimalis).
   * **Preferensi Musik & Aktivitas:** Filter kategori aktivitas dan genre musik yang paling disukai pengguna.

---

### FASE 4: Retensi & Peringatan Dini
Menjaga keterlibatan harian pengguna (*daily retention*).

8. **Notifikasi Harian (*Smart Alerts*)**
   * **Pengingat Harian:** Notifikasi ringkasan suasana dan saran aktivitas pagi hari.
   * **Peringatan Cuaca Ekstrem:** Notifikasi *real-time* jika terdeteksi hujan lebat, angin kencang, atau potensi banjir di lokasi pengguna.
   * **Atur Waktu Notifikasi:** Kustomisasi jam pengiriman pengingat sesuai jadwal rutinitas pengguna.

---

## 5. Alur Pengguna Utama (*User Flow*)
1. Pengguna membuka website $\rightarrow$ Browser meminta izin akses lokasi (*Geolocation*).
2. Sistem mengambil data koordinat $\rightarrow$ Memanggil API Cuaca & Waktu Lokal.
3. Layar langsung merender **Animasi Atmosfer** (Fase 1) beserta **Sapaan Suasana** dan suhu terkini.
4. Pengguna melihat kartu **Saran Aktivitas, Makanan/Minuman, dan Peringatan Jalanan** di bawah/samping layar utama.
5. Pengguna menyalakan **Pemutar Mini** untuk mendengarkan *playlist* otomatis atau menggeser **Mode Simulasi** untuk mengeksplorasi suasana waktu lain.

---

## 6. Rekomendasi Arsitektur & *Tech Stack*
* **Frontend:** React.js / Next.js + Tailwind CSS (untuk antarmuka responsif dan *glassmorphism UI*).
* **Animasi Visual:** HTML5 Canvas / Framer Motion / TSParticles (untuk efek hujan, salju, awan, matahari, dan transisi warna langit).
* **Weather API:** OpenWeatherMap API atau WeatherAPI (gratis untuk data suhu, kelembapan, dan prakiraan per jam).
* **Map & Traffic:** Leaflet.js (OpenStreetMap) atau Mapbox GL JS.
* **Audio Integration:** Spotify Web Playback / Embed Widget atau kurasi audio lokal.
* **Backend & Database (Fase 3–4):** Firebase atau Supabase (untuk autentikasi dan penyimpanan kota favorit/preferensi).

---

## 7. Kriteria Keberhasilan (*Success Metrics* untuk Demo/Penilaian)
* **Kecepatan Render Awal:** Halaman utama dan animasi cuaca tampil dalam waktu $< 2$ detik.
* **Akurasi Kontekstual:** Rekomendasi aktivitas, makanan, dan musik berubah secara konsisten saat kondisi cuaca/jam berubah (baik secara *real-time* maupun melalui *slider* simulasi).
* **Kejelasan Informasi:** Pengguna dapat memahami kondisi cuaca dan mendapat ide aktivitas dalam waktu kurang dari 5 detik setelah membuka halaman.