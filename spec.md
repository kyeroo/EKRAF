# SPEC.md — Mesin Waktu Suasana

## 1. Tujuan
Mesin Waktu Suasana adalah SPA cuaca berbahasa Indonesia. Aplikasi menampilkan kondisi cuaca berdasarkan lokasi pengguna, memvisualisasikan suasana, memberi rekomendasi kontekstual, dan memungkinkan pengguna membandingkan tampilan melalui skenario waktu.

Dokumen ini menggambarkan lingkup dan perilaku proyek saat ini. Status fitur yang belum selesai dicatat secara eksplisit; spesifikasi tidak menganggap fitur placeholder sebagai fitur aktif.

## 2. Pengguna dan Alur Utama
1. Pengguna membuka aplikasi dan memberikan izin lokasi.
2. Aplikasi mengambil cuaca dan nama lokasi, lalu menampilkan ringkasan serta prakiraan.
3. Jika lokasi tidak dapat diperoleh, aplikasi menggunakan Jakarta. Pengguna juga dapat mencoba lagi atau memilih Jakarta dari tampilan error.
4. Pengguna menyaring rekomendasi, menggeser waktu atau memilih preset, lalu dapat kembali ke waktu nyata.
5. Pengguna dapat memuat ulang cuaca aktual secara manual.

## 3. Fitur dan Perilaku

### 3.1 Lokasi dan cuaca aktual
- Koordinat diperoleh melalui Browser Geolocation API.
- Fallback geolokasi: Jakarta (`-6.2088, 106.8456`).
- Kondisi aktual diminta dari Open-Meteo tanpa API key.
- Data yang ditampilkan:
  - suhu dan kondisi cuaca;
  - terasa seperti;
  - kelembapan;
  - kecepatan angin dalam km/h;
  - UV Index.
- Nama lokasi diminta dari Nominatim reverse geocoding. Jika layanan gagal, nama tetap `Lokasimu`.
- Tombol refresh melewati cache dan meminta cuaca terbaru.

### 3.2 Tema suasana
- Kategori suasana ditentukan dari kode cuaca WMO, jam, dan indikator siang/malam.
- Tema CSS, objek langit, awan, dan partikel Canvas mengikuti kategori suasana.
- Sapaan, kondisi, suhu, metrik, dan rekomendasi dirender ulang ketika waktu simulasi berubah.
- Ikon antarmuka berupa SVG monokrom; tidak menggunakan emoji Unicode.

### 3.3 Rekomendasi dan filter
- Rekomendasi dibuat dari kategori suasana, jam, dan suhu.
- Data rekomendasi memiliki dua kelompok: aktivitas dan kuliner.
- Tab `Semua`, `Aktivitas`, dan `Kuliner` memfilter kartu serta memperbarui keadaan visual/aksesibilitas tab.
- Filter aktif dipertahankan saat slider atau preset mengubah skenario.
- Grid kartu menggunakan kolom responsif dan tinggi kartu yang seragam.

### 3.4 Mesin Waktu
- Slider menerima jam bulat `0–23` dan menampilkan format `HH:00`.
- Skenario cuaca simulasi:

| Jam | Kondisi skenario | Kode WMO simulasi |
| :--- | :--- | :---: |
| 05:00–10:00 | Pagi cerah | 0 |
| 11:00–14:00 | Siang terik | 0 |
| 15:00–18:00 | Gerimis sore | 51 |
| 19:00–22:00 | Malam hujan | 61 |
| 23:00–04:00 | Tengah malam | 0 |

- Preset mengatur jam ke `07:00`, `13:00`, `16:00`, `20:00`, atau `00:00`.
- Angka metrik simulasi bersifat presentasional: suhu/terasa seperti memakai selisih terhadap data aktual terakhir; kelembapan, angin, dan UV memakai nilai skenario di `src/main.js`.
- Skenario tengah malam memakai ikon dan suasana malam. Simulasi tidak mengubah prakiraan API.
- Tombol `Waktu Nyata` mengembalikan jam lokal saat ini dan nilai cuaca aktual terakhir yang tersedia.
- Playlist otomatis ikut berubah saat skenario cuaca/waktu berubah. Saat mood manual aktif, pilihan manual tidak ditimpa perubahan suasana.
- Ketika track sedang berjalan dan playlist otomatis berubah, pemutar berpindah ke track pertama pada playlist baru.

### 3.5 Prakiraan per jam
- Aplikasi merender grafik suhu dan slot informasi cuaca per jam dalam area yang dapat digeser horizontal.
- Target tampilan adalah 24 slot berikutnya dari Open-Meteo.
- Prakiraan tetap berasal dari data API ketika pengguna mengubah waktu simulasi.
- Penyelarasan jam terhadap zona waktu lokasi masih perlu diperiksa (lihat bagian 9).

### 3.6 Cache dan refresh
- Data cuaca disimpan pada `localStorage` dengan kunci `mws_weather_cache_v1` dan TTL 10 menit.
- Data cache kedaluwarsa diabaikan; kegagalan penyimpanan cache dicatat sebagai peringatan.
- Data preferensi memiliki helper `mws_prefs_v1`, tetapi belum dipakai untuk menyimpan keadaan filter atau audio.
- Aplikasi mencoba memuat ulang cache/data berkala setiap 10 menit ketika halaman terlihat.

### 3.7 Playlist Suasana dan pemutar mini
- Widget playlist ditampilkan berdampingan dengan kartu cuaca pada desktop dan tersusun vertikal pada layar lebih kecil.
- Dalam mode `Otomatis`, playlist mengikuti waktu/kategori suasana:

| Skenario | Playlist |
| :--- | :--- |
| Pagi Cerah | Acoustic Morning & Coffee |
| Siang Terik | Upbeat Indie & Focus Beats |
| Gerimis Sore | Lo-Fi Rainy Window |
| Malam Hujan | Midnight Jazz & Soft Piano |
| Tengah Malam | Deep Sleep & Ambient Synth |

- Pengguna dapat memilih mood manual `Fokus`, `Santai`, atau `Semangat`. Pemilihan manual menahan playlist pada mood tersebut hingga pengguna memilih `Otomatis`.
- Setiap playlist otomatis dan manual berisi tiga track dengan judul, artis fiktif, durasi, tempo, dan parameter sintesis lokal.
- Audio dibangkitkan di browser memakai Web Audio API: chord lembut berulang, volume yang dapat diatur, tombol play/pause, previous/next, pemilihan track, dan progress sesuai durasi track.
- Efek noise lembut untuk suasana hujan atau angin dapat diaktif/nonaktifkan melalui tombol `Efek suasana`.
- Tombol Ambient pada header menjadi shortcut play/pause dan mencerminkan status pemutar.
- Audio hanya dimulai setelah aksi play pengguna, mengikuti kebijakan autoplay browser. Jika Web Audio API tidak tersedia/gagal, aplikasi menampilkan toast error.
- Audio tidak memakai MP3 atau link audio eksternal.

## 4. Model Data

### 4.1 Cuaca aktual
`WeatherData` yang dihasilkan `src/api/weather.js`:

| Properti | Tipe | Keterangan |
| :--- | :--- | :--- |
| `current.temp` | number | Suhu dalam °C, dibulatkan |
| `current.feelsLike` | number | Suhu terasa, dibulatkan |
| `current.humidity` | number | Kelembapan relatif (%) |
| `current.windSpeed` | number | Kecepatan angin km/h, dibulatkan |
| `current.wmoCode` | number | Kode kondisi WMO |
| `current.uvIndex` | number | UV Index; fallback `0` bila API tidak memberi nilai |
| `current.isDay` | boolean | Siang atau malam dari API |
| `current.timezone` | string | Zona waktu yang dikembalikan API |
| `hourly` | array | Slot `{ time, temp, precipProb, wmoCode, isNow }` |
| `fetchedAt` | number | Waktu pembuatan data cache dalam milidetik |

### 4.2 Keadaan UI
- Filter rekomendasi: `all`, `activity`, atau `food`; default `all`.
- Waktu simulasi: jam `0–23`; `null` berarti memakai cuaca aktual.
- Preset merupakan pemetaan nama skenario ke jam dan tidak disimpan permanen.

## 5. Arsitektur dan Integrasi
- **Runtime/build:** Vite, HTML5, CSS3, Vanilla JavaScript ES Modules.
- **Cuaca:** `https://api.open-meteo.com/v1/forecast`; meminta kondisi aktual dan variabel per jam dengan zona waktu otomatis serta satuan angin km/h.
- **Nama lokasi:** Nominatim/OpenStreetMap reverse geocoding.
- **Aset:** favicon dan ikon lokal di `public/`; SVG ikon cuaca dan antarmuka dirender dari sumber lokal.
- **Font:** Inter dan Outfit diminta dari Google Fonts; font sistem digunakan sebagai fallback.
- **Tidak ada:** backend aplikasi, autentikasi, database server, atau API key aplikasi.

## 6. Antarmuka dan Responsivitas
- Halaman memuat keadaan loading, error/fallback, hero cuaca, rekomendasi, prakiraan, header, dan dock Mesin Waktu.
- Dock tetap mengambang di bawah layar; kontainer halaman menyediakan ruang bawah agar konten terakhir dapat digulir melewati dock.
- Jam simulasi berada pada baris atas dock bersama label dan tombol reset.
- Tombol Ambient berada di header dan terhubung ke pemutar playlist.
- Breakpoint CSS berada pada `900px`, `768px`, dan `480px` untuk menata widget playlist, dock, dan konten; layout harus tetap dapat digunakan pada ponsel dan desktop.

## 7. Non-Functional Requirements
- Build produksi berhasil dengan `npm run build`.
- Tidak ada framework UI tambahan selain Vite dan JavaScript bawaan browser.
- UI harus mempertahankan perilaku saat jaringan atau geolokasi gagal dengan pesan/fallback yang jelas.
- Tidak ada kredensial rahasia yang dibutuhkan aplikasi.
- Informasi cuaca dan nama lokasi eksternal harus ditampilkan sebagai data, bukan dipercaya sebagai HTML.
- Perubahan UI harus tetap dapat digunakan dengan keyboard dan indikator fokus yang terlihat.
- Belum ada suite test otomatis; kriteria penerimaan di bawah perlu diuji manual sampai test terotomasi tersedia.

## 8. Di Luar Lingkup
- Akun pengguna, login, server/backend, dan database.
- Pemesanan, katalog produk, inventaris, atau dashboard toko.
- Prakiraan historis; simulasi waktu hanya mengganti presentasi berbasis kondisi aktual terakhir.
- Detail rekomendasi interaktif sampai isi modal dan alur buka/tutup diimplementasikan.

## 9. Kesenjangan yang Diketahui
1. **Zona waktu prakiraan:** parser mencari jam dengan awalan `Date.toISOString()` (UTC), sementara API diminta memakai `timezone=auto`. Jam lokal pengguna dapat berbeda dari slot awal. Parser harus disejajarkan dengan zona waktu/format waktu dari API.
2. **Keamanan rendering:** `getGreeting` membentuk HTML dengan nama kota, dan toast membentuk HTML dari pesan. Nilai eksternal/error perlu dirender atau di-escape dengan aman sebelum dimasukkan ke DOM.
3. **Modal rekomendasi:** markup modal tersedia tetapi belum ada pengendali untuk mengisi, membuka, dan menutupnya.
4. **Pengujian/deployment:** belum ada runner test, pipeline CI, atau konfigurasi hosting statis khusus.

## 10. Kriteria Penerimaan
- [x] **AC-1:** Saat data tersedia, halaman menampilkan lokasi, suhu, kondisi cuaca, dan empat metrik cuaca.
- [x] **AC-2:** Filter rekomendasi menampilkan kategori yang dipilih dan mempertahankan pilihan saat skenario waktu berubah.
- [x] **AC-3:** Slider jam dan semua preset memperbarui jam, kondisi, suasana, sapaan, metrik, serta rekomendasi.
- [x] **AC-4:** Tombol `Waktu Nyata` menghapus mode simulasi dan mengembalikan waktu lokal serta data cuaca aktual yang tersedia.
- [x] **AC-5:** Prakiraan API ditampilkan pada grafik horizontal dan tidak berubah hanya karena simulasi waktu.
- [x] **AC-6:** Kegagalan geolokasi memiliki fallback Jakarta; tombol refresh memaksa permintaan cuaca baru.
- [x] **AC-7:** Ikon antarmuka berupa SVG dan tidak ada emoji Unicode di aset antarmuka.
- [x] **AC-8:** `npm run build` selesai tanpa error.
- [x] **AC-9:** Playlist otomatis cocok dengan skenario waktu; mood manual dapat dipilih dan tetap berlaku saat skenario berubah.
- [x] **AC-10:** Play/pause, previous/next, pemilihan track, volume, progress, dan efek suasana berfungsi melalui Web Audio API tanpa MP3 eksternal.
- [ ] **AC-11:** Jam awal prakiraan cocok dengan waktu lokal dari zona waktu lokasi untuk beberapa zona waktu berbeda.
- [ ] **AC-12:** Semua nilai dari API dan error dirender tanpa interpretasi HTML; diuji dengan pemeriksaan keamanan.
- [ ] **AC-13:** Uji otomatis mencakup filter, preset, pemutar audio, cache, dan fallback.
- [ ] **AC-14:** Hasil build dipublikasikan di hosting statis dan diverifikasi pada URL deployment.
