# Catatan Pengembangan: Mesin Waktu Suasana

## 1. Tujuan Latihan
- Mempraktikkan alur pengembangan berbasis spesifikasi (*Spec-Driven Development*) dalam durasi latihan satu hari dengan bantuan AI.
- Melatih kemampuan merangkum kebutuhan, arsitektur, perilaku antarmuka, batasan integrasi, dan kriteria penerimaan sebelum iterasi kode.
- Menjaga dokumentasi agar menggambarkan aplikasi yang benar-benar ada, termasuk keterbatasan yang belum selesai.

## 2. Target Aplikasi
- **Nama:** Mesin Waktu Suasana (nama paket proyek: `weather`).
- **Tujuan:** Menampilkan cuaca sesuai lokasi dan waktu, menyampaikan suasana melalui tampilan visual, serta menyajikan rekomendasi aktivitas dan kuliner.
- **Pengguna:** Pengunjung yang ingin melihat kondisi cuaca lokal, mencoba skenario cuaca pada waktu lain, dan membaca prakiraan per jam.
- **Hasil yang diharapkan:** SPA responsif yang dapat dijalankan dan dibangun sebagai situs statis, dengan penanganan kegagalan API/lokasi yang jelas.

## 3. Arsitektur dan Teknologi
- Vite dengan HTML, CSS, dan Vanilla JavaScript berbasis ES Modules.
- Tidak ada backend atau autentikasi.
- Cuaca aktual diperoleh dari Open-Meteo; nama lokasi diperoleh melalui reverse geocoding Nominatim/OpenStreetMap.
- Cache cuaca menggunakan `localStorage` dengan masa berlaku 10 menit. Tidak ada data akun atau katalog produk.
- Efek langit dan partikel digambar secara lokal melalui CSS dan Canvas.
- Google Fonts diminta dari layanan eksternal; fallback font sistem tersedia.

## 4. Fitur Proyek Saat Ini
- Meminta lokasi browser, menyediakan Jakarta sebagai fallback, dan menyediakan tombol coba lagi.
- Menampilkan suhu, kondisi cuaca, terasa seperti, kelembapan, kecepatan angin, UV, sapaan, serta prakiraan per jam.
- Mengubah tema langit dan efek atmosfer mengikuti kondisi cuaca.
- Menyediakan rekomendasi aktivitas dan kuliner dengan filter `Semua`, `Aktivitas`, dan `Kuliner`.
- Menyediakan slider waktu, lima preset, dan kontrol `Waktu Nyata` untuk simulasi cuaca.
- Menyediakan playlist suasana otomatis, pilihan mood manual, dan pemutar mini dengan audio sintetis Web Audio API.
- Menyediakan refresh data, cache lokal, dan pembaruan otomatis saat halaman aktif.
- Menggunakan ikon SVG monokrom; antarmuka tidak memakai emoji.

## 5. Risiko Penggunaan AI dan Mitigasi
- **Risiko utama:** AI dapat memperluas lingkup atau mengarang fitur yang tidak tersedia, seperti toko, CRUD produk, login, atau backend.
- **Mitigasi:**
  1. Gunakan `spec.md` untuk batas lingkup dan `tasks.md` untuk status pekerjaan.
  2. Jangan menyebut fitur sebagai selesai bila belum terhubung ke perilaku nyata.
  3. Pertahankan stack Vite dan JavaScript tanpa menambah dependensi UI yang tidak diminta.
  4. Verifikasi interaksi pada browser dan jalankan `npm run build`.
  5. Tinjau keluaran API dan nama lokasi sebelum memasukkannya ke HTML; gunakan rendering teks aman untuk nilai yang tidak dipercaya.

## 6. Batasan dan Catatan
- Cuaca aktual dan geocoding memerlukan koneksi internet serta bergantung pada layanan pihak ketiga.
- Simulasi waktu adalah skenario presentasi yang diturunkan dari suhu aktual terakhir; bukan arsip cuaca atau hasil prakiraan historis.
- Audio playlist dibuat lokal dengan Web Audio API; tidak memakai atau mengunduh MP3 eksternal.
- Markup modal detail tersedia, tetapi alur untuk membuka dan mengisi detail rekomendasi belum diimplementasikan.
- Belum ada suite pengujian otomatis atau konfigurasi deployment khusus.
- Penyelarasan jam prakiraan dengan zona waktu lokasi perlu diverifikasi dan diperbaiki.

## 7. Dokumen Pendamping
- [`spec.md`](./spec.md): kebutuhan, perilaku, integrasi, batasan, dan kriteria penerimaan Mesin Waktu Suasana.
- [`tasks.md`](./tasks.md): milestone, status, kriteria penerimaan, dan berkas yang mungkin berubah.
