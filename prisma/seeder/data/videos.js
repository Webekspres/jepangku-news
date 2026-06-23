/**
 * Sample Jepangku TV videos — public YouTube embeds (budaya & lifestyle Jepang).
 * Idempotent: seed uses upsert on slug.
 * YouTube IDs verified via oEmbed API (embeddable & available).
 */

function videoContent(intro, sections) {
  const body = sections
    .map(
      (section) =>
        `<h2>${section.heading}</h2><p>${section.paragraph}</p>`,
    )
    .join("");
  return `<p>${intro}</p>${body}`;
}

const VIDEOS_DATA = [
  {
    slug: "panduan-wisata-tokyo-pemula",
    title: "Panduan Wisata Tokyo untuk Pemula",
    description:
      "Tips perjalanan pertama ke Tokyo — transportasi, akomodasi, dan spot wajib kunjung untuk traveler Indonesia.",
    content: videoContent(
      "Tokyo bisa terasa overwhelming untuk pertama kali, tetapi dengan persiapan yang tepat kota ini sangat ramah bagi wisatawan. Video ini merangkum hal-hal dasar yang perlu kamu ketahui sebelum berangkat.",
      [
        {
          heading: "Transportasi dari bandara",
          paragraph:
            "Gunakan Narita Express, Keisei Skyliner, atau bus langsung ke pusat kota. Beli kartu Suica atau Pasmo di bandara agar perjalanan kereta dan bus lebih praktis.",
        },
        {
          heading: "Area menginap yang disarankan",
          paragraph:
            "Shinjuku dan Shibuya cocok untuk akses kereta. Asakusa lebih tenang dan dekat kuil. Pilih berdasarkan itinerary harianmu.",
        },
        {
          heading: "Spot wajib kunjung",
          paragraph:
            "Senso-ji, Shibuya Crossing, Meiji Shrine, dan teamLab adalah kombinasi klasik untuk kunjungan pertama. Sisihkan satu hari untuk eksplorasi bebas di sekitar stasiun utama.",
        },
      ],
    ),
    youtubeId: "g92DEa3uLio",
    status: "PUBLISHED",
    isFeatured: true,
    viewCount: 12840,
    daysAgo: 2,
  },
  {
    slug: "makanan-jalanan-kyoto",
    title: "Makanan Jalanan Kyoto yang Wajib Dicoba",
    description:
      "Jelajahi pasar tradisional dan street food ikonik Kyoto — dari dango hingga yuba segar.",
    content: videoContent(
      "Kyoto bukan hanya tentang kuil dan taman zen — pasar tradisionalnya menyimpan banyak camilan legendaris yang sulit ditemukan di kota lain.",
      [
        {
          heading: "Nishiki Market",
          paragraph:
            "Dikenal sebagai dapur Kyoto, pasar ini menawarkan yuba segar, tsukemono, dan matcha dessert. Datang pagi hari untuk pengalaman terbaik.",
        },
        {
          heading: "Camilan klasik",
          paragraph:
            "Coba dango manis, taiyaki isi kacang merah, dan yatsuhashi. Banyak penjual yang sudah beroperasi puluhan tahun dengan resep turun-temurun.",
        },
      ],
    ),
    youtubeId: "W2E8X7ckRHM",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 8650,
    daysAgo: 5,
    useYoutubeThumbnail: true,
  },
  {
    slug: "etika-onsen-jepang",
    title: "Budaya Onsen: Etika yang Perlu Diketahui",
    description:
      "Panduan singkat tata krama di pemandian air panas Jepang agar pengalamanmu nyaman dan sopan.",
    content: videoContent(
      "Onsen adalah pengalaman budaya, bukan sekadar mandi. Memahami etika dasar akan membuatmu dan pengunjung lain merasa nyaman.",
      [
        {
          heading: "Sebelum masuk kolam",
          paragraph:
            "Cuci tubuh menyeluruh di area khusus sebelum berendam. Handuk kecil tidak boleh masuk ke air panas — letakkan di kepala atau pinggir kolam.",
        },
        {
          heading: "Tato dan aturan lainnya",
          paragraph:
            "Beberapa onsen menolak pengunjung bertato. Selalu baca peraturan fasilitas dan hormati zona gender yang ditetapkan.",
        },
      ],
    ),
    youtubeId: "pMvF2F_UEWI",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 5420,
    daysAgo: 8,
  },
  {
    slug: "anime-manga-tokyo-guide",
    title: "Anime & Manga: Spot Terbaik di Tokyo",
    description:
      "Dari Akihabara hingga Nakano Broadway — rekomendasi untuk penggemar anime dan manga.",
    content: videoContent(
      "Tokyo adalah surga bagi penggemar anime dan manga. Setiap distrik menawarkan pengalaman berbeda, dari toko merchandise hingga kafe tematik.",
      [
        {
          heading: "Akihabara",
          paragraph:
            "Pusat elektronik dan otaku culture. Kunjungi toko multi-lantai seperti Animate dan Mandarake untuk merchandise langka.",
        },
        {
          heading: "Nakano Broadway",
          paragraph:
            "Alternatif yang lebih intim dengan koleksi figure, manga bekas, dan barang koleksi vintage. Harga sering lebih kompetitif daripada distrik utama.",
        },
      ],
    ),
    youtubeId: "cs_T7z7K9QI",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 15320,
    daysAgo: 12,
    useYoutubeThumbnail: true,
  },
  {
    slug: "kehidupan-sehari-hari-jepang",
    title: "Kehidupan Sehari-hari di Jepang",
    description:
      "Cuplikan rutinitas, kereta, konbini, dan kebiasaan unik masyarakat Jepang modern.",
    content: videoContent(
      "Kehidupan sehari-hari di Jepang dipenuhi ritme yang konsisten — dari kereta tepat waktu hingga kebiasaan kecil yang membentuk budaya kerja dan sosial.",
      [
        {
          heading: "Rutinitas pagi",
          paragraph:
            "Banyak pekerja bergantung pada kereta komuter dan sarapan cepat di konbini. Stasiun menjadi pusat aktivitas sejak pagi buta.",
        },
        {
          heading: "Konbini sebagai infrastruktur",
          paragraph:
            "Selain makanan, konbini menawarkan pembayaran tagihan, pengiriman paket, dan ATM. Ini bagian penting dari kehidupan urban Jepang.",
        },
      ],
    ),
    youtubeId: "6tmjXp_AYg0",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 22100,
    daysAgo: 18,
  },
  {
    slug: "natsu-matsuri-festival",
    title: "Festival Musim Panas (Natsu Matsuri) di Jepang",
    description:
      "Suasana matsuri musim panas — yukata, kembang api, dan stan makanan khas festival.",
    content: videoContent(
      "Natsu matsuri adalah salah satu momen paling hidup di kalender Jepang. Kota-kota kecil maupun besar mengadakan perayaan dengan kembang api spektakuler.",
      [
        {
          heading: "Mengenakan yukata",
          paragraph:
            "Musim panas adalah waktu ideal memakai yukata. Banyak toko menyewakan set lengkap termasuk aksesori dan sandal geta.",
        },
        {
          heading: "Stan makanan festival",
          paragraph:
            "Takoyaki, yakitori, kakigori, dan permainan tradisional memenuhi jalanan. Siapkan uang tunai karena banyak penjual tidak menerima kartu.",
        },
      ],
    ),
    youtubeId: "TrnY4qn1ynU",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 9870,
    daysAgo: 25,
    useYoutubeThumbnail: true,
  },
  {
    slug: "draft-video-halal-jepang",
    title: "[Draf] Kuliner Halal di Jepang",
    description: "Episode mendatang tentang restoran halal dan tips makan aman di Jepang.",
    content: videoContent(
      "Episode ini masih dalam tahap produksi. Kami sedang mengumpulkan rekomendasi restoran halal di Tokyo, Osaka, dan Kyoto.",
      [
        {
          heading: "Yang akan dibahas",
          paragraph:
            "Aplikasi pencari makanan halal, label bahan dalam bahasa Jepang, dan restoran populer di kalangan komunitas Muslim di Jepang.",
        },
      ],
    ),
    youtubeId: "afbKIEjuEos",
    status: "DRAFT",
    isFeatured: false,
    viewCount: 0,
    daysAgo: 0,
  },
  {
    slug: "jepang-8k-ultra-hd",
    title: "Jepang dalam 8K Ultra HD",
    description:
      "Pemandangan ikonik Jepang — Fuji, Kyoto, Tokyo — dalam resolusi ultra tinggi.",
    content: videoContent(
      "Video ini menampilkan keindahan visual Jepang dalam resolusi tinggi — dari puncak Fuji hingga jalanan Kyoto yang tenang di pagi hari.",
      [
        {
          heading: "Pemandangan alam",
          paragraph:
            "Gunung Fuji, danau Kawaguchi, dan hutan bambu Arashiyama menjadi sorotan utama dengan detail visual yang memukau.",
        },
        {
          heading: "Kota modern",
          paragraph:
            "Skyline Tokyo di malam hari menunjukkan kontras menarik antara tradisi dan modernitas yang menjadi ciri khas Jepang.",
        },
      ],
    ),
    youtubeId: "UOxkGD8qRB4",
    status: "PUBLISHED",
    isFeatured: true,
    viewCount: 31450,
    daysAgo: 3,
  },
  {
    slug: "street-food-osaka-dotonbori",
    title: "Street Food Legendaris di Dotonbori Osaka",
    description:
      "Takoyaki, okonomiyaki, dan jajanan malam khas Osaka di kawasan Dotonbori.",
    content: videoContent(
      "Dotonbori adalah jantung kuliner Osaka. Lampu neon, aroma takoyaki, dan hiruk pikuk pengunjung menciptakan atmosfer yang tak terlupakan.",
      [
        {
          heading: "Takoyaki legendaris",
          paragraph:
            "Coba takoyaki dari penjual ternama di sepanjang kanal. Perhatikan antrean lokal sebagai indikator kualitas.",
        },
        {
          heading: "Okonomiyaki dan kushikatsu",
          paragraph:
            "Osaka dikenal sebagai kota okonomiyaki. Banyak restoran membiarkan tamu memasak sendiri di atas teppan panas.",
        },
      ],
    ),
    youtubeId: "R3GfuzLMPkA",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 18920,
    daysAgo: 7,
    useYoutubeThumbnail: true,
  },
  {
    slug: "kereta-shinkansen-panduan",
    title: "Panduan Naik Shinkansen untuk Pemula",
    description:
      "Cara membeli tiket, memilih kursi, dan etika di kereta cepat Jepang.",
    content: videoContent(
      "Shinkansen adalah cara paling efisien menjelajahi Jepang. Sistemnya terlihat rumit di awal, tetapi sangat intuitif setelah memahami dasarnya.",
      [
        {
          heading: "Membeli tiket",
          paragraph:
            "Gunakan mesin tiket di stasiun atau beli JR Pass jika berencana banyak bepergian antarkota. Reservasi kursi direkomendasikan saat musim ramai.",
        },
        {
          heading: "Etika di dalam kereta",
          paragraph:
            "Mode senyap di telepon, hindari makanan berbau kuat, dan letakkan koper di rak atas. Gerbong reserved dan non-reserved memiliki aturan berbeda.",
        },
      ],
    ),
    youtubeId: "L_jWHffIx5E",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 11230,
    daysAgo: 10,
  },
  {
    slug: "musim-sakura-hanami",
    title: "Hanami: Menikmati Musim Sakura di Jepang",
    description:
      "Spot hanami populer, tips piknik, dan tradisi menikmati bunga sakura.",
    content: videoContent(
      "Hanami adalah tradisi menikmati bunga sakura yang telah berlangsung berabad-abad. Musim ini menarik wisatawan dari seluruh dunia.",
      [
        {
          heading: "Spot terbaik",
          paragraph:
            "Ueno Park, Shinjuku Gyoen, dan Philosopher's Path di Kyoto adalah pilihan populer. Datang pagi untuk menghindari keramaian.",
        },
        {
          heading: "Tips piknik hanami",
          paragraph:
            "Bawa matras, makanan ringan, dan sampah kantong. Banyak taman melarang BBQ terbuka — selalu cek peraturan lokal.",
        },
      ],
    ),
    youtubeId: "aqz-KE-bpKQ",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 27680,
    daysAgo: 14,
    useYoutubeThumbnail: true,
  },
  {
    slug: "konbini-jepang-unik",
    title: "Keajaiban Konbini Jepang",
    description:
      "ATM, makanan siap saji, layanan unik, dan mengapa konbini begitu istimewa di Jepang.",
    content: videoContent(
      "Konbini di Jepang jauh melampaui minimarket biasa. Dengan lebih dari 50.000 toko di seluruh negeri, mereka menjadi infrastruktur hidup sehari-hari.",
      [
        {
          heading: "Layanan lengkap",
          paragraph:
            "Bayar tagihan, kirim paket, cetak dokumen, dan beli tiket event — semua bisa dilakukan di konbini 24 jam.",
        },
        {
          heading: "Makanan siap saji",
          paragraph:
            "Onigiri, bento segar, dan kopi berkualitas dijual dengan standar higienis tinggi. Kualitasnya sering mengejutkan pengunjung pertama kali.",
        },
      ],
    ),
    youtubeId: "e_04ZrNroTo",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 16400,
    daysAgo: 20,
  },
  {
    slug: "tradisi-teh-jepang",
    title: "Upacara Teh Jepang untuk Pemula",
    description:
      "Pengenalan sadō — filosofi, etika, dan pengalaman minum teh di Jepang.",
    content: videoContent(
      "Sadō atau upacara teh Jepang adalah seni yang mengajarkan kesabaran, kerendahan hati, dan penghargaan terhadap momen kecil dalam hidup.",
      [
        {
          heading: "Filosofi sadō",
          paragraph:
            "Setiap gerakan dalam upacara teh memiliki makna. Konsep ichi-go ichi-e mengajarkan bahwa setiap pertemuan adalah kesempatan unik.",
        },
        {
          heading: "Pengalaman untuk wisatawan",
          paragraph:
            "Banyak rumah teh di Kyoto dan Kanazawa menawarkan sesi singkat untuk pemula. Reservasi diperlukan, terutama saat musim ramai.",
        },
      ],
    ),
    youtubeId: "wzSVOcgKq04",
    status: "PUBLISHED",
    isFeatured: false,
    viewCount: 7350,
    daysAgo: 28,
    useYoutubeThumbnail: true,
  },
];

module.exports = { VIDEOS_DATA };
