/**
 * Artikel seed soft-launch — selaras dengan docs/soft-launch-content.md
 * Target: 30–50 artikel dengan distribusi per kategori sesuai checklist.
 */

const { IMAGES } = require("./images.js");
const { CLERK_TEST_SAMPLE_USER_EMAIL, DUMMY_USER_EMAILS } = require("./clerk-test-emails.js");

const AUTHORS = [
  { email: CLERK_TEST_SAMPLE_USER_EMAIL, displayName: "Budi" },
  { email: DUMMY_USER_EMAILS.sitirahayu, displayName: "Siti" },
  { email: DUMMY_USER_EMAILS.andiwijaya, displayName: "Andi" },
  { email: DUMMY_USER_EMAILS.dewikusuma, displayName: "Dewi" },
  { email: DUMMY_USER_EMAILS.rizkypratama, displayName: "Rizky" },
  { email: DUMMY_USER_EMAILS.mayaindah, displayName: "Maya" },
  { email: DUMMY_USER_EMAILS.fajarnugroho, displayName: "Fajar" },
  { email: DUMMY_USER_EMAILS.linahartati, displayName: "Lina" },
];

const CATEGORY_COVER_KEY = {
  news: "technology",
  travel: "travel",
  culture: "culture",
  entertainment: "anime",
  lifestyle: "lifestyle",
  "work-in-japan": "education",
  "study-in-japan": "education",
  "review-produk": "food",
  event: "event",
};

function coverFor(categorySlug, index) {
  const key = CATEGORY_COVER_KEY[categorySlug] || "culture";
  const pool = IMAGES.articleCovers[key] || IMAGES.articleFallback;
  return pool[index % pool.length];
}

function article(def, index) {
  const author = AUTHORS[index % AUTHORS.length];
  return {
    title: def.title,
    category_slug: def.category_slug,
    tags: def.tags,
    excerpt: def.excerpt,
    content: def.content,
    cover_image_url: def.cover_image_url ?? coverFor(def.category_slug, index),
    is_featured: def.is_featured ?? false,
    is_hot: def.is_hot ?? false,
    status: def.status ?? "PUBLISHED",
    author_email: def.author_email ?? author.email,
  };
}

const ARTICLE_DEFS = [
  // ── News (8) ──────────────────────────────────────────────────────────
  {
    category_slug: "news",
    title: "Jepang Resmi Naikkan Upah Minimum Nasional Mulai Oktober 2026",
    excerpt:
      "Pemerintah Jepang mengumumkan kenaikan upah minimum nasional 3,5% yang berlaku 1 Oktober 2026, dengan Tokyo mencatatkan angka tertinggi ¥1.150 per jam.",
    tags: ["tokyo", "kanji"],
    is_featured: true,
    is_hot: true,
    content: `<p>Pemerintah Jepang mengumumkan kenaikan upah minimum nasional sebesar 3,5% yang akan mulai berlaku pada 1 Oktober 2026. Kebijakan ini menjadi bagian dari upaya pemerintah untuk meningkatkan daya beli masyarakat dan mendukung stabilitas ekonomi di tengah inflasi yang masih berlangsung.</p>
<h2>Penjelasan Detail</h2>
<p>Kementerian Kesehatan, Tenaga Kerja, dan Kesejahteraan (MHLW) menyatakan bahwa upah minimum rata-rata nasional akan naik dari ¥1.004 menjadi ¥1.039 per jam.</p>
<p>Beberapa prefektur besar seperti Tokyo, Osaka, dan Aichi akan mengalami kenaikan lebih tinggi dibandingkan daerah lain. Tokyo kini menjadi prefektur dengan upah minimum tertinggi, yaitu ¥1.150 per jam.</p>
<h2>Latar Belakang</h2>
<p>Kenaikan upah minimum ini merupakan bagian dari kebijakan pemerintah Jepang untuk mengatasi tekanan ekonomi akibat inflasi dan kekurangan tenaga kerja. Dalam beberapa tahun terakhir, Jepang menghadapi penurunan populasi usia produktif, sehingga perusahaan semakin bergantung pada tenaga kerja asing dan otomatisasi.</p>
<h2>Dampak / Relevansi</h2>
<p>Kebijakan ini diperkirakan akan berdampak positif bagi pekerja lokal maupun asing, termasuk pekerja Indonesia yang bekerja di sektor manufaktur, restoran, dan caregiving. Namun, beberapa pelaku usaha kecil mengkhawatirkan peningkatan biaya operasional.</p>
<ul>
<li>Berlaku mulai: 1 Oktober 2026</li>
<li>Kenaikan rata-rata nasional: 3,5%</li>
<li>Prefektur dengan kenaikan tertinggi: Tokyo, Osaka, Aichi</li>
<li>Sektor paling terdampak: restoran, retail, caregiving, manufaktur ringan</li>
</ul>
<blockquote><p>"Kenaikan upah minimum ini penting untuk menjaga daya beli masyarakat dan mendukung pertumbuhan ekonomi."</p><p>— Menteri Tenaga Kerja Jepang</p></blockquote>
<h2>Kesimpulan</h2>
<p>Kenaikan upah minimum nasional Jepang pada 2026 menjadi kabar baik bagi para pekerja, termasuk tenaga kerja asing. Dengan biaya hidup yang terus meningkat, kebijakan ini diharapkan dapat memberikan stabilitas ekonomi dan meningkatkan kesejahteraan pekerja di seluruh Jepang.</p>`,
  },
  {
    category_slug: "news",
    title: "Sony Perkenalkan Kamera Mirrorless Generasi Terbaru di Tokyo",
    excerpt:
      "Sony meluncurkan lini kamera full-frame terbaru dengan fokus autofokus AI dan performa low-light yang ditingkatkan di acara peluncuran Tokyo.",
    tags: ["tokyo", "retro-game"],
    is_hot: true,
    content: `<p>Sony Corporation secara resmi memperkenalkan generasi terbaru kamera mirrorless full-frame di Tokyo pada Juni 2026. Peluncuran ini menandai fokus Sony pada fotografi profesional dan content creator global.</p>
<h2>Detail Produk</h2>
<p>Kamera baru dilengkapi sensor 61MP, autofokus berbasis AI yang mampu melacak subjek manusia dan hewan secara real-time, serta stabilisasi internal generasi kelima. Body dirancang tahan cuaca dengan berat 20% lebih ringan dibanding pendahulunya.</p>
<h2>Latar Belakang</h2>
<p>Pasar kamera mirrorless global tumbuh 12% tahun lalu, dengan Sony mempertahankan posisi terdepan di segmen profesional. Persaingan dengan Canon dan Nikon mendorong inovasi cepat di bidang computational photography.</p>
<h2>Dampak</h2>
<p>Bagi fotografer Indonesia yang bekerja di Jepang atau content creator travel, kamera ini menawarkan performa video 8K dan konektivitas cloud langsung — fitur yang semakin dibutuhkan industri media digital.</p>
<h2>Kesimpulan</h2>
<p>Peluncuran Sony menegaskan posisi Jepang sebagai pusat inovasi elektronik konsumen. Produk ini diperkirakan tersedia di pasar global mulai September 2026.</p>`,
  },
  {
    category_slug: "news",
    title: "Toyota Umumkan Strategi Kendaraan Listrik untuk Pasar Asia",
    excerpt:
      "Toyota mempercepat roadmap EV dengan target 15 model listrik baru di Asia Tenggara dan pasar emerging hingga 2030.",
    tags: ["tokyo", "retro-game"],
    content: `<p>Toyota Motor Corporation mengumumkan strategi kendaraan listrik (EV) yang lebih agresif untuk pasar Asia, termasuk rencana investasi ¥500 miliar untuk fasilitas baterai di Jepang dan Thailand.</p>
<h2>Detail Kebijakan</h2>
<p>Perusahaan menargetkan 15 model EV baru hingga 2030, dengan fokus pada segmen compact SUV dan sedan keluarga. Platform e-TNGA generasi kedua diklaim menawarkan jarak tempuh 600 km per charge.</p>
<h2>Latar Belakang</h2>
<p>Regulasi emisi yang semakin ketat di Jepang dan Uni Eropa mendorong transisi cepat industri otomotif. Toyota, yang sebelumnya lebih fokus hybrid, kini mengejar ketertinggalan dari BYD dan Tesla di segmen murni listrik.</p>
<h2>Relevansi</h2>
<p>Indonesia sebagai pasar otomotif terbesar ASEAN menjadi prioritas ekspor. Kolaborasi dengan PT Toyota-Astra diharapkan membawa teknologi baterai solid-state ke pasar lokal dalam 5–7 tahun.</p>
<h2>Kesimpulan</h2>
<p>Strategi Toyota menandai pergeseran signifikan dari hybrid-first ke EV-first, dengan implikasi besar bagi industri otomotif Asia.</p>`,
  },
  {
    category_slug: "news",
    title: "Nintendo Switch 2 Dijadwalkan Rilis Global Q1 2027",
    excerpt:
      "Nintendo mengonfirmasi Switch 2 akan rilis global kuartal pertama 2027 dengan layar OLED 8 inci dan backward compatibility penuh.",
    tags: ["retro-game", "otaku"],
    is_hot: true,
    content: `<p>Nintendo Co., Ltd. mengonfirmasi konsol generasi berikutnya, Nintendo Switch 2, akan dirilis secara global pada kuartal pertama 2027. Pengumuman resmi disampaikan dalam Nintendo Direct khusus.</p>
<h2>Spesifikasi Utama</h2>
<p>Switch 2 dilaporkan memiliki layar OLED 8 inci, resolusi 1080p handheld / 4K docked, dan chip NVIDIA custom berbasis arsitektur Ampere. Backward compatibility penuh dengan library Switch original dijanjikan.</p>
<h2>Latar Belakang</h2>
<p>Switch original terjual lebih dari 140 juta unit sejak 2017, menjadikannya konsol Nintendo terlaris sepanjang masa. Namun penjualan hardware mulai melambat sejak 2024, mendorong kebutuhan refresh generasi.</p>
<h2>Dampak</h2>
<p>Bagi komunitas gamer Indonesia, rilis Switch 2 diantisipasi akan mendorong kembali minat import game fisik dan digital dari pasar Jepang, terutama untuk judul first-party Nintendo.</p>
<h2>Kesimpulan</h2>
<p>Switch 2 menjadi salah satu produk paling dinantikan dari industri game Jepang. Pre-order diperkirakan dibuka akhir 2026.</p>`,
  },
  {
    category_slug: "news",
    title: "Jepang Terapkan Kebijakan Visa Digital Nomad untuk Pelancong Remote Work",
    excerpt:
      "Visa digital nomad Jepang resmi berlaku 2026, memungkinkan pekerja remote asing tinggal hingga 6 bulan dengan syarat pendapatan minimum.",
    tags: ["tokyo", "kanji"],
    content: `<p>Pemerintah Jepang mulai menerapkan visa digital nomad resmi sejak April 2026, memungkinkan pekerja remote asing tinggal di Jepang hingga enam bulan tanpa status pekerja tetap.</p>
<h2>Detail Kebijakan</h2>
<p>Pemohon harus membuktikan pendapatan tahunan minimal ¥10 juta (~US$67.000) dan memiliki asuransi kesehatan. Visa berlaku untuk 49 negara, termasuk Indonesia.</p>
<h2>Latar Belakang</h2>
<p>Kebijakan ini mengikuti tren global pasca-pandemi, di mana negara seperti Portugal, Estonia, dan Thailand telah sukses menarik digital nomad. Jepang ingin memanfaatkan tren ini untuk mendongkrak pariwisata dan ekonomi lokal.</p>
<h2>Relevansi</h2>
<p>Bagi profesional Indonesia di bidang IT, desain, dan content creation, visa ini membuka peluang menetap sementara di Tokyo, Osaka, atau Fukuoka sambil bekerja remote.</p>
<h2>Kesimpulan</h2>
<p>Visa digital nomad Jepang menandai langkah progresif imigrasi Jepang. Detail prosedur apply tersedia di situs resmi Immigration Services Agency.</p>`,
  },
  {
    category_slug: "news",
    title: "Tren Demografi: Jepang Catat Rekor Populasi Lansia Tertinggi",
    excerpt:
      "29,3% populasi Jepang berusia 65+ per Maret 2026, mendorong kebijakan reformasi sosial dan peluang di sektor perawatan.",
    tags: ["tokyo", "kanji"],
    content: `<p>Badan Statistik Internal Jepang melaporkan bahwa 29,3% populasi negara ini berusia 65 tahun ke atas per Maret 2026 — angka tertinggi sepanjang sejarah.</p>
<h2>Data Utama</h2>
<p>Populasi total Jepang turun ke 123,8 juta jiwa, penurunan ke-16 berturut-turut. Angka kelahiran mencapai rekor terendah 730.000 bayi per tahun, sementara angka harapan hidup tetap di 84,5 tahun (pria) dan 87,6 tahun (wanita).</p>
<h2>Latar Belakang</h2>
<p>Super-aging society Jepang telah mendorong reformasi sistem pensiun, perluasan imigrasi tenaga kerja terampil, dan investasi besar di robotika perawatan lansia.</p>
<h2>Relevansi</h2>
<p>Sektor caregiving (kaigo) menjadi peluang kerja utama bagi tenaga kerja asing, termasuk Indonesia. Permintaan pekerja perawat diperkirakan tumbuh 20% dalam lima tahun ke depan.</p>
<h2>Kesimpulan</h2>
<p>Tren demografi Jepang bukan hanya isu domestik — ini membuka peluang karier dan bisnis bagi yang memahami kebutuhan masyarakat aging society.</p>`,
  },
  {
    category_slug: "news",
    title: "Startup AI Jepang Raih Pendanaan Series B US$120 Juta",
    excerpt:
      "Preferred Networks dan SoftBank Vision Fund co-lead pendanaan startup AI Tokyo yang fokus pada otomatisasi manufaktur.",
    tags: ["tokyo", "retro-game"],
    content: `<p>Startup AI asal Tokyo, NeuralForge Inc., mengumumkan pendanaan Series B sebesar US$120 juta yang dipimpin bersama Preferred Networks dan SoftBank Vision Fund 2.</p>
<h2>Detail Pendanaan</h2>
<p>Dana akan digunakan untuk ekspansi platform AI inspection ke pabrik-pabrik manufaktur di Asia Tenggara dan pengembangan model bahasa Jepang generasi berikutnya.</p>
<h2>Latar Belakang</h2>
<p>Ekosistem startup AI Jepang tumbuh pesat sejak 2023, didorong kebijakan "Society 5.0" dan kolaborasi academia-industri. Tokyo dan Osaka menjadi hub utama.</p>
<h2>Relevansi</h2>
<p>Bagi talenta tech Indonesia, ekosistem ini menawarkan peluang karier dan kolaborasi riset — terutama di bidang computer vision dan NLP bahasa Jepang.</p>
<h2>Kesimpulan</h2>
<p>Pendanaan ini menegaskan momentum startup AI Jepang di panggung global, sejalan dengan tren investasi AI di seluruh Asia.</p>`,
  },
  {
    category_slug: "news",
    title: "Fenomena Konbini Gourmet Masuk Daftar Tren Kuliner Global 2026",
    excerpt:
      "Produk ready-to-eat dari Lawson dan 7-Eleven Jepang masuk daftar tren kuliner global menurut laporan gastronomi internasional.",
    tags: ["ramen", "sushi", "tokyo"],
    content: `<p>Laporan Global Food Trends 2026 menempatkan "konbini gourmet" — produk makanan premium dari convenience store Jepang — sebagai salah satu tren kuliner terkemuka dunia.</p>
<h2>Detail Tren</h2>
<p>Produk seperti onigiri premium, bento chef-collaboration, dan dessert musiman dari Lawson Uchi Cafe dan 7-Eleven Gold mendapat perhatian media internasional. Penjualan kategori premium naik 34% year-on-year.</p>
<h2>Latar Belakang</h2>
<p>Konbini Jepang telah berevolusi dari sekadar tempat belanja cepat menjadi destinasi kuliner. Kompetisi antar chain mendorong inovasi produk dengan rotasi menu mingguan.</p>
<h2>Relevansi</h2>
<p>Wisatawan Indonesia yang berkunjung ke Jepang semakin membagikan pengalaman konbini di social media, mendorong minat terhadap produk serupa di pasar Indonesia.</p>
<h2>Kesimpulan</h2>
<p>Konbini gourmet membuktikan bahwa inovasi kuliner Jepang tidak hanya ada di restoran fine dining, tapi juga di rak convenience store seharga ¥300–¥800.</p>`,
  },

  // ── Travel (7) ──────────────────────────────────────────────────────────
  {
    category_slug: "travel",
    title: "Itinerary 4 Hari Kyoto: Kuil, Arashiyama, dan Gion",
    excerpt:
      "Panduan itinerary 4 hari di Kyoto — dari Fushimi Inari hingga bamboo grove Arashiyama dan jalan-jalan malam di Gion.",
    tags: ["kyoto", "sakura", "onsen"],
    is_featured: true,
    content: `<p>Kyoto adalah jantung budaya Jepang dengan lebih dari 1.600 kuil dan candi. Itinerary 4 hari ini dirancang untuk first-timer yang ingin merasakan essensi kota ini tanpa terburu-buru.</p>
<h2>Akses</h2>
<p>Dari Kansai International Airport (KIX), naik Haruka Limited Express ke Kyoto Station (~75 menit, ¥3.630 dengan ICOCA). Dari Tokyo, Shinkansen Nozomi (~2 jam 15 menit, ¥13.870).</p>
<h2>Hari 1 — Timur Kyoto</h2>
<p>Pagi: Fushimi Inari Taisha (datang sebelum 08:00 untuk foto tanpa kerumunan). Siang: Kiyomizu-dera dan jalan Ninenzaka/Sannenzaka. Malam: Gion — jalan di Hanamikoji dan Shirakawa.</p>
<h2>Hari 2 — Arashiyama</h2>
<p>Bamboo Grove, Tenryu-ji, dan Togetsukyo Bridge. Naik Randen tram dari Arashiyama ke Ryoan-ji (¥230).</p>
<h2>Hari 3 — Utara Kyoto</h2>
<p>Kinkaku-ji (Golden Pavilion), Ryoan-ji, dan Nijo Castle. Siang: Nishiki Market untuk makan siang.</p>
<h2>Hari 4 — Bebas / Day Trip</h2>
<p>Opsi: Nara (deer park + Todai-ji) atau Philosopher's Path jika musim sakura/momiji.</p>
<h2>Tips</h2>
<ul>
<li>Beli Kyoto City Bus One-Day Pass (¥700) untuk transport lokal</li>
<li>Booking ryokan minimal 2 minggu sebelumnya</li>
<li>Hindari weekend Jepang untuk spot populer</li>
</ul>
<h2>Kesimpulan</h2>
<p>4 hari cukup untuk highlights Kyoto. Perpanjang ke 5–6 hari jika ingin menambah Uji, Kurama, atau pengalaman tea ceremony.</p>`,
  },
  {
    category_slug: "travel",
    title: "Panduan Hemat Wisata Tokyo untuk Backpacker Indonesia",
    excerpt:
      "Tips menghemat budget di Tokyo — dari akomodasi capsule hotel, JR Pass, hingga makan di konbini dan gyudon chain.",
    tags: ["tokyo", "ramen"],
    is_hot: true,
    content: `<p>Tokyo memiliki reputasi sebagai kota mahal, tapi dengan perencanaan tepat, backpacker bisa menikmati ibu kota Jepang dengan budget ¥8.000–¥12.000 per hari.</p>
<h2>Akomodasi</h2>
<p>Capsule hotel: ¥3.000–¥5.000/malam (Nine Hours, First Cabin). Hostel dorm: ¥2.500–¥4.000. Area Asakusa, Ueno, dan Ikebukuro lebih terjangkau dari Shibuya/Ginza.</p>
<h2>Transportasi</h2>
<p>Beli Suica/PASMO untuk semua transport. Tokyo Metro 24-hour pass: ¥800 (weekend). Jalan kaki di area cluster (Shibuya–Harajuku–Omotesando) menghemat banyak.</p>
<h2>Makan</h2>
<p>Gyudon chain (Sukiya, Yoshinoya): ¥400–¥600. Konbini bento: ¥400–¥700. Ramen: ¥800–¥1.200. Pasar pagi Tsukiji Outer Market untuk seafood breakfast ¥500–¥1.000.</p>
<h2>Aktivitas Gratis/Murah</h2>
<p>Meiji Shrine, Yoyogi Park, Senso-ji, observasi gratis di Asakusa Culture Tourist Info Center, dan window shopping di Don Quijote.</p>
<h2>Kesimpulan</h2>
<p>Tokyo bisa dijelajahi dengan budget terbatas. Kuncinya: akomodasi strategis, makan lokal, dan manfaatkan free attractions.</p>`,
  },
  {
    category_slug: "travel",
    title: "Nikko: Day Trip dari Tokyo ke Warisan UNESCO",
    excerpt:
      "Nikko Toshogu dan danau Chuzenji bisa dijelajahi dalam sehari dari Tokyo — panduan akses, biaya, dan spot wajib.",
    tags: ["tokyo", "sakura"],
    content: `<p>Nikko, kota di pegunungan Tochigi, menawarkan kuil UNESCO, air terjun spektakuler, dan pemandangan danau — semua bisa dicapai dalam day trip dari Tokyo.</p>
<h2>Akses</h2>
<p>Dari Asakusa: Tobu Railway Nikko Line + Limited Express Spacia (~2 jam, ¥2.840 one-way). Dari Shinjuku: JR Nikko Line via Omiya (~2 jam, ¥1.320 dengan JR Pass).</p>
<h2>Spot Wajib</h2>
<p>Nikko Toshogu Shrine (¥1.300), Kegon Falls (¥570 elevator), Lake Chuzenji, dan Shinkyo Bridge (¥300).</p>
<h2>Biaya Estimasi</h2>
<p>Transport return: ¥5.680 | Makan: ¥1.500 | Tiket masuk: ¥2.200 | Total: ~¥9.400 (~Rp 1 juta).</p>
<h2>Tips</h2>
<p>Datang pagi (train 07:00) untuk menghindari kerumunan. Bawa jaket — suhu Nikko 5–8°C lebih dingin dari Tokyo. Musim terbaik: oktober (momiji) dan Mei (sakura).</p>
<h2>Kesimpulan</h2>
<p>Nikko adalah day trip klasik dari Tokyo yang menawarkan kombinasi sejarah, alam, dan spiritualitas dalam satu perjalanan.</p>`,
  },
  {
    category_slug: "travel",
    title: "Menikmati Musim Sakura di Ueno Park — Jadwal & Tips 2027",
    excerpt:
      "Ueno Park menjadi spot hanami populer di Tokyo. Panduan prediksi mekar, spot foto, dan etika hanami untuk wisatawan.",
    tags: ["sakura", "tokyo"],
    is_hot: true,
    content: `<p>Ueno Park (Ueno Onshi Koen) adalah salah satu lokasi hanami (pemandangan sakura) paling ikonik di Tokyo, dengan lebih dari 1.000 pohon sakura sepanjang jalan utama taman.</p>
<h2>Prediksi Mekar 2027</h2>
<p>Berdasarkan data historis, sakura di Tokyo diperkirakan mekar penuh sekitar 28 Maret – 5 April 2027. Pantau update resmi dari Japan Meteorological Corporation mulai Februari.</p>
<h2>Akses</h2>
<p>Stasiun Ueno (JR Yamanote, Ginza Line, Hibiya Line) — pintu keluar Park Exit langsung ke taman. Gratis masuk.</p>
<h2>Hal yang Bisa Dilakukan</h2>
<p>Hanami picnic di bawah pohon sakura, kunjungi Tokyo National Museum dan Ueno Zoo di area yang sama, foto di Shinobazu Pond dengan backdrop sakura.</p>
<h2>Tips</h2>
<ul>
<li>Datang weekday pagi (07:00–09:00) untuk foto tanpa kerumunan</li>
<li>Bawa matras plastik (¥100 di Don Quijote) — etika hanami: jangan sentuh pohon</li>
<li>Booking hotel 2–3 bulan sebelum musim sakura</li>
</ul>
<h2>Kesimpulan</h2>
<p>Ueno Park menawarkan pengalaman hanami autentik di jantung Tokyo. Perencanaan early bird sangat direkomendasikan.</p>`,
  },
  {
    category_slug: "travel",
    title: "Akses Mudah ke Fuji Five Lakes dari Shinjuku",
    excerpt:
      "Cara menuju Kawaguchiko dan danau Fuji lainnya dari Tokyo — bus direct, shinkansen, dan tips spot foto terbaik.",
    tags: ["tokyo", "sakura"],
    content: `<p>Fuji Five Lakes (Fujigoko) menawarkan pemandangan Gunung Fuji yang spektakuler dari berbagai sudut. Kawaguchiko adalah danau paling populer dan mudah diakses dari Tokyo.</p>
<h2>Akses dari Shinjuku</h2>
<p>Highway bus Fujikyu dari Shinjuku Bus Terminal: ~1 jam 45 menit, ¥2.200 one-way. Bus berangkat setiap 30–60 menit. Booking online via Fujikyu atau Willer.</p>
<h2>Alternatif</h2>
<p>JR Chuo Line ke Otsuki + Fujikyu Railway ke Kawaguchiko (~2 jam 30 menit, ¥2.570). Lebih fleksibel tapi lebih lama.</p>
<h2>Spot Foto</h2>
<p>Chureito Pagoda (Arakurayama Sengen Park), Oishi Park (musim lavender Juni–Juli), dan north shore Kawaguchiko.</p>
<h2>Biaya & Jam</h2>
<p>Bus: ¥4.400 return | Kawaguchiko Ropeway: ¥900 | Chureito Pagoda: gratis (trek 400 anak tangga).</p>
<h2>Kesimpulan</h2>
<p>Day trip atau overnight ke Fuji Five Lakes sangat feasible dari Tokyo. Visibility Fuji terbaik di pagi hari musim dingin (Desember–Februari).</p>`,
  },
  {
    category_slug: "travel",
    title: "Odaiba: Destinasi Keluarga Modern di Teluk Tokyo",
    excerpt:
      "Odaiba menawarkan teamLab, Gundam Statue, shopping mall, dan pemandangan Rainbow Bridge — panduan lengkap untuk keluarga.",
    tags: ["tokyo", "cosplay"],
    content: `<p>Odaiba adalah pulau buatan di Teluk Tokyo yang menjadi destinasi hiburan modern, populer untuk keluarga dan pasangan muda.</p>
<h2>Akses</h2>
<p>Yurikamome Line dari Shimbashi (¥330) — kereta otomatis tanpa masinis dengan pemandangan teluk. Alternatif: Rinkai Line dari Osaki.</p>
<h2>Spot Wajib</h2>
<p>teamLab Borderless (¥3.800, booking wajib), Unicorn Gundam Statue (show jam 11/13/15/17), DiverCity Tokyo Plaza, dan Odaiba Marine Park.</p>
<h2>Hal yang Bisa Dilakukan</h2>
<p>Shopping di Aqua City dan Decks Tokyo Beach, onsen di Oedo Onsen Monogatari (¥2.720), dan sunset view Rainbow Bridge dari Odaiba Seaside Park.</p>
<h2>Tips</h2>
<p>teamLab booking 2–4 minggu sebelumnya. Kunjungi weekday untuk Gundam show yang lebih santai. Makan di Aqua City food court dengan view teluk.</p>
<h2>Kesimpulan</h2>
<p>Odaiba menggabungkan teknologi, pop culture, dan rekreasi keluarga — cocok untuk half-day atau full-day trip dari pusat Tokyo.</p>`,
  },
  {
    category_slug: "travel",
    title: "Momiji di Kiyomizu-dera: Panduan Musim Gugur Kyoto",
    excerpt:
      "Kiyomizu-dera menjadi spot momiji (daun maple merah) terbaik di Kyoto — jadwal, akses, dan tips foto malam hari.",
    tags: ["kyoto", "sakura"],
    content: `<p>Kiyomizu-dera, kuil UNESCO di timur Kyoto, menjadi salah satu spot momiji (koyo) paling spektakuler saat musim gugur, dengan iluminasi malam khusus.</p>
<h2>Akses</h2>
<p>Bus 100 atau 206 dari Kyoto Station ke Gojo-zaka atau Kiyomizu-michi (~15 menit). Jalan kaki uphill 10 menit ke gerbang kuil.</p>
<h2>Jam & Biaya</h2>
<p>Reguler: 06:00–18:00, ¥400. Illumination (pertengahan November – awal Desember): 17:30–21:00, ¥400 (tiket terpisah).</p>
<h2>Highlight</h2>
<p>Stage kayu Kiyomizu Stage dengan backdrop maple merah, pagoda Yasaka, dan jalan Ninenzaka yang dipenuhi dedaunan gugur.</p>
<h2>Tips</h2>
<p>Peak momiji: 20–30 November (variasi tiap tahun). Datang weekday pagi atau malam hari illumination. Wear comfortable shoes — banyak tangga.</p>
<h2>Kesimpulan</h2>
<p>Kiyomizu-dera saat momiji adalah pengalaman wajib bagi pengunjung Kyoto di musim gugur. Booking akomodasi minimal 1 bulan sebelumnya.</p>`,
  },

  // ── Culture (5) ─────────────────────────────────────────────────────────
  {
    category_slug: "culture",
    title: "Etika Onsen: Panduan untuk Pemula yang Berkunjung ke Jepang",
    excerpt:
      "Aturan dasar onsen — dari cara mandi sebelum berendam, tattoo policy, hingga etika di ruang ganti.",
    tags: ["onsen", "kanji"],
    is_featured: true,
    content: `<p>Onsen (pemandian air panas) adalah pengalaman budaya Jepang yang wajib dicoba. Namun, ada etika penting yang harus dipahami sebelum berendam.</p>
<h2>Sejarah Singkat</h2>
<p>Tradisi onsen di Jepang berusia lebih dari 1.000 tahun, berakar pada kepercayaan Shinto tentang pembersihan spiritual. Jepang memiliki lebih dari 27.000 sumber air panas.</p>
<h2>Makna Budaya</h2>
<p>Onsen bukan sekadar mandi — ini ritual relaksasi, pembersihan, dan komunitas. "Hadaka no tsukiai" (persahabatan tanpa pakaian) melambangkan kesetaraan di depan alam.</p>
<h2>Cara Masyarakat Jepang Melakukannya</h2>
<ol>
<li>Buka sandal, masuk ruang ganti, simpan pakaian di locker</li>
<li>Bawa handuk kecil ke area pemandian</li>
<li>Cuci tubuh di shower station SEBELUM masuk kolam</li>
<li>Masuk kolam perlahan, handuk kecil di atas kepala (jangan celupkan ke air)</li>
<li>Setelah selesai, bilas opsional sebelum kembali ke ruang ganti</li>
</ol>
<h2>Relevansi untuk Pembaca Indonesia</h2>
<p>Banyak onsen modern menerima tattoo (cegah yang "no tattoo"). Gunakan Google Maps filter "tattoo friendly onsen". Ryokan onsen biasanya lebih toleran daripada sento publik.</p>
<h2>Kesimpulan</h2>
<p>Onsen adalah pintu masuk ke budaya Jepang yang autentik. Hormati aturan, nikmati keheningan, dan jangan foto di area pemandian.</p>`,
  },
  {
    category_slug: "culture",
    title: "Matsuri Gion: Sejarah dan Makna Festival Kyoto Terbesar",
    excerpt:
      "Gion Matsuri, festival 1.000 tahun di Kyoto, menampilkan parade yamaboko raksasa setiap Juli — sejarah, makna, dan tips menonton.",
    tags: ["kyoto", "sakura", "samurai"],
    content: `<p>Gion Matsuri adalah festival Shinto tertua dan terbesar di Jepang, diadakan setiap Juli di Kyoto selama sebulan penuh, dengan puncak parade yamaboko pada 17 dan 24 Juli.</p>
<h2>Sejarah Singkat</h2>
<p>Bermula tahun 869 M sebagai ritual untuk mengusir wabah penyakit. Festival berkembang menjadi perayaan kemakmuran dan identitas komunitas Kyoto selama lebih dari 1.150 tahun.</p>
<h2>Makna Budaya</h2>
<p>Yamaboko (float raksasa setinggi 25 meter) mewakili 33 komunitas lokal Kyoto. Setiap float adalah karya seni mobile dengan tapestries, ukiran kayu, dan tekstil kuno.</p>
<h2>Cara Masyarakat Jepang Merayakannya</h2>
<p>Warga Kyoto terlibat sepanjang tahun dalam persiapan. Yoiyama (3–16 Juli) adalah malam festival di mana jalan ditutup dan float diterangi lentera — atmosfer seperti pesta jalanan.</p>
<h2>Relevansi untuk Pembaca Indonesia</h2>
<p>Gion Matsuri menawarkan pengalaman budaya Jepang yang lebih dalam dari wisata kuil. Datang saat Yoiyama untuk atmosfer terbaik tanpa tiket.</p>
<h2>Kesimpulan</h2>
<p>Gion Matsuri adalah living heritage Kyoto. Rencanakan kunjungan Juli dengan booking akomodasi 3–6 bulan sebelumnya.</p>`,
  },
  {
    category_slug: "culture",
    title: "Memahami Konsep Omotenashi dalam Pelayanan Jepang",
    excerpt:
      "Omotenashi — keramahan tanpa ekspektasi — adalah filosofi pelayanan yang membentuk pengalaman wisata dan bisnis di Jepang.",
    tags: ["kanji", "onsen"],
    content: `<p>Omotenashi (おもてなし) sering diterjemahkan sebagai "keramahan Jepang", tapi maknanya jauh lebih dalam — pelayanan tulus tanpa ekspektasi imbalan.</p>
<h2>Sejarah Singkat</h2>
<p>Konsep ini berakar pada upacara tea ceremony Sen no Rikyu (abad ke-16), di mana tuan rumah mengantisipasi kebutuhan tamu sebelum tamu menyadarinya.</p>
<h2>Makna Budaya</h2>
<p>Omotenashi bukan "customer is king" ala Barat — ini tentang harmoni, memperhatikan detail, dan menciptakan kenyamanan tanpa berlebihan.</p>
<h2>Contoh dalam Kehidupan Sehari-hari</h2>
<p>Staf konbini membungkus botol dingin terpisah, pelayan restoran membungkuk saat menyajikan, dan staf hotel mengingat preferensi tamu — semua tanpa tip.</p>
<h2>Relevansi untuk Pembaca Indonesia</h2>
<p>Memahami omotenashi membantu wisatawan menghargai interaksi di Jepang. Balas dengan sopan (arigatou gozaimasu) dan hormati ruang personal staf.</p>
<h2>Kesimpulan</h2>
<p>Omotenashi adalah jantung pengalaman Jepang — dari ryokan hingga konbini. Nikmati, jangan eksploitasi.</p>`,
  },
  {
    category_slug: "culture",
    title: "Kimono untuk Wisatawan: Kapan, Di Mana, dan Etika Berpakaian",
    excerpt:
      "Panduan rental kimono di Kyoto dan Tokyo — pilihan toko, harga, etika berfoto, dan kesalahan yang harus dihindari.",
    tags: ["kyoto", "kanji"],
    content: `<p>Memakai kimono saat berwisata di Jepang — terutama Kyoto — adalah pengalaman populer. Tapi ada etika dan praktik yang perlu dipahami.</p>
<h2>Sejarah Singkat</h2>
<p>Kimono telah dikenakan di Jepang selama lebih dari 1.000 tahun. Kini, kimono modern hanya dipakai di acara formal, festival, dan oleh wisatawan di area heritage.</p>
<h2>Di Mana Rental</h2>
<p>Kyoto: Gion, Kiyomizu area (¥3.000–¥6.000/hari termasuk dressing). Tokyo: Asakusa (¥4.000–¥7.000). Booking online via Klook atau langsung walk-in pagi hari.</p>
<h2>Etika</h2>
<ul>
<li>Benar: kimono rental untuk wisata di area heritage</li>
<li>Salah: kimono bridal/yukata formal tanpa konteks</li>
<li>Hormati private property saat berfoto</li>
<li>Jangan sentuh kimono orang lain</li>
</ul>
<h2>Relevansi untuk Pembaca Indonesia</h2>
<p>Rental kimono adalah cara menghormati budaya jika dilakukan dengan benar. Pilih toko yang menawarkan dressing profesional dan jelaskan aturan sebelum berfoto.</p>
<h2>Kesimpulan</h2>
<p>Kimono rental = pengalaman, bukan kostum. Nikmati dengan respect dan dokumentasikan dengan etika.</p>`,
  },
  {
    category_slug: "culture",
    title: "10 Ungkapan Bahasa Jepang Sehari-hari yang Wajib Diketahui",
    excerpt:
      "Dari arigatou gozaimasu hingga sumimasen — 10 frasa Jepang praktis untuk wisatawan Indonesia.",
    tags: ["kanji", "tokyo"],
    content: `<p>Belajar beberapa frasa Jepang dasar akan sangat meningkatkan pengalaman wisata dan interaksi sehari-hari di Jepang.</p>
<h2>10 Frasa Wajib</h2>
<ol>
<li><strong>Sumimasen</strong> (すみません) — Permisi / Maaf / Terima kasih (serbaguna)</li>
<li><strong>Arigatou gozaimasu</strong> (ありがとうございます) — Terima kasih (formal)</li>
<li><strong>Onegaishimasu</strong> (お願いします) — Tolong / Silakan</li>
<li><strong>Kudasai</strong> (ください) — Tolong berikan...</li>
<li><strong>Doko desu ka?</strong> (どこですか) — Di mana?</li>
<li><strong>Ikura desu ka?</strong> (いくらですか) — Berapa harganya?</li>
<li><strong>Oishii!</strong> (おいしい) — Enak!</li>
<li><strong>Itadakimasu</strong> (いただきます) — Ucap sebelum makan</li>
<li><strong>Gochisousama deshita</strong> (ごちそうさまでした) — Ucap setelah makan</li>
<li><strong> Daijoubu desu</strong> (大丈夫です) — Tidak apa-apa / Saya baik-baik saja</li>
</ol>
<h2>Relevansi untuk Pembaca Indonesia</h2>
<p>Orang Jepang sangat menghargai upaya berbicara bahasa mereka, meski hanya satu frasa. Jangan takut salah — sumimasen covers hampir semua situasi awkward.</p>
<h2>Kesimpulan</h2>
<p>10 frasa ini cukup untuk navigasi dasar Jepang. Pelajari via app Duolingo atau YouTube channel "Japanese Ammo with Misa".</p>`,
  },

  // ── Entertainment (8) ─────────────────────────────────────────────────────
  {
    category_slug: "entertainment",
    title: "Anime Musim Panas 2026: 5 Judul Paling Dinantikan",
    excerpt:
      "Dari sequel populer hingga original baru — 5 anime musim panas 2026 yang wajib masuk watchlist.",
    tags: ["shonen", "isekai", "mappa"],
    is_hot: true,
    content: `<p>Musim panas 2026 membawa lineup anime yang kuat, dengan beberapa sequel highly anticipated dan original series dari studio top.</p>
<h2>5 Judul Paling Dinantikan</h2>
<ol>
<li><strong>Jujutsu Kaisen Season 3</strong> — MAPPA, lanjutan Shibuya Arc aftermath</li>
<li><strong>Chainsaw Man Season 2</strong> — MAPPA, arc Assault</li>
<li><strong>Frieren Season 2</strong> — Madhouse, continuation journey</li>
<li><strong>Dandadan Season 2</strong> — Science SARU, action-comedy supernatural</li>
<li><strong>Blue Lock Season 3</strong> — 8bit, arc U-20 Japan</li>
</ol>
<h2>Jadwal Rilis</h2>
<p>Semua judul di atas mulai Juli 2026, simulcast di Crunchyroll dan Bilibili untuk region Asia.</p>
<h2>Fakta Menarik</h2>
<p>MAPPA menganimasikan 3 dari 5 judul teratas — studio dengan workload terberat di industri. Dandadan Season 1 menjadi dark horse 2025 dengan rating 8.7 MyAnimeList.</p>
<h2>Kesimpulan</h2>
<p>Musim panas 2026 adalah musim MAPPA-dominant. Siapkan watchlist dan follow simulcast schedule di MyAnimeList atau Anilist.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "J-Pop Summer Fest 2026: Line-up Konser Terbaru",
    excerpt:
      "Fuji Rock, Summer Sonic, dan Rock in Japan 2026 — line-up awal dan tips tiket untuk penggemar J-Pop Indonesia.",
    tags: ["j-pop", "tokyo", "cosplay"],
    content: `<p>Musim panas Jepang identik dengan music festival besar. Tiga festival utama 2026 sudah mengumumkan line-up awal.</p>
<h2>Summer Sonic 2026 (16–17 Agustus, Osaka/Tokyo)</h2>
<p>Headliner: YOASOBI, Mrs. GREEN APPLE, King Gnu, Ado. Tiket: ¥22.000–¥25.000/day.</p>
<h2>Fuji Rock Festival (24–26 Juli, Naeba Ski Resort)</h2>
<p>Headliner: RADWIMPS, Kenshi Yonezu, Official HIGE DANdism. Camping festival dengan 200+ acts.</p>
<h2>Rock in Japan Festival (Agustus, Hitachi Seaside Park)</h2>
<p>Fokus rock/alternative: [Alexandros], MAN WITH A MISSION, Creepy Nuts.</p>
<h2>Tips Tiket</h2>
<p>Pre-sale lottery via Lawson Ticket atau e+ — daftar 2–3 bulan sebelumnya. WNI perlu alamat Jepang (bisa pakai hotel) untuk delivery tiket fisik.</p>
<h2>Kesimpulan</h2>
<p>Festival musim panas Jepang adalah pilgrimage bagi J-Pop fans. Rencanakan trip Juli–Agustus 2026 dengan booking akomodasi early.</p>`,
  },
  {
    category_slug: "entertainment",
    title: 'Review Film "Perfect Days" — Potret Kehidupan Sederhana di Tokyo',
    excerpt:
      "Wim Wenders menggarap portrait toilet cleaner Tokyo yang memenangkan Cannes — review tanpa spoiler.",
    tags: ["tokyo", "studio-ghibli"],
    is_featured: true,
    content: `<p>Perfect Days (2023), directed by Wim Wenders, mengisahkan Hirayama (Koji Yakusho) — toilet cleaner di Tokyo yang menemukan kebahagiaan dalam rutinitas sederhana.</p>
<h2>Sinopsis</h2>
<p>Tanpa plot besar, film ini mengikuti sehari-hari Hirayama: bangun pagi, fotografi, makan di konbini, mendengarkan cassette rock, membersihkan toilet The Tokyo Toilet Project, dan membaca Faulkner sebelum tidur.</p>
<h2>Highlight</h2>
<p>Koji Yakusho memenangkan Best Actor Cannes 2023. Cinematography by Franz Lustig menangkap Tokyo yang tenang — jauh dari neon Shibuya. Soundtrack Lou Reed dan Nina Simone menjadi karakter tersendiri.</p>
<h2>Fakta Menarik</h2>
<p>Toilet yang dibersihkan Hirayama adalah The Tokyo Toilet Project — 17 toilet publik desain arsitek ternama di Shibuya. Film ini promosi pariwisata yang subtle.</p>
<h2>Kesimpulan</h2>
<p>Perfect Days adalah meditasi tentang finding joy in simplicity — relevan untuk siapa pun yang hidup di kota besar. Streaming di Star+ / available for rent.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "Manga Terlaris 2025: Tren Seinen yang Mendominasi Pasar",
    excerpt:
      "One Piece tetap di puncak, tapi manga seinen seperti Frieren dan Blue Period dominasi growth 2025.",
    tags: ["seinen", "shonen"],
    content: `<p>Data Oricon 2025 menunjukkan pergeseran tren manga — shonen tetap kuat tapi seinen mengalami growth tercepat di demografi 25–40 tahun.</p>
<h2>Top 5 Manga 2025 (Volume Sales)</h2>
<ol>
<li>One Piece — 12,4 juta volume</li>
<li>Jujutsu Kaisen — 8,1 juta volume</li>
<li>Blue Lock — 6,7 juta volume</li>
<li>Frieren: Beyond Journey's End — 5,9 juta volume</li>
<li>Dandadan — 5,2 juta volume</li>
</ol>
<h2>Tren Seinen</h2>
<p>Frieren dan Blue Period mewakili tren "healing" dan "passion-driven" narrative yang resonan dengan adult readers. Digital sales via Jump+ dan Manga Plus tumbuh 45%.</p>
<h2>Relevansi</h2>
<p>Toko manga Indonesia (Gramedia, Kinokuniya Jakarta) semakin stock seinen titles. Komunitas scanlation tetap aktif untuk titel yang belum licensed.</p>
<h2>Kesimpulan</h2>
<p>Industri manga 2025 = shonen dominance + seinen growth. Frieren adalah gateway seinen untuk pembaca shonen.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "Comiket 103: Panduan First-Timer untuk Pengunjung Indonesia",
    excerpt:
      "Comiket (Comic Market) adalah event doujinshi terbesar di dunia — panduan tiket, etika, dan tips untuk first-timer.",
    tags: ["doujinshi", "cosplay", "otaku"],
    content: `<p>Comiket 103 dijadwalkan 13–15 Desember 2026 di Tokyo Big Sight — event doujinshi (fan-made manga/novel/art) terbesar di dunia dengan 500.000+ pengunjung.</p>
<h2>Informasi Dasar</h2>
<p>Lokasi: Tokyo Big Sight, Ariake. Tiket: ¥500 catalog (wajib, beli online). Day 1–2: doujin circle (creator booths). Day 3: corporate booths (anime companies).</p>
<h2>Highlight</h2>
<p>35.000+ doujin circle menampilkan karya fan-made. Cosplay zone di outdoor area. Corporate booth Day 3: goods exclusive dan announcement anime baru.</p>
<h2>Tips Pengunjung</h2>
<ul>
<li>Datang 06:00 untuk popular circle (genba)</li>
<li>Bawa cash ¥10.000–¥30.000 untuk belanja doujin</li>
<li>Aturan foto: tanya izin circle sebelum foto booth</li>
<li>Download Comiket Catalog app untuk navigasi</li>
</ul>
<h2>Kesimpulan</h2>
<p>Comiket adalah mecca otaku culture. First-timer: fokus Day 3 corporate + explore doujin area sisa waktu.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "Spotify Wrapped Jepang 2025: Artis Lokal yang Meledak",
    excerpt:
      "YOASOBI, Ado, dan Creepy Nuts dominasi Spotify Japan Wrapped 2025 — tren dan rekomendasi playlist.",
    tags: ["j-pop", "otaku"],
    content: `<p>Spotify Japan merilis Wrapped 2025 dengan dominasi artis lokal across all genres — dari J-Pop hingga hip-hop.</p>
<h2>Top Artists Japan 2025</h2>
<ol>
<li>YOASOBI — "Idol" dan "Undead" soundtrack Oshi no Ko</li>
<li>Ado — "New Genesis" dan "Show" tetap streaming monster</li>
<li>Mrs. GREEN APPLE — "Soranji" dan "Lemonade"</li>
<li>Creepy Nuts — "Bling-Bang-Bang-Born" (Dandadan OP)</li>
<li>Official HIGE DANdism — "Subtitle" dan "Mixed Nuts"</li>
</ol>
<h2>Tren</h2>
<p>Anime tie-in songs mendominasi top 20 — Creepy Nuts dan Ado membuktikan anime OP/ED = gateway ke J-Pop mainstream.</p>
<h2>Rekomendasi Playlist</h2>
<p>Spotify "Japan Top 50" dan "Anime Now" — starting point untuk penggemar Indonesia yang ingin explore beyond anime OST.</p>
<h2>Kesimpulan</h2>
<p>J-Pop 2025 = anime crossover era. Artis yang punya anime tie-in mendapat exposure global via streaming.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "Anime Isekai 2026: Apakah Genre Ini Masih Relevan?",
    excerpt:
      "Setelah oversaturasi, isekai 2026 menawarkan subversi genre — analisis tren dan rekomendasi judul.",
    tags: ["isekai", "shonen"],
    content: `<p>Isekai (another world) pernah mendominasi 50%+ anime seasonal lineup. Di 2026, genre ini evolve atau stagnan?</p>
<h2>Sinopsis Genre</h2>
<p>Protagonist terlempar/dead/reincarnated ke dunia fantasy/game-like. Formula: OP power, harem, atau slice-of-life twist.</p>
<h2>Highlight 2026</h2>
<p>Judul subversif: "Isekai Office Worker" (comedy mundane), "Reincarnated as a Vending Machine Season 2" (absurdist), dan "Grimgar Season 2" (dark realistic).</p>
<h2>Fakta Menarik</h2>
<p>MyAnimeList data: isekai rating rata-rata turun dari 7.2 (2020) ke 6.8 (2025). Tapi viewership tetap tinggi — audience loyal meski kritis.</p>
<h2>Rekomendasi</h2>
<p>Skip generic isekai. Watch: Frieren (post-isekai), Mushoku Tensei (done right), dan Re:Zero (psychological).</p>
<h2>Kesimpulan</h2>
<p>Isekai still relevant tapi butuh fresh angle. 2026 = era subversi, bukan formula copy-paste.</p>`,
  },
  {
    category_slug: "entertainment",
    title: "Idol Group Baru dari AKB48 Sister: Debut dan Proyeksi",
    excerpt:
      "NGT48 meluncurkan sub-unit baru dengan konsep regional Hokuriku — profil member dan strategi marketing.",
    tags: ["j-pop", "cosplay", "otaku"],
    content: `<p>NGT48, sister group AKB48 based di Niigata, mengumumkan sub-unit baru "Hokuriku Sakura" dengan 8 member terpilih via audition internal.</p>
<h2>Info Terbaru</h2>
<p>Debut single "Kitakuni no Spring" dirilis 15 Juli 2026. Konsep: promosi budaya dan pariwisata region Hokuriku (Niigata, Toyama, Ishikawa).</p>
<h2>Profil Sub-unit</h2>
<p>8 member: mix veteran NGT48 dan kenkyusei (trainee). Center: Yamauchi Mizuki (19), viral di TikTok Japan dengan dance cover 2M views.</p>
<h2>Strategi</h2>
<p>Kolaborasi dengan JR East untuk tourism campaign dan merchandise exclusive di stasiun Hokuriku Shinkansen. Handshake event di Niigata, Toyama, Kanazawa.</p>
<h2>Kesimpulan</h2>
<p>Idol industry Jepang terus innovate dengan regional branding. Hokuriku Sakura = idol meets tourism marketing.</p>`,
  },

  // ── Lifestyle (5) ─────────────────────────────────────────────────────────
  {
    category_slug: "lifestyle",
    title: "Tren Fashion Harajuku 2026: Minimalis Meets Streetwear",
    excerpt:
      "Harajuku fashion scene 2026 — dari Decora revival hingga quiet luxury J-street yang diprediksi dominan.",
    tags: ["tokyo", "cosplay"],
    content: `<p>Harajuku tetap epicenter fashion Jepang, tapi tren 2026 menunjukkan shift dari maximalism ke "curated minimalism with streetwear edge".</p>
<h2>Penjelasan Tren</h2>
<p>Quiet luxury J-street: neutral palette (beige, grey, black), quality basics, satu statement piece. Brand lokal: AURALEE, N.Hoolywood, dan STUDIOUS picks.</p>
<h2>Contoh Nyata</h2>
<p>Takeshita Street masih Decora/kawaii untuk turis, tapi Cat Street dan Omotesando Hills showcase tren adult minimalis. Thrift shop Kindal dan Chicago booming.</p>
<h2>Tips Mencoba</h2>
<p>Belanja secondhand di Shimokitazawa atau Koenji (budget ¥3.000–¥10.000/item). Follow Instagram @harajuku.japan dan @tokyo.fashion for daily inspo.</p>
<h2>Kesimpulan</h2>
<p>Harajuku 2026 = less is more, tapi with personality. Explore beyond Takeshita untuk taste lokal yang autentik.</p>`,
  },
  {
    category_slug: "lifestyle",
    title: "Matcha Latte Fever: Kenapa Minuman Ini Viral di Indonesia",
    excerpt:
      "Matcha latte from Japan jadi tren F&B Indonesia — sejarah matcha, brand populer, dan resep DIY.",
    tags: ["tokyo", "ramen"],
    is_hot: true,
    content: `<p>Matcha latte — susu + matcha powder — menjadi fenomena F&B di Indonesia sejak 2024, dengan cafe chain lokal dan J-brand bersaing.</p>
<h2>Kenapa Populer</h2>
<p>Health conscious trend (antioxidant), aesthetic Instagram-worthy green, dan J-culture influence via anime dan social media Japan travel content.</p>
<h2>Brand Jepang Populer</h2>
<p>Ito En, AGF Blendy, dan Marukyu Koyamaen (Uji, Kyoto) — available via import store Tokyo Bello, Don Don Donki, dan e-commerce.</p>
<h2>Resep DIY</h2>
<p>1 tsp matcha powder + 30ml air panas (whisk) + 200ml susu (panas/dingin) + sweetener optional. Kunci: sift powder dan whisk hingga foamy.</p>
<h2>Kesimpulan</h2>
<p>Matcha latte = gateway J-culture lifestyle. Invest in quality Uji matcha (¥800–¥2.000/20g) for authentic taste.</p>`,
  },
  {
    category_slug: "lifestyle",
    title: "Filosofi Wabi-Sabi dalam Mendekorasi Ruang Hidup",
    excerpt:
      "Wabi-sabi — keindahan dalam ketidaksempurnaan — inspirasi dekorasi minimalis yang semakin populer di Indonesia.",
    tags: ["kanji", "onsen"],
    content: `<p>Wabi-sabi (侘寂) adalah estetika Jepang yang menemukan keindahan dalam imperfection, transience, and simplicity — semakin populer di interior design global.</p>
<h2>Penjelasan</h2>
<p>Wabi = kesederhanaan rustik. Sabi = keindahan waktu dan aging. Bersama: appreciate cracked ceramic, natural wood grain, dan patina waktu.</p>
<h2>Contoh Praktis</h2>
<ul>
<li>Furniture kayu reclaimed dengan grain visible</li>
<li>Ceramic handmade dengan glaze tidak uniform</li>
<li>Neutral palette: cream, grey, brown, green</li>
<li>One ikebana arrangement vs bouquet besar</li>
</ul>
<h2>Tips Mencoba</h2>
<p>Start small: ganti plastic decor dengan natural material. Beli ceramic lokal atau import Mino ware dari Japan. Less items, more intention.</p>
<h2>Kesimpulan</h2>
<p>Wabi-sabi bukan about buying expensive — it's about mindset shift toward appreciating imperfection.</p>`,
  },
  {
    category_slug: "lifestyle",
    title: "Kaizen di Kehidupan Sehari-hari: Adaptasi Gaya Hidup Jepang",
    excerpt:
      "Kaizen (改善) — perbaikan berkelanjutan — prinsip produktivitas Jepang yang bisa diadaptasi untuk kehidupan daily.",
    tags: ["kanji", "tokyo"],
    content: `<p>Kaizen (改善), literally "change for better", adalah filosofi perbaikan continuous yang merevolusi industri Jepang pasca-WWII — dan applicable untuk personal life.</p>
<h2>Penjelasan</h2>
<p>Bukan big dramatic change, tapi small daily improvements yang compound over time. Toyota Production System = origin, tapi principles universal.</p>
<h2>Contoh Nyata</h2>
<ul>
<li>5S workspace: Sort, Set, Shine, Standardize, Sustain</li>
<li>1% improvement daily: baca 10 halaman, 10 push-up, 5 menit meditasi</li>
<li>PDCA cycle: Plan-Do-Check-Act untuk habit baru</li>
</ul>
<h2>Tips Mencoba</h2>
<p>Pilih satu area (morning routine, desk setup, health). Improve 1% per minggu. Track via simple journal, bukan complex app.</p>
<h2>Kesimpulan</h2>
<p>Kaizen = anti-burnout productivity. Small steps, long game — very Japanese, very effective.</p>`,
  },
  {
    category_slug: "lifestyle",
    title: "Produk Viral Don Quijote yang Wajib Dibeli Wisatawan",
    excerpt:
      "Don Quijote (Donki) — discount store ikonik Jepang. 10 produk viral yang wajib masuk shopping list.",
    tags: ["tokyo", "gacha", "ramen"],
    content: `<p>Don Quijote (ドン・キホーテ) adalah discount store 24 jam dengan 600+ lokasi di Jepang — paradise untuk oleh-oleh budget-friendly.</p>
<h2>10 Produk Viral</h2>
<ol>
<li>Kit Kat flavor regional (matcha, sake, strawberry cheesecake)</li>
<li>Tokyo Banana & kinno zuwaigani (crab flavor)</li>
<li>Rohto eye drops (cooling sensation legend)</li>
<li>Shiroi Koibito (Hokkaido white chocolate)</li>
<li>Ana Donki exclusive snacks</li>
<li>Daiso collaboration goods</li>
<li>Japanese sunscreen (Biore, Anessa) — cheaper than Indonesia</li>
<li>Safety razors & beauty tools</li>
<li>Gacha capsules near exit</li>
<li>Matcha & hojicha powder bulk</li>
</ol>
<h2>Tips</h2>
<p>Tax-free counter (passport required, min ¥5.000). Shibuya Mega Don Quijote = 24 jam, 8 floors. Allocate 1–2 jam minimum.</p>
<h2>Kesimpulan</h2>
<p>Don Quijote = one-stop omiyage shop. Budget ¥5.000–¥20.000 untuk haul yang satisfying.</p>`,
  },

  // ── Work in Japan (4) ─────────────────────────────────────────────────────
  {
    category_slug: "work-in-japan",
    title: "Panduan Lengkap SSW (Specified Skilled Worker) untuk WNI",
    excerpt:
      "Visa Specified Skilled Worker (SSW) — syarat, 12 sektor, gaji, dan langkah apply untuk pekerja Indonesia.",
    tags: ["tokyo", "kanji"],
    is_featured: true,
    content: `<p>Specified Skilled Worker (特定技能, Tokutei Ginou) adalah visa kerja Jepang untuk tenaga terampil di 12 sektor prioritas — salah satu jalur utama WNI bekerja legal di Jepang.</p>
<h2>Gambaran Peluang</h2>
<p>SSW dibagi SSW1 (max 5 tahun, 12 sektor) dan SSW2 (unlimited, 2 sektor: construction dan shipbuilding). Indonesia termasuk negara prioritas sending.</p>
<h2>Syarat & Kualifikasi</h2>
<ul>
<li>Usia 18+ (generally under 40 preferred)</li>
<li>Lulus ujian skill + bahasa Jepang (N4 minimum, tergantung sektor)</li>
<li>Pass medical check</li>
<li>Memiliki Supporting Organization di Jepang</li>
</ul>
<h2>Gaji & Benefit</h2>
<p>Gaji setara pekerja Jepang (min upah minimum prefektur). Benefit: health insurance, pension (partial), paid leave. Caregiving: ¥180.000–¥250.000/month starting.</p>
<h2>Cara Apply</h2>
<p>Via LPJK-approved agency Indonesia → training (3–6 bulan) → ujian skill & bahasa → COE (Certificate of Eligibility) → visa di Kedutaan Jepang.</p>
<h2>Kesimpulan</h2>
<p>SSW adalah jalur legal dan terstruktur. Research agency resmi via portal Kemnaker RI dan cek track record sebelum commit.</p>`,
  },
  {
    category_slug: "work-in-japan",
    title: "Tips Interview Kerja di Perusahaan Jepang: Do's and Don'ts",
    excerpt:
      "Interview kerja Jepang — dari persiapan jikoshokai, dress code, hingga pertanyaan yang sering muncul.",
    tags: ["kanji", "tokyo"],
    content: `<p>Interview di perusahaan Jepang — baik via SSW, engineer visa, atau internal transfer — punya etiquette spesifik yang harus dipahami.</p>
<h2>Persiapan</h2>
<p><strong>Do:</strong> Research company (annual report, products, recent news). Siapkan jikoshokai (自己紹介, self-intro) 1–2 menit dalam bahasa Jepang. Print resume J-format (rirekisho + shokumu keirekisho).</p>
<p><strong>Don't:</strong> Terlambat (aim 10 menit early). Lupa melepas sepatu di entrance (jika applicable).</p>
<h2>During Interview</h2>
<p><strong>Do:</strong> Bow saat masuk/keluar. Eye contact moderate (not staring). Jawab dengan struktur: conclusion first, then reason. Tanyakan 1–2 thoughtful questions di akhir.</p>
<p><strong>Don't:</strong> Critique former employer. Overshare personal life. Nego gaji di first interview (unless asked).</p>
<h2>Pertanyaan Umum</h2>
<p>"Naze Nihon?" (Why Japan?), "Naze kono kaisha?" (Why this company?), "Choushi wa dou desu ka?" (How do you handle pressure?).</p>
<h2>Kesimpulan</h2>
<p>Interview Jepang = test attitude + communication, not just skill. Practice jikoshokai dan mock interview dengan native speaker.</p>`,
  },
  {
    category_slug: "work-in-japan",
    title: "Budaya Kerja Kuuki wo Yomu: Membaca Suasana Kantor Jepang",
    excerpt:
      "Kuuki wo yomu (空気を読む) — 'membaca udara' — skill sosial crucial di workplace Jepang.",
    tags: ["kanji", "tokyo"],
    content: `<p>Kuuki wo yomu (空気を読む), literally "read the air", adalah kemampuan membaca situasi sosial dan bertindak sesuai konteks — skill #1 di workplace Jepang.</p>
<h2>Gambaran</h2>
<p>Bukan tentang being fake — ini tentang harmony (wa/和) dan tidak menimbulkan inconvenience untuk group. Failure to read air = KY (kuuki yomenai).</p>
<h2>Contoh Praktis</h2>
<ul>
<li>Semua overtime? Don't leave first unless permitted</li>
<li>Boss tidak langsung bilang "no" — baca indirect refusal</li>
<li>Nomikai (drinking party): attend jika bisa, tapi tidak wajib minum</li>
<li>Reply email/chat promptly, even if just "承知しました"</li>
</ul>
<h2>Tips untuk WNI</h2>
<p>Observe before act. Tanya senior (senpai) untuk unwritten rules. Jangan assume Western directness = respect — adapt communication style.</p>
<h2>Kesimpulan</h2>
<p>Kuuki wo yomu takes time to learn. Be patient, observe, ask — Jepang rewards long-term relationship building.</p>`,
  },
  {
    category_slug: "work-in-japan",
    title: "Gaji dan Benefit Pekerja Asing di Sektor Perawatan Jepang",
    excerpt:
      "Breakdown gaji, overtime, dan benefit pekerja caregiving (kaigo) asing di Jepang — data 2026.",
    tags: ["tokyo", "kanji"],
    content: `<p>Sektor perawatan lansia (kaigo/介護) adalah salah satu sektor SSW dengan demand tertinggi untuk pekerja asing, termasuk Indonesia.</p>
<h2>Gambaran Gaji</h2>
<p>Starting salary: ¥180.000–¥250.000/month (tergantung prefektur). Tokyo/Osaka: ¥220.000–¥280.000. Overtime (zangyo): ¥1.500–¥2.000/jam additional.</p>
<h2>Benefit Standar</h2>
<ul>
<li>Health insurance (shakai hoken) — employer covers 50%</li>
<li>Paid leave: 10 days/year (after 6 months)</li>
<li>Bonus: 1–2x/year (¥100.000–¥300.000, varies)</li>
<li>Housing support: dormitory ¥20.000–¥40.000/month</li>
</ul>
<h2>Potongan</h2>
<p>Tax (~10%), pension (~9%), health insurance (~5%). Net take-home: ~75–80% of gross.</p>
<h2>Kesimpulan</h2>
<p>Caregiving = stable income dengan benefit legal. Compare offer dari multiple agencies sebelum sign contract.</p>`,
  },

  // ── Study in Japan (4) ────────────────────────────────────────────────────
  {
    category_slug: "study-in-japan",
    title: "Beasiswa MEXT 2027: Timeline dan Persyaratan untuk Pelamar Indonesia",
    excerpt:
      "Monbukagakusho (MEXT) scholarship 2027 — jadwal apply, syarat, dan tips lulus seleksi untuk WNI.",
    tags: ["kanji", "tokyo"],
    is_featured: true,
    content: `<p>MEXT (Ministry of Education, Culture, Sports, Science and Technology) scholarship adalah beasiswa fully-funded pemerintah Jepang — gold standard untuk study in Japan.</p>
<h2>Kenapa Penting</h2>
<p>Covers tuition, living allowance (¥117.000–¥145.000/month), dan tiket pesawat. Research student, undergraduate, dan graduate programs available.</p>
<h2>Timeline 2027 (Graduate)</h2>
<ul>
<li>April 2026: Announcement via Kedutaan Jepang Indonesia</li>
<li>Mei–Juni 2026: Submit application documents</li>
<li>Agustus 2026: Written exam + interview (Jakarta)</li>
<li>Oktober 2026: Result announcement</li>
<li>April 2027: Arrival in Japan</li>
</ul>
<h2>Persyaratan</h2>
<p>WNI, usia under 35 (graduate), bachelor degree, health good. JLPT N2+ recommended (N1 for competitive fields).</p>
<h2>Tips</h2>
<p>Research proposal = kunci. Contact potential supervisor di universitas Jepang sebelum apply. Bahasa Jepang = strong advantage.</p>
<h2>Kesimpulan</h2>
<p>MEXT competitive tapi achievable. Start prep 12 bulan sebelum deadline.</p>`,
  },
  {
    category_slug: "study-in-japan",
    title: "Biaya Hidup Mahasiswa di Tokyo vs Osaka: Perbandingan 2026",
    excerpt:
      "Perbandingan biaya akomodasi, makan, transport, dan total monthly budget mahasiswa di Tokyo dan Osaka.",
    tags: ["tokyo", "kyoto", "ramen"],
    content: `<p>Memilih kota study di Jepang significantly impact budget. Tokyo vs Osaka — perbandingan biaya hidup mahasiswa 2026.</p>
<h2>Akomodasi</h2>
<p>Tokyo (share house): ¥55.000–¥80.000/month. Osaka: ¥35.000–¥55.000/month. University dorm: ¥25.000–¥45.000 (both cities, limited slots).</p>
<h2>Makan</h2>
<p>Self-cook: ¥25.000–¥35.000/month. Eat out mix: ¥40.000–¥60.000. Konbini + gyudon lifestyle: ¥30.000–¥40.000.</p>
<h2>Transport</h2>
<p>Tokyo student commuter pass: ¥5.000–¥10.000/month. Osaka: ¥3.000–¥7.000. Bicycle = free alternative.</p>
<h2>Total Monthly Budget</h2>
<p>Tokyo: ¥100.000–¥150.000. Osaka: ¥70.000–¥110.000. Difference: ~¥30.000–¥40.000/month.</p>
<h2>Kesimpulan</h2>
<p>Osaka = 25–30% cheaper dengan kualitas pendidikan comparable. Tokyo = opportunity dan network lebih besar.</p>`,
  },
  {
    category_slug: "study-in-japan",
    title: "Panduan Apply Sekolah Bahasa Jepang untuk Pemula",
    excerpt:
      "Cara memilih dan apply language school (Nihongo gakkou) di Jepang — visa, biaya, dan rekomendasi kota.",
    tags: ["kanji", "tokyo"],
    content: `<p>Language school (Nihongo gakkou/日本語学校) adalah jalur populer untuk belajar bahasa Jepang intensif di Jepang — 1–2 tahun sebelum lanjut university atau kerja.</p>
<h2>Jenis Sekolah</h2>
<p>University-affiliated, private large chain (ISI, ARC, GenkiJACS), dan boutique school. Accreditation: Association for Promotion of Japanese Language Education.</p>
<h2>Biaya</h2>
<p>Tuition: ¥700.000–¥900.000/year (1-year course). Application fee: ¥20.000–¥50.000. Material: ¥30.000–¥50.000.</p>
<h2>Cara Apply</h2>
<p>Choose school → submit application (6–9 months before intake) → school applies COE on your behalf → visa at embassy. Intake: April and October main.</p>
<h2>Tips JLPT</h2>
<p>Intensive course (20 hours/week): N5→N3 in 1 year, N3→N2 in 1 year possible with dedication.</p>
<h2>Kesimpulan</h2>
<p>Language school = foundation untuk study/work di Jepang. Research school visa track record dan graduate outcomes.</p>`,
  },
  {
    category_slug: "study-in-japan",
    title: "Tips Persiapan JLPT N3 dalam 6 Bulan",
    excerpt:
      "Roadmap belajar JLPT N3 dari nol atau N4 — materi, resources, dan study schedule 6 bulan.",
    tags: ["kanji", "tokyo"],
    content: `<p>JLPT N3 adalah level intermediate yang dibutuhkan banyak employer dan university di Jepang. Target 6 bulan achievable dengan study plan terstruktur.</p>
<h2>Scope N3</h2>
<p>~3.750 vocabulary, ~650 kanji, grammar intermediate. Reading: short articles, emails. Listening: everyday conversation at natural speed.</p>
<h2>Schedule 6 Bulan</h2>
<ul>
<li>Bulan 1–2: Minna no Nihongo II / Genki II finish. Anki vocabulary 30 words/day.</li>
<li>Bulan 3–4: Shin Kanzen N3 (Grammar, Reading, Listening). Past papers weekly.</li>
<li>Bulan 5: Mock tests, weak area focus.</li>
<li>Bulan 6: Review + final mock tests. Test day: July or December.</li>
</ul>
<h2>Resources</h2>
<p>Shin Kanzen Master N3 series, JLPT Sensei website, Bunpro for grammar, Anki Core 2k/6k deck.</p>
<h2>Kesimpulan</h2>
<p>Consistency &gt; intensity. 2 hours/day × 6 months = N3 pass realistic untuk dedicated learner.</p>`,
  },

  // ── Review Produk (4) ─────────────────────────────────────────────────────
  {
    category_slug: "review-produk",
    title: "Review FamilyMart Onigiri Terenak: Ranking 5 Rasa Wajib Coba",
    excerpt:
      "Ranking 5 onigiri FamilyMart terbaik — dari salmon mentai hingga beef yakiniku, plus harga dan availability.",
    tags: ["ramen", "sushi", "tokyo"],
    is_hot: true,
    content: `<p>Onigiri (rice ball) adalah staple konbini Jepang. FamilyMart consistently ranked top for onigiri quality — ini 5 rasa wajib coba.</p>
<h2>Ranking</h2>
<ol>
<li><strong>Salmon Mentai (鮭明太)</strong> — ¥165. Creamy mentai mayo + grilled salmon. Best seller.</li>
<li><strong>Tuna Mayo (ツナマヨ)</strong> — ¥149. Classic, reliable, perfect ratio.</li>
<li><strong>Beef Yakiniku (焼肉)</strong> — ¥159. Sweet-savory beef, filling.</li>
<li><strong>Okaka (おかか)</strong> — ¥139. Bonito flake + soy, traditional taste.</li>
<li><strong>Shrimp Tempura (海老天)</strong> — ¥169. Crispy tempura inside, limited seasonal.</li>
</ol>
<h2>Kelebihan</h2>
<p>Fresh daily restock, seaweed separated (crispy!), affordable, available 24/7.</p>
<h2>Kekurangan</h2>
<p>Popular flavors sell out by evening. Limited vegetarian options.</p>
<h2>Kesimpulan</h2>
<p>Onigiri FamilyMart = must-try konbini experience. Budget ¥500 for 3-piece meal.</p>`,
  },
  {
    category_slug: "review-produk",
    title: "Review Skincare Jepang: Hada Labo Gokujyun untuk Kulit Tropis",
    excerpt:
      "Hada Labo Gokujyun lotion & milk — apakah cocok untuk kulit Indonesia? Review honest setelah 3 bulan pemakaian.",
    tags: ["tokyo", "ramen"],
    content: `<p>Hada Labo Gokujyun (肌ラボ 極潤) adalah skincare drugstore Jepang legendaris dengan hyaluronic acid focus — apakah work untuk kulit tropis Indonesia?</p>
<h2>Produk</h2>
<p>Gokujyun Lotion (toner): ¥700–¥900. Gokujyun Milk (moisturizer): ¥800–¥1.000. Available at Matsumoto Kiyoshi, Don Quijote, and Indonesia import stores.</p>
<h2>Kelebihan</h2>
<ul>
<li>Hyaluronic acid (3 types) — hydration without heaviness</li>
<li>Fragrance-free, no alcohol (regular line)</li>
<li>Affordable, one bottle lasts 2–3 months</li>
<li>Layering method compatible (J-beauty routine)</li>
</ul>
<h2>Kekurangan</h2>
<p>Not enough for very dry skin in AC room. Need additional moisturizer in dry season. Some products contain alcohol (check label).</p>
<h2>Kesimpulan</h2>
<p>Worth it untuk oily/combination skin tropis. Rating: 4.5/5. Pair dengan sunscreen untuk complete routine.</p>`,
  },
  {
    category_slug: "review-produk",
    title: "Review Nintendo Switch 2 Pro Controller: Worth It?",
    excerpt:
      "Hands-on preview controller Switch 2 — ergonomi, battery life, HD rumble, dan perbandingan dengan Pro Controller gen 1.",
    tags: ["retro-game", "gacha"],
    content: `<p>Nintendo Switch 2 Pro Controller diumumkan sebagai companion launch Switch 2 — apakah worth the upgrade dari Pro Controller original?</p>
<h2>Deskripsi</h2>
<p>Ergonomic grip redesigned, Hall effect sticks (no drift), 40-hour battery, HD rumble gen 2, back paddle buttons (programmable).</p>
<h2>Kelebihan</h2>
<ul>
<li>Hall effect sticks = no drift issue</li>
<li>40-hour battery vs 25-hour original</li>
<li>Back paddles for competitive gaming</li>
<li>USB-C charging, faster pairing</li>
</ul>
<h2>Kekurangan</h2>
<p>Price: ¥8.980 (vs ¥7.480 original). Not backward compatible with Switch 1 games (rumored). Larger form factor may not suit small hands.</p>
<h2>Kesimpulan</h2>
<p>Worth it jika Switch 2 owner dan play competitive/frequent. Skip jika Switch 1 only. Rating: 4/5.</p>`,
  },
  {
    category_slug: "review-produk",
    title: "Ole-oleh Jepang Terbaik 2026: Dari Snack hingga Craft",
    excerpt:
      "Curated list oleh-oleh Jepang terbaik 2026 — snack, beauty, craft, dan budget guide untuk wisatawan Indonesia.",
    tags: ["tokyo", "ramen", "sushi"],
    content: `<p>Ole-oleh (omiyage/お土産) adalah ritual Jepang. Ini curated list terbaik 2026 across budget ranges.</p>
<h2>Snack (¥500–¥2.000)</h2>
<p>Tokyo Banana, Shiroi Koibito, Kit Kat regional flavors, Jaga Pokkuru (Hokkaido potato), Royce chocolate.</p>
<h2>Beauty (¥500–¥3.000)</h2>
<p>Hada Labo lotion, Biore sunscreen, Canmake makeup, Salonpas patches, Lion toothpaste.</p>
<h2>Craft (¥1.000–¥10.000)</h2>
<p>Nambu tekki (ironware), Mino yaki ceramic, Tenugui towel, Japanese stationery (Midori, Hobonichi).</p>
<h2>Budget Guide</h2>
<p>Light shopper: ¥5.000. Standard: ¥10.000–¥20.000. Serious omiyage haul: ¥30.000+. Tax-free at Don Quijote, Matsumoto Kiyoshi.</p>
<h2>Kesimpulan</h2>
<p>Best strategy: buy regional specialty at source (not Tokyo) + bulk snack at Don Quijote last day.</p>`,
  },

  // ── Event (4) ─────────────────────────────────────────────────────────────
  {
    category_slug: "event",
    title: "Kyoto Arashiyama Hanatouro 2026: Illuminasi Musim Dingin",
    excerpt:
      "Hanatouro illumination di Arashiyama Kyoto — jadwal Desember 2026, spot foto, dan tips berkunjung malam.",
    tags: ["kyoto", "sakura"],
    is_hot: true,
    content: `<p>Kyoto Arashiyama Hanatouro adalah festival illuminasi musim dingin yang menerangi bamboo grove, kuil, dan jalan-jalan Arashiyama dengan lentera dan light installation.</p>
<h2>Informasi Dasar</h2>
<p>Tanggal: 12–21 Desember 2026 (estimasi). Lokasi: Arashiyama area (Togetsukyo, bamboo grove, Nisonin Temple). Jam: 17:00–20:30. Gratis (beberapa kuil ¥500).</p>
<h2>Highlight</h2>
<p>Bamboo grove illuminated with warm lanterns — magical atmosphere. Togetsukyo Bridge light reflection. Traditional performance at Nisonin Temple.</p>
<h2>Tips Pengunjung</h2>
<ul>
<li>Wear warm layers (5–8°C at night)</li>
<li>Arrive 17:00 for fewer crowds</li>
<li>Combine with day visit to Tenryu-ji</li>
<li>Access: JR Saga-Arashiyama or Randen Arashiyama station</li>
</ul>
<h2>Kesimpulan</h2>
<p>Hanatouro = hidden gem winter Kyoto. Less crowded than spring/autumn peak seasons.</p>`,
  },
  {
    category_slug: "event",
    title: "Tokyo Game Show 2026: Highlight dan Tips Pengunjung",
    excerpt:
      "TGS 2026 di Makuhari Messe — ticket info, booth highlights, cosplay zone, dan tips first-timer.",
    tags: ["retro-game", "cosplay", "otaku"],
    is_featured: true,
    content: `<p>Tokyo Game Show (TGS) 2026 dijadwalkan 25–28 September di Makuhari Messe, Chiba — event game terbesar Asia.</p>
<h2>Informasi Dasar</h2>
<p>Public days: 27–28 September. Business days: 25–26. Ticket: ¥2.500/day (pre-sale online). Location: Kaihin-Makuhari Station (JR Keiyo Line, 30 min from Tokyo Station).</p>
<h2>Highlight</h2>
<p>Major booths: Sony, Nintendo, Square Enix, Capcom, Bandai Namco, indie area (100+ titles). Cosplay zone outdoor. Stage events: game announcements, esports.</p>
<h2>Tips Pengunjung</h2>
<ul>
<li>Buy ticket online — sell out fast</li>
<li>Arrive 08:00 for popular booth demo slots</li>
<li>Bring cash for merchandise (some booths cash-only)</li>
<li>Wear comfortable shoes — massive venue</li>
</ul>
<h2>Kesimpulan</h2>
<p>TGS = must for gamers visiting Japan in September. Combine with Akihabara pilgrimage.</p>`,
  },
  {
    category_slug: "event",
    title: "SUMMER SONIC 2026: Line-up dan Informasi Tiket",
    excerpt:
      "Summer Sonic 2026 di Osaka & Tokyo — headliner, harga tiket, dan panduan untuk pengunjung internasional.",
    tags: ["j-pop", "tokyo", "cosplay"],
    content: `<p>Summer Sonic 2026 — two-day music festival di Osaka (16 Aug) dan Tokyo (17 Aug) — one of Asia's premier music events.</p>
<h2>Informasi Dasar</h2>
<p>Osaka: Maishima Sonic Park. Tokyo: Zozo Marine Stadium (Chiba). Ticket: ¥22.000–¥25.000/day. Sale: May 2026 via Lawson Ticket.</p>
<h2>Headliner (Confirmed)</h2>
<p>YOASOBI, Mrs. GREEN APPLE, King Gnu, Ado, [Alexandros], Creepy Nuts.</p>
<h2>Tips Pengunjung</h2>
<p>Book hotel near venue 2–3 months ahead. Cash for food stalls. Download festival map app. Sunscreen + hydration essential for August heat.</p>
<h2>Kesimpulan</h2>
<p>Summer Sonic = premium J-music festival experience. Tokyo day recommended for first-timers (easier access).</p>`,
  },
  {
    category_slug: "event",
    title: "Festival Nebuta Aomori: Panduan Musim Panas Utara Jepang",
    excerpt:
      "Nebuta Matsuri Aomori — parade float raksasa 2–7 Agustus 2026, sejarah, dan tips berkunjung.",
    tags: ["sakura", "samurai", "tokyo"],
    content: `<p>Nebuta Matsuri di Aomori Prefecture adalah festival musim panas spektakuler dengan parade float raksasa (nebuta) berukuran hingga 9 meter, diiringi taiko dan dancer (haneto).</p>
<h2>Informasi Dasar</h2>
<p>Tanggal: 2–7 Agustus 2026. Lokasi: Jalan utama Aomori City. Parade: 19:10–21:00 (2–6 Aug), final day 13:00–15:00 (daytime). Gratis menonton dari sidewalk.</p>
<h2>Highlight</h2>
<p>24 nebuta floats dengan desain mythological/ historical figures. Haneto dancers invite spectators to join ("rassera!"). Fireworks on final night.</p>
<h2>Tips Pengunjung</h2>
<ul>
<li>Book shinkansen + hotel 2–3 months ahead (peak season)</li>
<li>Join as haneto (rent costume ¥4.000 at tourist info)</li>
<li>Try local specialty: Aomori apple products, ichigo-ni (sea urchin soup)</li>
<li>Combine with Oirase Gorge day trip</li>
</ul>
<h2>Kesimpulan</h2>
<p>Nebuta Matsuri = top 3 festival Jepang. Worth the trip to northern Japan in August.</p>`,
  },
];

/** Status mix untuk demo workflow editorial */
const STATUS_OVERRIDES = {
  45: "PENDING_REVIEW",
  46: "DRAFT",
  47: "REJECTED",
  48: "ARCHIVED",
};

const SAMPLE_ARTICLES = ARTICLE_DEFS.map((def, index) =>
  article(
    { ...def, status: STATUS_OVERRIDES[index] ?? def.status },
    index,
  ),
);

module.exports = SAMPLE_ARTICLES;
