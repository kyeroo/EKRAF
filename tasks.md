# TASKS.md — Mesin Waktu Suasana

Status diperbarui berdasarkan isi proyek saat ini. `[x]` berarti implementasi tersedia dan pemeriksaan build/interaksi dasar telah berhasil; `[ ]` berarti masih perlu dikerjakan. Berkas pada tiap tugas adalah kandidat yang mungkin berubah, bukan daftar perubahan wajib.

## M1 — Scaffold dan fondasi
- [x] **Menyiapkan SPA Vite Vanilla JS**
  - **Kriteria:** `npm run dev` menjalankan aplikasi dan `npm run build` menghasilkan build statis.
  - **Berkas:** `package.json`, `package-lock.json`, `index.html`, `src/main.js`, `src/style.css`, `.gitignore`.
- [x] **Menyusun modul aplikasi**
  - **Kriteria:** API, core suasana, komponen UI, Canvas, dan utilitas dipisahkan ke modul ES.
  - **Berkas:** `src/api/*`, `src/core/*`, `src/components/*`, `src/canvas/*`, `src/utils/*`.

## M2 — Lokasi dan cuaca aktual
- [x] **Mengambil cuaca berdasarkan lokasi**
  - **Kriteria:** Aplikasi meminta lokasi browser, memakai Jakarta jika lokasi gagal, dan menampilkan error/retry bila pengambilan data gagal.
  - **Berkas:** `src/main.js`, `src/api/weather.js`, `src/api/geocoding.js`, `index.html`.
- [x] **Memetakan hasil Open-Meteo ke model aplikasi**
  - **Kriteria:** Data kondisi saat ini dan slot prakiraan dipetakan ke struktur internal dengan satuan angin km/h.
  - **Berkas:** `src/api/weather.js`.

## M3 — Tampilan cuaca dan atmosfer
- [x] **Menampilkan ringkasan cuaca dan metrik**
  - **Kriteria:** Hero menampilkan lokasi, suhu, kondisi, terasa seperti, kelembapan, angin, dan UV beserta visual metrik.
  - **Berkas:** `index.html`, `src/components/currentWeather.js`, `src/style.css`.
- [x] **Menerapkan tema suasana dan ikon tanpa emoji**
  - **Kriteria:** Tema langit/partikel berubah mengikuti kategori cuaca dan ikon antarmuka berupa SVG monokrom.
  - **Berkas:** `src/core/vibeEngine.js`, `src/canvas/atmosphere.js`, `src/utils/icons.js`, `src/style.css`, `index.html`.

## M4 — Rekomendasi dan filter
- [x] **Menampilkan rekomendasi kontekstual**
  - **Kriteria:** Rekomendasi aktivitas dan kuliner berubah mengikuti suasana, jam, serta suhu.
  - **Berkas:** `src/core/vibeEngine.js`, `src/components/recommendations.js`.
- [x] **Mengaktifkan tab filter rekomendasi**
  - **Kriteria:** `Semua`, `Aktivitas`, dan `Kuliner` menampilkan kategori yang tepat; filter aktif bertahan saat waktu simulasi berubah.
  - **Berkas:** `index.html`, `src/main.js`, `src/components/recommendations.js`, `src/style.css`.

## M5 — Mesin Waktu
- [x] **Menghubungkan slider dan preset**
  - **Kriteria:** Slider memperbarui jam `00:00–23:00`; preset mengatur jam `07:00`, `13:00`, `16:00`, `20:00`, dan `00:00`; preset aktif ditandai.
  - **Berkas:** `index.html`, `src/main.js`, `src/style.css`.
- [x] **Menerapkan skenario dan tombol Waktu Nyata**
  - **Kriteria:** Rentang jam mengubah tampilan cuaca, tema, sapaan, metrik, dan rekomendasi. Reset mengembalikan jam lokal serta cuaca aktual terakhir yang tersedia.
  - **Berkas:** `src/main.js`, `src/core/vibeEngine.js`, `src/components/currentWeather.js`, `src/components/recommendations.js`.
- [x] **Menambahkan playlist otomatis dan pilihan mood**
  - **Kriteria:** Lima skenario memilih playlist yang ditentukan; mood `Otomatis`, `Fokus`, `Santai`, dan `Semangat` mengganti playlist secara konsisten.
  - **Berkas:** `index.html`, `src/main.js`, `src/components/playlistPlayer.js`, `src/style.css`.
- [x] **Membuat pemutar synthesizer Web Audio**
  - **Kriteria:** Tiap playlist berisi tiga track fiktif; play/pause, previous/next, pemilihan track, volume, progress, efek cuaca on/off, dan shortcut Ambient berfungsi tanpa file audio eksternal.
  - **Berkas:** `src/audio/synthPlayer.js`, `src/components/playlistPlayer.js`, `src/utils/icons.js`, `index.html`, `src/style.css`.

## M6 — Prakiraan 24 jam
- [x] **Merender grafik suhu dan slot cuaca**
  - **Kriteria:** Komponen menggunakan elemen `spline-svg` dan `spline-slots` yang ada, menampilkan jam, suhu, ikon, dan peluang hujan, serta dapat digeser horizontal.
  - **Berkas:** `index.html`, `src/components/hourlyChart.js`, `src/style.css`.
- [ ] **Menyelaraskan waktu prakiraan dengan zona waktu lokasi**
  - **Kriteria:** Slot `isNow` dan 24 jam berikutnya dimulai pada jam lokal yang sesuai dengan respons API pada zona waktu berbeda, bukan hasil pencocokan awalan UTC.
  - **Berkas:** `src/api/weather.js`, `src/utils/formatters.js`, `src/components/hourlyChart.js`.

## M7 — Cache dan pemuatan ulang
- [x] **Menggunakan cache cuaca lokal**
  - **Kriteria:** Cache `mws_weather_cache_v1` kedaluwarsa setelah 10 menit; kegagalan baca/tulis tidak merusak render utama.
  - **Berkas:** `src/utils/storage.js`, `src/main.js`.
- [x] **Menyediakan refresh dan auto-refresh**
  - **Kriteria:** Tombol refresh meminta data baru dan aplikasi memeriksa pembaruan berkala saat halaman terlihat.
  - **Berkas:** `src/main.js`, `index.html`.
- [ ] **Menentukan dan menerapkan preferensi persisten yang benar-benar diperlukan**
  - **Kriteria:** Preferensi yang disepakati (misalnya filter) disimpan dan dipulihkan; jangan menyimpan nilai yang tidak dimaksudkan sebagai preferensi pengguna.
  - **Berkas:** `src/utils/storage.js`, `src/main.js`.

## M8 — Pengujian, keamanan, dan aksesibilitas
- [x] **Memeriksa interaksi browser dan layout dasar**
  - **Kriteria:** Filter, preset, rentang slider, reset, playlist otomatis/manual, status playback dan progress, serta layout mobile/desktop telah diperiksa manual.
  - **Berkas:** Tidak ada berkas test otomatis saat ini; temuan dicatat pada dokumen proyek.
- [ ] **Menambahkan pengujian otomatis terarah**
  - **Kriteria:** Uji filter, pemetaan rentang jam, preset, reset, pembentukan skenario, cache TTL, dan fallback; dapat dijalankan melalui script package.
  - **Berkas:** `package.json`, `src/core/vibeEngine.js`, `src/utils/storage.js`, `src/main.js`, berkas test baru.
- [ ] **Mengamankan rendering teks eksternal**
  - **Kriteria:** Nama lokasi dan pesan error tidak ditafsirkan sebagai HTML; gunakan `textContent`/DOM API atau escaping yang sesuai, lalu uji dengan nilai khusus.
  - **Berkas:** `src/core/vibeEngine.js`, `src/components/greetingBar.js`, `src/utils/dom.js`, `src/main.js`.
- [ ] **Melengkapi modal detail rekomendasi atau menghapus affordance yang tidak aktif**
  - **Kriteria:** Jika kartu dapat diklik, modal menampilkan detail dan dapat ditutup dengan tombol, backdrop, serta keyboard; jika tidak, kartu tidak tampak interaktif.
  - **Berkas:** `index.html`, `src/components/recommendations.js`, `src/main.js`, `src/style.css`.
- [ ] **Memeriksa aksesibilitas dan responsivitas secara sistematis**
  - **Kriteria:** Semua kontrol bisa dipakai dengan keyboard, status aktif terbaca teknologi bantu, dan layout tidak overflow pada lebar 360px hingga desktop.
  - **Berkas:** `index.html`, `src/style.css`, `src/main.js`.

## M9 — Build dan deployment
- [x] **Menjalankan build produksi**
  - **Kriteria:** `npm run build` selesai tanpa error.
  - **Berkas:** `package.json`, sumber aplikasi.
- [ ] **Menyiapkan dan memverifikasi deployment statis**
  - **Kriteria:** Folder `dist/` dapat disajikan dari hosting statis yang dipilih; routing/aset, izin lokasi, koneksi API, dan tampilan produksi telah diverifikasi.
  - **Berkas:** konfigurasi hosting yang dipilih, `package.json`, `index.html`; jangan menambah konfigurasi vendor sebelum target hosting ditentukan.
