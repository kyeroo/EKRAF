/**
 * vibeEngine.js — Core mood/vibe mapping logic
 * Maps WMO weather codes + time-of-day → vibe category, greetings,
 * weather icons, and contextual recommendations.
 *
 * WMO Weather Codes: https://open-meteo.com/en/docs#weathervariables
 */

/* ---------------------------------------------------------
   1. WMO Code → Vibe Category
   --------------------------------------------------------- */

/**
 * @typedef {'clear-day'|'clear-night'|'dawn'|'dusk'|'cloudy'|'foggy'|'drizzle'|'rainy'|'stormy'} VibeCategory
 */

/**
 * Map WMO code and hour-of-day to a vibe category.
 * @param {number} wmoCode
 * @param {number} hour  — 0-23
 * @param {boolean} isDay — from API
 * @returns {VibeCategory}
 */
export function getVibeCategory(wmoCode, hour, isDay) {
  // Time ranges
  const isDawn = hour >= 5 && hour < 7;
  const isDusk = hour >= 17 && hour < 20;
  const isNight = !isDay;

  // Thunderstorm
  if (wmoCode >= 95) return 'stormy';

  // Heavy rain / showers
  if (wmoCode >= 80 || (wmoCode >= 61 && wmoCode <= 67)) return 'rainy';

  // Drizzle / light rain
  if (wmoCode >= 51 && wmoCode <= 57) return 'drizzle';

  // Snow
  if (wmoCode >= 71 && wmoCode <= 77) return 'rainy'; // Indonesia doesn't snow, map to rainy

  // Fog
  if (wmoCode === 45 || wmoCode === 48) return 'foggy';

  // Cloudy
  if (wmoCode >= 2 && wmoCode <= 3) return 'cloudy';
  if (wmoCode === 1) return isNight ? 'clear-night' : 'cloudy';

  // Clear sky — time-sensitive
  if (wmoCode === 0) {
    if (isDawn) return 'dawn';
    if (isDusk) return 'dusk';
    if (isNight) return 'clear-night';
    return 'clear-day';
  }

  // Default fallback
  return isNight ? 'clear-night' : 'cloudy';
}

/* ---------------------------------------------------------
   2. WMO Code → Weather Icon
   --------------------------------------------------------- */

const WMO_ICONS = {
  0:  { icon: 'sun', label: 'Cerah' },
  1:  { icon: 'cloud', label: 'Sebagian Berawan' },
  2:  { icon: 'cloud', label: 'Berawan' },
  3:  { icon: 'cloud', label: 'Mendung' },
  45: { icon: 'fog', label: 'Berkabut' },
  48: { icon: 'fog', label: 'Embun Beku' },
  51: { icon: 'rain', label: 'Gerimis Tipis' },
  53: { icon: 'rain', label: 'Gerimis' },
  55: { icon: 'rain', label: 'Gerimis Lebat' },
  61: { icon: 'rain', label: 'Hujan Ringan' },
  63: { icon: 'rain', label: 'Hujan Sedang' },
  65: { icon: 'rain', label: 'Hujan Lebat' },
  71: { icon: 'snow', label: 'Salju Ringan' },
  73: { icon: 'snow', label: 'Salju Sedang' },
  75: { icon: 'snow', label: 'Salju Lebat' },
  77: { icon: 'snow', label: 'Butiran Es' },
  80: { icon: 'rain', label: 'Hujan Lokal Ringan' },
  81: { icon: 'rain', label: 'Hujan Lokal Sedang' },
  82: { icon: 'storm', label: 'Hujan Lokal Lebat' },
  85: { icon: 'snow', label: 'Hujan Salju Ringan' },
  86: { icon: 'snow', label: 'Hujan Salju Lebat' },
  95: { icon: 'storm', label: 'Badai Petir' },
  96: { icon: 'storm', label: 'Badai + Hujan Es' },
  99: { icon: 'storm', label: 'Badai Besar' },
};

/**
 * Get weather icon key and label for a WMO code.
 * @param {number} wmoCode
 * @param {boolean} isDay
 * @returns {{ icon: string, label: string }}
 */
export function getWeatherIcon(wmoCode, isDay) {
  if (wmoCode === 0 && !isDay) return { icon: 'moon', label: 'Cerah Malam' };

  // Find exact or round down to nearest key
  const keys = Object.keys(WMO_ICONS).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (wmoCode >= k) return WMO_ICONS[k];
  }
  return { icon: 'thermometer', label: 'Tidak Diketahui' };
}

/* ---------------------------------------------------------
   3. Contextual Greeting Texts
   --------------------------------------------------------- */

/**
 * Returns a contextual greeting string based on vibe, city, and hour.
 * @param {VibeCategory} vibe
 * @param {string} cityName
 * @param {number} hour
 * @param {number} temp
 * @returns {string} HTML string with <strong> for emphasis
 */
export function getGreeting(vibe, cityName, hour, temp) {
  const city = `<strong>${cityName}</strong>`;
  const timeLabel = getTimeLabel(hour);

  const greetings = {
    'clear-day': [
      `${timeLabel} yang cerah di ${city}! Langit biru terbentang, cocok banget buat keluar rumah dan eksplorasi. `,
      `Matahari bersinar terang di ${city}. Semangat ya, hari ini cuacanya mendukung banget buat aktivitas luar ruangan! `,
      `${city} lagi cerah banget! Ini saatnya jemur semangat dan produktivitas bareng matahari. `,
    ],
    'clear-night': [
      `Malam yang tenang di ${city}. Bintang-bintang menemani langkahmu, sempurna buat refleksi diri atau nongkrong santai. `,
      `Langit malam di ${city} jernih banget. Pas banget buat rebahan di luar sambil nikmatin angin malam. `,
      `Malam cerah di ${city}. Kalau lagi galau, coba lihat ke atas — langit malem ini indah banget. `,
    ],
    'dawn': [
      `Pagi buta di ${city}, fajar baru mulai menyingsing. Kamu yang paling duluan mulai hari ini — keren! `,
      `Sunrise di ${city} lagi indah-indahnya. Nikmatin kopi hangat sambil lihat matahari terbit, deh. `,
    ],
    'dusk': [
      `Sore menjelang petang di ${city}. Golden hour lagi cantik banget, waktu terbaik buat foto atau sekadar merenung. `,
      `Langit senja di ${city} warnanya kece parah. Yuk, tutup hari dengan hal-hal yang bikin happy! `,
    ],
    'cloudy': [
      `Langit mendung di ${city}, tapi jangan ikut-ikutan mendung juga ya. Cocok banget buat fokus kerja di kafe! `,
      `${city} lagi berawan, suasananya adem dan nyaman. Waktu yang pas buat nugas atau baca buku. `,
      `Awan tebal menggantung di ${city}. Suhu ${temp}°C — enggak terlalu panas, cocok buat jalan-jalan ringan. `,
    ],
    'foggy': [
      `${city} lagi berkabut, suasananya mistis banget! Kalau mau kemana-mana, hati-hati dan pelankan laju kendaraan. `,
      `Pagi berkabut di ${city} bikin suasana jadi adem dan misterius. Waktu terbaik buat nikmatin sarapan hangat! `,
    ],
    'drizzle': [
      `Gerimis tipis-tipis di ${city}. Suhu ${temp}°C, adem banget — tapi jangan lupa bawa payung kecil-kecilan! `,
      `${city} lagi gerimis, pas banget buat nongkrong di dalam sambil dengerin suara tetes hujan. `,
    ],
    'rainy': [
      `Hujan lagi mengguyur ${city}. Suhu ${temp}°C, dingin dan nyaman — ini saatnya WFC dan makan sesuatu yang hangat! `,
      `${city} lagi ujan deres. Mending stay inside, bikin minuman hangat, dan chill sambil produktif. `,
      `Hujan di ${city} ngingetin kita buat slow down. Ambil napas, nikmatin suasana, dan fokus ke hal-hal penting. `,
    ],
    'stormy': [
      `Badai lagi mengintai ${city}! Tetap di dalam, hindari pohon besar dan bangunan tinggi. Keselamatan nomor satu! `,
      `Cuaca ekstrem di ${city} hari ini. Tunda dulu rencana keluar, pantau update BMKG, dan pastikan HP kamu terisi penuh. `,
    ],
  };

  const pool = greetings[vibe] || greetings['cloudy'];
  // Deterministic pick based on hour to avoid flickering
  return pool[hour % pool.length];
}

/**
 * Returns a time-of-day label in Indonesian.
 * @param {number} hour
 * @returns {string}
 */
function getTimeLabel(hour) {
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

/* ---------------------------------------------------------
   4. Contextual Recommendations
   --------------------------------------------------------- */

/**
 * Returns recommended activities and foods based on vibe + hour.
 * @param {VibeCategory} vibe
 * @param {number} hour
 * @param {number} temp
 * @returns {{ activities: Recommendation[], foods: Recommendation[] }}
 *
 * @typedef {{ title: string, desc: string }} Recommendation
 */
export function getRecommendations(vibe, hour, temp) {
  const isMorning = hour >= 5 && hour < 11;
  const isAfternoon = hour >= 11 && hour < 15;
  const isEvening = hour >= 15 && hour < 20;
  const isNight = hour >= 20 || hour < 5;

  const recs = {
    'clear-day': {
      activities: isMorning
        ? [
            { title: 'Jogging Pagi', desc: 'Suhu ideal untuk lari ringan. Targetkan 30 menit biar tubuh lebih segar sepanjang hari.' },
            { title: 'Yoga Outdoor', desc: 'Nikmatin matahari pagi sambil peregangan. Vibes-nya unmatched!' },
            { title: 'Gowes Santai', desc: 'Langit cerah = waktu terbaik buat bersepeda keliling lingkungan.' },
          ]
        : isAfternoon
        ? [
            { title: 'Street Photography', desc: 'Cahaya siang hari menghasilkan foto yang tajam dan vivid. Eksplorasi sudut-sudut kota!' },
            { title: 'Renang', desc: 'Cuaca terik? Langsung aja nyemplung ke kolam renang.' },
            { title: 'Kafe Outdoor', desc: 'Cari kafe yang ada teras-nya, nikmatin kopi sambil angin-anginan.' },
          ]
        : [
            { title: 'Jalan Sore', desc: 'Suhu udah mulai turun, enak banget buat jalan-jalan sambil nikmatin golden hour.' },
            { title: 'Olahraga Ringan', desc: 'Main badminton atau futsal bareng teman — cuaca mendukung banget!' },
            { title: 'Foto Golden Hour', desc: 'Langit biru cerah sore hari = backdrop foto yang epic.' },
          ],
      foods: isMorning
        ? [
            { title: 'Bubur Ayam', desc: 'Sarapan hangat yang mengenyangkan dan cocok buat memulai hari aktif.' },
            { title: 'Smoothie Bowl', desc: 'Segar, bergizi, dan instagramable — cocok banget buat pagi yang cerah.' },
            { title: 'Toast & Telur', desc: 'Simple tapi nourishing. Tambah alpukat biar makin sehat!' },
          ]
        : [
            { title: 'Salad Segar', desc: 'Cuaca cerah minta makanan yang light dan segar. Tambahkan protein untuk tetap bertenaga.' },
            { title: 'Es Kelapa Muda', desc: 'Alami, segar, dan sempurna untuk menghidrasi di hari yang cerah.' },
            { title: 'Jus Buah Segar', desc: 'Vitamin C untuk menjaga stamina di cuaca yang terik.' },
          ],
    },

    'clear-night': {
      activities: [
        { title: 'Stargazing', desc: 'Malam cerah tanpa awan = langit penuh bintang. Cari spot yang minim polusi cahaya.' },
        { title: 'Bakar-bakar', desc: 'BBQ atau sate-satean di halaman bersama keluarga — cuaca malam yang sempurna.' },
        { title: 'Baca di Teras', desc: 'Angin malam sejuk, suasana tenang — waktu terbaik buat baca buku sambil santai.' },
      ],
      foods: [
        { title: 'Sate', desc: 'Malam cerah cocok banget buat bakar sate di luar. Jangan lupa bumbu kacangnya!' },
        { title: 'Teh Susu Hangat', desc: 'Malam yang tenang dan teh hangat — kombinasi sempurna untuk relaksasi.' },
        { title: 'Jagung Bakar', desc: 'Klasik dan enak! Cocok buat ngemil malam sambil nongkrong.' },
      ],
    },

    'dawn': {
      activities: [
        { title: 'Sunrise Watching', desc: 'Fajar hanya ada sekali sehari. Nikmatin momen magis ini dari titik tinggi di kotamu.' },
        { title: 'Meditasi Pagi', desc: 'Keheningan subuh adalah waktu terbaik untuk hening dan fokus pada diri sendiri.' },
        { title: 'Lari Subuh', desc: 'Udara paling segar dan jalanan masih sepi — waktu terbaik untuk lari!' },
      ],
      foods: [
        { title: 'Kopi Hitam', desc: 'Seteguk kopi hitam di pagi subuh — ritual sempurna untuk menyambut hari.' },
        { title: 'Teh Jahe Hangat', desc: 'Menghangatkan tubuh dan meningkatkan imunitas untuk menghadapi hari yang penuh.' },
        { title: 'Roti Bakar Sederhana', desc: 'Sarapan ringan dan cepat sebelum aktivitas subuh dimulai.' },
      ],
    },

    'dusk': {
      activities: [
        { title: 'Golden Hour Photo', desc: 'Cahaya senja yang keemasan adalah yang terbaik untuk fotografi. Jangan sampai kelewat!' },
        { title: 'Evening Walk', desc: 'Jalan-jalan sore sambil nikmatin langit yang berwarna-warni — healing banget.' },
        { title: 'Nongkrong Santai', desc: 'Waktu terbaik untuk quality time bersama teman atau keluarga di luar.' },
      ],
      foods: [
        { title: 'Street Food', desc: 'Waktu makan sore yang pas — coba warung atau kaki lima favorit di dekatmu.' },
        { title: 'Minuman Segar', desc: 'Suhu mulai turun, tapi masih enak minum es. Coba thai tea atau boba!' },
        { title: 'Mi Goreng', desc: 'Klasik dan mengenyangkan. Cocok banget buat ngisi energi setelah seharian beraktivitas.' },
      ],
    },

    'cloudy': {
      activities: [
        { title: 'WFC di Kafe', desc: 'Suasana mendung = suasana fokus. Cari kafe yang enak dan produktif dari sana!' },
        { title: 'Baca Buku', desc: 'Cahaya lembut dari langit mendung bikin mata nyaman buat baca berlama-lama.' },
        { title: 'Eksplorasi Kreatif', desc: 'Mood mendung sering memunculkan ide-ide artistik yang unik. Coba nulis atau menggambar!' },
      ],
      foods: [
        { title: 'Kopi Susu Hangat', desc: 'Satu cangkir kopi susu hangat di hari yang mendung — simple pleasures terbaik.' },
        { title: 'Pasta Creamy', desc: 'Comfort food yang pas untuk suasana yang sedikit suram tapi menyenangkan.' },
        { title: 'Pastry & Roti', desc: 'Ngemil croissant atau roti sourdough fresh — teman ideal hari mendung.' },
      ],
    },

    'foggy': {
      activities: [
        { title: 'Meditasi Indoor', desc: 'Kabut di luar, tenang di dalam. Waktu terbaik untuk introspeksi dan meditasi.' },
        { title: 'Podcast & Musik', desc: 'Suasana berkabut cocok banget buat dengerin podcast atau playlist favorit.' },
        { title: 'Journaling', desc: 'Tulis pikiran dan perasaan hari ini — berkabut tapi kepala harus tetap jernih.' },
      ],
      foods: [
        { title: 'Wedang Ronde', desc: 'Minuman tradisional hangat yang sempurna untuk pagi berkabut yang mistis.' },
        { title: 'Sup Hangat', desc: 'Semangkuk sup panas menghangatkan tubuh dan jiwa di cuaca dingin berkabut.' },
        { title: 'Teh Susu', desc: 'Creamy, hangat, dan menenangkan — cocok banget untuk sarapan di hari berkabut.' },
      ],
    },

    'drizzle': {
      activities: [
        { title: 'Reading Session', desc: 'Suara gerimis + buku bagus = kombinasi surga. Bungkus diri dengan selimut dan mulai baca!' },
        { title: 'Deep Work', desc: 'Gerimis pelan menciptakan white noise alami yang membantu konsentrasi mendalam.' },
        { title: 'Maraton Film', desc: 'Hari gerimis adalah excuse sempurna buat nonton film seharian tanpa rasa bersalah.' },
      ],
      foods: [
        { title: 'Kopi Panas', desc: 'Gerimis minta kopi panas. Bukan diskusi lagi, ini kebutuhan. ' },
        { title: 'Mie Rebus', desc: 'Mie kuah hangat dengan telur dan sayuran — comfort food sejuta umat saat gerimis.' },
        { title: 'Jahe Susu', desc: 'Jahe segar, susu hangat, sedikit madu — resep terbaik untuk melawan dingin.' },
      ],
    },

    'rainy': {
      activities: [
        { title: 'Stay Indoor & WFC', desc: 'Hujan = sinyal untuk super fokus kerja dari rumah/kafe. Matikan notif, mulai deep work!' },
        { title: 'Nonton Bareng', desc: 'Momen hujan yang langka? Konvoy ke rumah teman dan maraton serial favorit kalian.' },
        { title: 'Board Games', desc: 'Ajak keluarga atau teman main board game. Dulu seru, sekarang lebih seru lagi.' },
      ],
      foods: [
        { title: 'Mie Ayam Bakso', desc: 'Kuah kaldu yang gurih + mie kenyal + bakso empuk = formula sempurna saat hujan.' },
        { title: 'Soto Hangat', desc: 'Soto ayam atau soto betawi — hangatkan tubuh dari dalam di tengah guyuran hujan.' },
        { title: 'Pisang Goreng', desc: 'Pisang goreng krispi + teh hangat saat hujan = unlocked achievement Indonesia banget.' },
      ],
    },

    'stormy': {
      activities: [
        { title: 'Tetap di Dalam Rumah', desc: 'Prioritas pertama: keselamatan. Hindari area terbuka, pohon besar, dan bangunan rapuh.' },
        { title: 'Siapkan Power Bank', desc: 'Pantau kondisi listrik, charge semua perangkat sebelum listrik mati. Prioritaskan HP!' },
        { title: 'Self-Care Day', desc: 'Jadikan badai sebagai alasan valid buat istirahat total dan self-care seharian.' },
      ],
      foods: [
        { title: 'Sup Krim Jagung', desc: 'Sup krim hangat nan creamy — teman terbaik saat badai mengamuk di luar.' },
        { title: 'Wedang Uwuh', desc: 'Rempah-rempah herbal tradisional untuk menjaga stamina di cuaca ekstrem.' },
        { title: 'Hot Chocolate', desc: 'Cokelat panas dan tebal — senjata rahasia melawan dingin dan kecemasan badai.' },
      ],
    },
  };

  const vibeRecs = recs[vibe] || recs['cloudy'];
  return {
    activities: vibeRecs.activities.slice(0, 3),
    foods: vibeRecs.foods.slice(0, 3),
  };
}
