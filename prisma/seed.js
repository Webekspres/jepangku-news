const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

const CATEGORIES_DATA = [
  { name: 'Anime',      slug: 'anime',      color: '#D90429' },
  { name: 'Manga',      slug: 'manga',      color: '#0A0A0A' },
  { name: 'Culture',    slug: 'culture',    color: '#D90429' },
  { name: 'Travel',     slug: 'travel',     color: '#0A0A0A' },
  { name: 'Food',       slug: 'food',       color: '#D90429' },
  { name: 'Event',      slug: 'event',      color: '#0A0A0A' },
  { name: 'Technology', slug: 'technology', color: '#D90429' },
  { name: 'Lifestyle',  slug: 'lifestyle',  color: '#0A0A0A' },
  { name: 'Education',  slug: 'education',  color: '#D90429' },
  { name: 'Fun',        slug: 'fun',        color: '#0A0A0A' },
];

const TAGS_DATA = [
  { name: 'Tokyo',        slug: 'tokyo' },
  { name: 'Kyoto',        slug: 'kyoto' },
  { name: 'Sakura',       slug: 'sakura' },
  { name: 'Shonen',       slug: 'shonen' },
  { name: 'Seinen',       slug: 'seinen' },
  { name: 'Isekai',       slug: 'isekai' },
  { name: 'Studio Ghibli',slug: 'studio-ghibli' },
  { name: 'MAPPA',        slug: 'mappa' },
  { name: 'Ramen',        slug: 'ramen' },
  { name: 'Sushi',        slug: 'sushi' },
  { name: 'Onsen',        slug: 'onsen' },
  { name: 'Cosplay',      slug: 'cosplay' },
  { name: 'Kanji',        slug: 'kanji' },
  { name: 'J-Pop',        slug: 'j-pop' },
  { name: 'Samurai',      slug: 'samurai' },
  { name: 'Ninja',        slug: 'ninja' },
  { name: 'Otaku',        slug: 'otaku' },
  { name: 'Doujinshi',    slug: 'doujinshi' },
  { name: 'Gacha',        slug: 'gacha' },
  { name: 'Retro Game',   slug: 'retro-game' },
];


const SAMPLE_ARTICLES = [
  // ── TRAVEL (4 articles) ──────────────────────────────────────────────────
  {
    title: 'Sakura Bloom 2026: Tempat Terbaik Lihat Bunga Sakura di Jepang',
    category_slug: 'travel',
    tags: ['sakura', 'tokyo', 'kyoto'],
    excerpt: 'Musim semi telah tiba! Inilah 10 lokasi terbaik untuk menikmati keindahan bunga sakura tahun ini.',
    content: '<p>Musim semi di Jepang adalah salah satu momen paling magis dalam setahun. Ketika bunga sakura mulai mekar, seluruh negara berubah menjadi lautan warna pink yang memukau.</p><h2>1. Ueno Park, Tokyo</h2><p>Salah satu hotspot hanami paling populer di Tokyo dengan lebih dari 1000 pohon sakura.</p><h2>2. Maruyama Park, Kyoto</h2><p>Terkenal dengan pohon sakura raksasa yang diterangi pada malam hari.</p><h2>3. Hirosaki Castle, Aomori</h2><p>Pemandangan kastil dikelilingi sakura yang menakjubkan.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
    is_hot: true,
  },
  {
    title: 'Akihabara: Surga Anime dan Elektronik di Jantung Tokyo',
    category_slug: 'travel',
    tags: ['tokyo', 'otaku'],
    excerpt: 'Jalan-jalan virtual ke distrik Akihabara yang penuh dengan toko anime, manga, gaming, dan maid cafe.',
    content: '<p>Akihabara, atau yang akrab disebut "Akiba", adalah distrik di Tokyo yang menjadi pusat budaya pop Jepang. Dari toko manga raksasa hingga arcade game lawas, semuanya bisa kamu temui di sini.</p><h2>Yang Wajib Dikunjungi</h2><ul><li>Mandarake - Toko manga & figure bekas terlengkap</li><li>Super Potato - Game retro paradise</li><li>Maid Cafe - Pengalaman unik ala anime</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Onsen Terbaik di Hakone: Relaksasi Sambil Melihat Gunung Fuji',
    category_slug: 'travel',
    tags: ['onsen', 'tokyo'],
    excerpt: 'Hakone menawarkan pengalaman onsen kelas dunia dengan pemandangan Gunung Fuji yang ikonik.',
    content: '<p>Hakone adalah destinasi onsen paling populer dari Tokyo, hanya 90 menit dengan kereta. Kawasan ini menawarkan berbagai ryokan mewah dengan pemandangan Gunung Fuji.</p><h2>Rekomendasi Ryokan</h2><ul><li>Gora Kadan - Ryokan mewah dengan taman Jepang</li><li>Hakone Ginyu - Pemandangan Fuji terbaik</li><li>Yama no Chaya - Pilihan budget-friendly</li></ul><h2>Tips Berkunjung</h2><p>Datanglah di pagi hari untuk menghindari keramaian dan mendapatkan pemandangan Fuji yang jernih.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Kyoto dalam 3 Hari: Itinerary Lengkap untuk Wisatawan',
    category_slug: 'travel',
    tags: ['kyoto', 'samurai'],
    excerpt: 'Panduan perjalanan 3 hari di Kyoto mencakup kuil, geisha, dan kuliner tradisional.',
    content: '<p>Kyoto adalah kota yang menyimpan jiwa Jepang tradisional. Dengan lebih dari 1600 kuil dan 400 kuil Shinto, kota ini bisa membuat kamu kewalahan jika tidak direncanakan dengan baik.</p><h2>Hari 1: Arashiyama & Gion</h2><p>Mulai pagi di hutan bambu Arashiyama, lanjut ke Tenryu-ji, dan sore jalan-jalan di distrik Gion.</p><h2>Hari 2: Fushimi Inari & Nishiki Market</h2><p>Pagi mendaki Fushimi Inari, siang belanja di Nishiki Market.</p><h2>Hari 3: Kinkaku-ji & Nijo Castle</h2><p>Kunjungi Paviliun Emas dan Istana Nijo sebelum kembali.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  // ── ANIME (4 articles) ───────────────────────────────────────────────────
  {
    title: 'Anime Musim Spring 2026: 5 Judul Wajib Tonton',
    category_slug: 'anime',
    tags: ['mappa', 'shonen'],
    excerpt: 'Daftar anime baru yang siap menghibur kamu di musim semi ini, dari aksi hingga slice of life.',
    content: '<p>Musim spring 2026 kembali menghadirkan deretan anime berkualitas. Berikut adalah pilihan terbaik yang wajib masuk watchlist kamu:</p><h2>1. Chainsaw Man Season 2</h2><p>Kelanjutan kisah Denji yang penuh aksi dan kekacauan.</p><h2>2. Spy x Family Season 3</h2><p>Keluarga Forger kembali dengan misi-misi baru.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1534085757171-98a01360495c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Sejarah Studio Ghibli: Dari Nausicaä hingga The Boy and the Heron',
    category_slug: 'anime',
    tags: ['studio-ghibli'],
    excerpt: 'Perjalanan panjang studio animasi paling ikonik di dunia, dari karya pertama hingga Oscar.',
    content: '<p>Studio Ghibli didirikan pada 1985 oleh Hayao Miyazaki dan Isao Takahata. Selama lebih dari 40 tahun, studio ini telah menghasilkan karya-karya yang melampaui batas usia dan budaya.</p><h2>Era Awal (1985-1997)</h2><p>Nausicaä, Laputa, My Neighbor Totoro, dan Kiki\'s Delivery Service menjadi fondasi identitas Ghibli.</p><h2>Era Keemasan (1997-2013)</h2><p>Princess Mononoke, Spirited Away (Oscar 2003), Howl\'s Moving Castle, dan Ponyo.</p><h2>Era Modern</h2><p>The Wind Rises, The Tale of Princess Kaguya, hingga The Boy and the Heron yang meraih Oscar 2024.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Isekai Terbaik 2025-2026: Rekomendasi untuk Penggemar Baru',
    category_slug: 'anime',
    tags: ['isekai', 'shonen'],
    excerpt: 'Genre isekai terus berkembang. Inilah pilihan terbaik yang wajib kamu tonton.',
    content: '<p>Isekai — genre di mana karakter utama dipindahkan ke dunia lain — telah menjadi salah satu genre paling populer dalam anime modern.</p><h2>Rekomendasi Terbaik</h2><ul><li><strong>Re:Zero</strong> - Isekai dengan elemen psikologis yang dalam</li><li><strong>Mushoku Tensei</strong> - World-building yang sangat detail</li><li><strong>That Time I Got Reincarnated as a Slime</strong> - Ringan dan menghibur</li><li><strong>Overlord</strong> - Perspektif unik dari sisi villain</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Kyoto Animation: Studio yang Bangkit dari Tragedi',
    category_slug: 'anime',
    tags: ['studio-ghibli'],
    excerpt: 'Kisah kebangkitan KyoAni setelah tragedi kebakaran 2019 yang mengguncang dunia anime.',
    content: '<p>Pada Juli 2019, kebakaran yang disengaja menghancurkan gedung utama Kyoto Animation, menewaskan 36 orang. Tragedi ini mengguncang seluruh komunitas anime global.</p><h2>Bangkit Lebih Kuat</h2><p>Dengan dukungan donasi dari seluruh dunia yang mencapai miliaran yen, KyoAni berhasil bangkit dan merilis Liz and the Blue Bird, A Silent Voice, dan Violet Evergarden yang mendapat pujian luas.</p><h2>Warisan yang Abadi</h2><p>K-On!, Clannad, Haruhi Suzumiya — karya-karya KyoAni akan selalu dikenang.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  // ── MANGA (3 articles) ───────────────────────────────────────────────────
  {
    title: '10 Manga Terlaris Sepanjang Masa di Jepang',
    category_slug: 'manga',
    tags: ['shonen', 'seinen'],
    excerpt: 'Dari One Piece hingga Dragon Ball, inilah manga yang telah mencetak rekor penjualan global.',
    content: '<p>Industri manga Jepang telah melahirkan banyak karya legendaris. Berikut adalah top 10 manga dengan penjualan tertinggi:</p><h2>1. One Piece - 516.6 juta copy</h2><p>Karya Eiichiro Oda yang masih berjalan hingga kini.</p><h2>2. Golgo 13 - 300 juta copy</h2><p>Manga aksi seinen terpanjang yang masih aktif.</p><h2>3. Dragon Ball - 260 juta copy</h2><p>Karya Akira Toriyama yang mendefinisikan genre shonen.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Panduan Membaca Manga untuk Pemula: Dari Kanan ke Kiri',
    category_slug: 'manga',
    tags: ['doujinshi', 'otaku'],
    excerpt: 'Baru mulai baca manga? Ini semua yang perlu kamu tahu sebelum membuka halaman pertama.',
    content: '<p>Manga dibaca dari kanan ke kiri, berbeda dengan komik Barat. Ini bisa membingungkan bagi pembaca baru, tapi akan terasa natural setelah beberapa halaman.</p><h2>Cara Membaca Panel</h2><p>Mulai dari panel kanan atas, baca ke kiri, lalu turun ke baris berikutnya. Dalam satu panel, balon kata juga dibaca dari kanan ke kiri.</p><h2>Genre Manga</h2><ul><li><strong>Shonen</strong> - Untuk remaja laki-laki (Naruto, One Piece)</li><li><strong>Shojo</strong> - Untuk remaja perempuan (Sailor Moon, Fruits Basket)</li><li><strong>Seinen</strong> - Untuk pria dewasa (Berserk, Vagabond)</li><li><strong>Josei</strong> - Untuk wanita dewasa</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1534085757171-98a01360495c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  {
    title: 'Doujinshi: Seni Kreasi Penggemar yang Jadi Industri Miliaran',
    category_slug: 'manga',
    tags: ['doujinshi', 'cosplay'],
    excerpt: 'Dari karya amatir di Comiket hingga menjadi batu loncatan mangaka profesional.',
    content: '<p>Doujinshi adalah karya self-published yang dibuat oleh penggemar, biasanya berdasarkan karakter dari manga, anime, atau game populer. Meski terdengar sederhana, industri ini bernilai miliaran yen per tahun.</p><h2>Sejarah Doujinshi</h2><p>Tradisi ini dimulai sejak era Meiji, jauh sebelum manga modern ada. Comiket yang dimulai 1975 menjadi katalis pertumbuhannya.</p><h2>Mangaka Terkenal yang Mulai dari Doujinshi</h2><ul><li>Ken Akamatsu (Love Hina)</li><li>Clamp (Cardcaptor Sakura)</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  // ── FOOD (3 articles) ────────────────────────────────────────────────────
  {
    title: 'Ramen vs Udon vs Soba: Mie Mana yang Paling Otentik?',
    category_slug: 'food',
    tags: ['ramen'],
    excerpt: 'Tiga jenis mie ikonik Jepang ini punya karakter dan sejarah yang berbeda. Mana favoritmu?',
    content: '<p>Jepang dikenal sebagai negara dengan budaya mie yang sangat kaya. Tiga jenis mie paling populer adalah ramen, udon, dan soba.</p><h2>Ramen</h2><p>Mie tipis dengan kuah kaldu kaya rasa. Bisa shoyu, miso, tonkotsu, atau shio.</p><h2>Udon</h2><p>Mie tebal yang kenyal, biasanya disajikan dengan kuah ringan berbasis dashi.</p><h2>Soba</h2><p>Mie dari tepung soba (buckwheat), bisa disajikan panas atau dingin (zaru soba).</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Panduan Makan Sushi yang Benar: Etika dan Cara Menikmatinya',
    category_slug: 'food',
    tags: ['sushi'],
    excerpt: 'Jangan salah makan sushi! Pelajari etika dan cara yang benar menikmati hidangan ikonik Jepang ini.',
    content: '<p>Sushi adalah salah satu makanan Jepang paling dikenal di dunia, namun banyak yang tidak tahu cara menikmatinya dengan benar.</p><h2>Nigiri vs Maki vs Temaki</h2><p>Nigiri adalah nasi dengan topping ikan di atasnya. Maki adalah gulungan nasi dengan nori. Temaki adalah kerucut nori berisi nasi dan isian.</p><h2>Etika Makan Sushi</h2><ul><li>Nigiri boleh dimakan dengan tangan</li><li>Celupkan bagian ikan ke kecap, bukan nasinya</li><li>Wasabi sudah ada di dalam, tidak perlu ditambah berlebihan</li><li>Makan dalam satu gigitan jika memungkinkan</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Wagyu A5: Daging Terbaik di Dunia dan Cara Menikmatinya',
    category_slug: 'food',
    tags: ['sushi'],
    excerpt: 'Apa yang membuat Wagyu A5 begitu istimewa? Panduan lengkap dari farm hingga meja makan.',
    content: '<p>Wagyu A5 adalah grade tertinggi daging sapi Jepang, dikenal dengan marbling lemak yang luar biasa dan tekstur yang meleleh di mulut.</p><h2>Apa itu Grading A5?</h2><p>Sistem grading Jepang menilai yield (A-C) dan kualitas (1-5). A5 adalah kombinasi terbaik dari keduanya, dengan skor marbling BMS 8-12.</p><h2>Cara Terbaik Menikmati Wagyu</h2><ul><li>Shabu-shabu - Celup sebentar di kaldu panas</li><li>Yakiniku - Panggang di atas arang</li><li>Steak - Masak medium-rare untuk menjaga kelembutan</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  // ── CULTURE (3 articles) ─────────────────────────────────────────────────
  {
    title: 'Mengenal Ikigai: Filosofi Hidup Bahagia ala Jepang',
    category_slug: 'culture',
    tags: ['samurai'],
    excerpt: 'Konsep Ikigai mengajarkan kita menemukan tujuan hidup melalui perpaduan passion, mission, vocation, dan profession.',
    content: '<p>Ikigai (生き甲斐) adalah konsep filosofis Jepang yang berarti "alasan untuk hidup". Kata ini berasal dari iki (hidup) dan gai (nilai atau alasan).</p><p>Filosofi ini menggabungkan empat elemen kunci:</p><ul><li>Apa yang kamu cintai</li><li>Apa yang kamu kuasai</li><li>Apa yang dunia butuhkan</li><li>Apa yang bisa dibayar</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Bushido: Kode Etik Samurai yang Masih Relevan di Era Modern',
    category_slug: 'culture',
    tags: ['samurai', 'ninja'],
    excerpt: 'Tujuh prinsip Bushido — dari kejujuran hingga kesetiaan — dan bagaimana nilai-nilai ini diterapkan di Jepang modern.',
    content: '<p>Bushido (武士道) adalah kode etik para samurai yang berkembang selama era feodal Jepang. Meski samurai sudah tidak ada, nilai-nilai Bushido masih terasa kuat dalam budaya Jepang modern.</p><h2>7 Prinsip Bushido</h2><ol><li><strong>Gi (義)</strong> - Kebenaran dan keadilan</li><li><strong>Yu (勇)</strong> - Keberanian</li><li><strong>Jin (仁)</strong> - Belas kasih</li><li><strong>Rei (礼)</strong> - Rasa hormat</li><li><strong>Makoto (誠)</strong> - Kejujuran</li><li><strong>Meiyo (名誉)</strong> - Kehormatan</li><li><strong>Chugi (忠義)</strong> - Kesetiaan</li></ol>',
    cover_image_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Matsuri: Panduan Festival Tradisional Jepang Sepanjang Tahun',
    category_slug: 'culture',
    tags: ['kyoto', 'tokyo'],
    excerpt: 'Dari Gion Matsuri di Kyoto hingga Awa Odori di Tokushima, inilah kalender festival Jepang yang wajib kamu tahu.',
    content: '<p>Matsuri (祭り) adalah festival tradisional Jepang yang dirayakan sepanjang tahun di seluruh penjuru negeri. Setiap festival memiliki sejarah dan keunikannya sendiri.</p><h2>Festival Musim Panas</h2><ul><li><strong>Gion Matsuri (Juli)</strong> - Festival terbesar di Kyoto sejak abad ke-9</li><li><strong>Awa Odori (Agustus)</strong> - Festival tari di Tokushima</li><li><strong>Tanabata</strong> - Festival bintang yang dirayakan di seluruh Jepang</li></ul><h2>Festival Musim Dingin</h2><ul><li><strong>Sapporo Snow Festival (Februari)</strong> - Patung salju raksasa yang menakjubkan</li><li><strong>Nozawa Onsen Fire Festival</strong> - Festival api yang dramatis</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  // ── LIFESTYLE (3 articles) ───────────────────────────────────────────────
  {
    title: 'Mengapa Generasi Muda Jepang Lebih Suka Solo Living?',
    category_slug: 'lifestyle',
    tags: ['tokyo'],
    excerpt: 'Tren solo culture di Jepang semakin meningkat. Apa penyebabnya dan bagaimana dampaknya?',
    content: '<p>Di Jepang modern, semakin banyak anak muda yang memilih hidup sendiri tanpa pasangan atau keluarga. Fenomena ini disebut "ohitorisama" (sendirian).</p><p>Penyebab tren ini bervariasi:</p><ul><li>Tingginya biaya hidup di kota besar</li><li>Fokus pada karir dan pengembangan diri</li><li>Kebebasan personal</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  {
    title: 'Wabi-Sabi: Menemukan Keindahan dalam Ketidaksempurnaan',
    category_slug: 'lifestyle',
    tags: ['kyoto'],
    excerpt: 'Filosofi estetika Jepang yang mengajarkan kita menerima dan menghargai ketidaksempurnaan dalam hidup.',
    content: '<p>Wabi-sabi (侘寂) adalah konsep estetika Jepang yang menemukan keindahan dalam hal-hal yang tidak sempurna, tidak lengkap, dan tidak abadi.</p><h2>Wabi vs Sabi</h2><p><strong>Wabi</strong> merujuk pada kesederhanaan dan ketenangan yang ditemukan dalam alam. <strong>Sabi</strong> adalah keindahan yang datang dari usia dan keausan.</p><h2>Menerapkan Wabi-Sabi dalam Kehidupan</h2><ul><li>Hargai barang-barang lama yang punya cerita</li><li>Temukan keindahan dalam proses, bukan hanya hasil</li><li>Kurangi perfeksionisme yang berlebihan</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Kaizen: Filosofi Perbaikan Berkelanjutan dari Jepang',
    category_slug: 'lifestyle',
    tags: ['samurai'],
    excerpt: 'Bagaimana konsep Kaizen yang lahir di pabrik Toyota bisa mengubah cara kita menjalani hidup sehari-hari.',
    content: '<p>Kaizen (改善) berarti "perubahan menjadi lebih baik". Konsep ini dipopulerkan oleh Toyota dan kini diterapkan di seluruh dunia, dari bisnis hingga kehidupan pribadi.</p><h2>Prinsip Kaizen</h2><ul><li>Perbaikan kecil setiap hari lebih baik dari perubahan besar sesekali</li><li>Semua orang bisa dan harus berkontribusi pada perbaikan</li><li>Fokus pada proses, bukan hanya hasil</li></ul><h2>Kaizen dalam Kehidupan Sehari-hari</h2><p>Mulai dengan hal kecil: bangun 5 menit lebih awal, baca 10 halaman per hari, atau berjalan kaki 1000 langkah ekstra.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  // ── EDUCATION (3 articles) ───────────────────────────────────────────────
  {
    title: 'Belajar Bahasa Jepang dari 0: Hiragana dan Katakana',
    category_slug: 'education',
    tags: ['kanji'],
    excerpt: 'Panduan lengkap memulai pembelajaran bahasa Jepang dengan dua sistem tulisan dasar.',
    content: '<p>Bahasa Jepang menggunakan tiga sistem tulisan: Hiragana (ひらがな), Katakana (カタカナ), dan Kanji (漢字). Sebagai pemula, fokuslah pada Hiragana dan Katakana terlebih dahulu.</p><h2>Hiragana</h2><p>Digunakan untuk kata-kata asli Jepang. Total 46 karakter dasar.</p><h2>Katakana</h2><p>Digunakan untuk kata serapan dari bahasa asing. Juga 46 karakter dasar.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  {
    title: 'JLPT N5 hingga N1: Panduan Lengkap Sertifikasi Bahasa Jepang',
    category_slug: 'education',
    tags: ['kanji'],
    excerpt: 'Semua yang perlu kamu tahu tentang ujian JLPT, dari level termudah hingga tersulit.',
    content: '<p>Japanese Language Proficiency Test (JLPT) adalah ujian standar kemampuan bahasa Jepang yang diakui secara internasional. Ada 5 level, dari N5 (termudah) hingga N1 (tersulit).</p><h2>Level JLPT</h2><ul><li><strong>N5</strong> - Kosakata ~800 kata, Kanji ~100</li><li><strong>N4</strong> - Kosakata ~1500 kata, Kanji ~300</li><li><strong>N3</strong> - Kosakata ~3750 kata, Kanji ~650</li><li><strong>N2</strong> - Kosakata ~6000 kata, Kanji ~1000</li><li><strong>N1</strong> - Kosakata ~10000+ kata, Kanji ~2000</li></ul><h2>Tips Lulus JLPT</h2><p>Konsistensi adalah kunci. Belajar 30 menit setiap hari lebih efektif dari belajar 5 jam seminggu sekali.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1542931287-023b922fa89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Sistem Pendidikan Jepang: Mengapa Siswanya Bersih-Bersih Sendiri?',
    category_slug: 'education',
    tags: ['samurai'],
    excerpt: 'Uniknya sistem pendidikan Jepang yang menanamkan nilai tanggung jawab dan kebersihan sejak dini.',
    content: '<p>Sistem pendidikan Jepang terkenal dengan pendekatan holistiknya yang tidak hanya fokus pada akademik, tetapi juga pembentukan karakter.</p><h2>Osoji: Tradisi Bersih-Bersih Bersama</h2><p>Di Jepang, siswa bertanggung jawab membersihkan kelas dan sekolah mereka sendiri. Tidak ada petugas kebersihan untuk area kelas. Tradisi ini mengajarkan tanggung jawab dan rasa memiliki.</p><h2>Kyushoku: Makan Siang Bersama</h2><p>Siswa makan siang bersama di kelas, sering kali dengan menu yang dirancang ahli gizi. Ini mengajarkan kebersamaan dan pola makan sehat.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  // ── TECHNOLOGY (3 articles) ──────────────────────────────────────────────
  {
    title: 'Robot Jepang: Dari ASIMO hingga AI Humanoid Generasi Terbaru',
    category_slug: 'technology',
    tags: ['retro-game'],
    excerpt: 'Jepang adalah pemimpin teknologi robotika dunia. Inilah perjalanan dari robot pertama hingga AI humanoid masa kini.',
    content: '<p>Jepang memiliki sejarah panjang dalam pengembangan robotika. Dari robot industri di pabrik Toyota hingga humanoid canggih, negara ini selalu berada di garis terdepan.</p><h2>ASIMO (2000-2018)</h2><p>Honda\'s ASIMO adalah salah satu robot humanoid paling ikonik, mampu berjalan, berlari, dan berinteraksi dengan manusia.</p><h2>Era AI Humanoid</h2><p>Kini, perusahaan seperti Softbank (Pepper), Toyota (T-HR3), dan startup baru mengembangkan robot yang bisa bekerja berdampingan dengan manusia di berbagai industri.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  {
    title: 'Gacha Game: Fenomena Mobile Gaming yang Lahir dari Jepang',
    category_slug: 'technology',
    tags: ['gacha', 'otaku'],
    excerpt: 'Bagaimana mekanisme gacha dari mesin kapsul mainan berevolusi menjadi industri game senilai triliunan yen.',
    content: '<p>Gacha game adalah genre mobile game yang terinspirasi dari mesin gashapon (kapsul mainan) Jepang. Pemain menggunakan mata uang virtual untuk mendapatkan karakter atau item secara acak.</p><h2>Sejarah Gacha</h2><p>Puzzle & Dragons (2012) adalah game yang mempopulerkan mekanisme gacha di mobile. Diikuti oleh Fate/Grand Order, Granblue Fantasy, dan kini Genshin Impact yang mendunia.</p><h2>Kontroversi</h2><p>Mekanisme gacha sering dikritik karena menyerupai perjudian. Beberapa negara mulai mengatur atau melarang mekanisme ini.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1534085757171-98a01360495c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Retro Gaming di Jepang: Mengapa Game Lawas Masih Dicintai?',
    category_slug: 'technology',
    tags: ['retro-game', 'tokyo'],
    excerpt: 'Dari Famicom hingga Game Boy, budaya retro gaming di Jepang tetap hidup dan berkembang.',
    content: '<p>Di era game modern dengan grafis 4K dan open world yang luas, mengapa game retro masih punya tempat di hati gamer Jepang?</p><h2>Nostalgia dan Komunitas</h2><p>Toko seperti Super Potato di Akihabara masih ramai dikunjungi. Game Famicom, Super Famicom, dan PC-Engine masih diperjualbelikan dengan harga premium.</p><h2>Nilai Koleksi</h2><p>Beberapa game langka seperti Stadium Events (NES) bisa bernilai jutaan yen. Retro gaming telah menjadi investasi bagi sebagian kolektor.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
  // ── EVENT (2 articles) ───────────────────────────────────────────────────
  {
    title: 'Comiket 2026: Event Manga Terbesar di Dunia',
    category_slug: 'event',
    tags: ['doujinshi', 'cosplay'],
    excerpt: 'Persiapkan dirimu! Comiket musim winter 2026 akan kembali dengan ratusan ribu doujinshi unik.',
    content: '<p>Comic Market atau Comiket adalah event doujinshi (komik amatir/penggemar) terbesar di dunia yang diadakan dua kali setahun di Tokyo Big Sight.</p><p>Event ini menjadi tempat berkumpulnya creator, kolektor, dan penggemar dari seluruh dunia.</p><h2>Tips Menghadiri Comiket</h2><ul><li>Datang sangat pagi — antrian bisa dimulai jam 4 pagi</li><li>Bawa uang tunai, sebagian besar booth tidak menerima kartu</li><li>Siapkan tas besar untuk membawa pembelian</li><li>Pakai pakaian yang nyaman karena akan banyak berjalan</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'AnimeJapan 2026: Preview Semua Anime Baru yang Diumumkan',
    category_slug: 'event',
    tags: ['mappa', 'shonen', 'cosplay'],
    excerpt: 'Rangkuman lengkap semua pengumuman anime baru dari AnimeJapan 2026 di Tokyo Big Sight.',
    content: '<p>AnimeJapan adalah pameran anime terbesar di Jepang yang diadakan setiap Maret di Tokyo Big Sight. Tahun 2026 menghadirkan lebih dari 100 booth dari berbagai studio dan publisher.</p><h2>Pengumuman Terbesar</h2><ul><li>Attack on Titan: Final Chapter Special 3 - Tanggal rilis dikonfirmasi</li><li>Bleach: Thousand-Year Blood War Part 4 - Trailer perdana</li><li>Blue Lock Season 2 - Visual key pertama dirilis</li></ul><h2>Cosplay Competition</h2><p>Kompetisi cosplay tahunan kembali hadir dengan hadiah total 5 juta yen.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_featured: true,
  },
  // ── FUN (2 articles) ─────────────────────────────────────────────────────
  {
    title: '10 Kata Bahasa Jepang yang Tidak Ada Padanannya dalam Bahasa Lain',
    category_slug: 'fun',
    tags: ['kanji'],
    excerpt: 'Bahasa Jepang punya kata-kata unik yang menggambarkan perasaan dan situasi yang sulit diterjemahkan.',
    content: '<p>Bahasa Jepang kaya dengan kata-kata yang menggambarkan nuansa emosi dan situasi yang tidak punya padanan langsung dalam bahasa lain.</p><h2>Kata-Kata Unik</h2><ul><li><strong>Komorebi (木漏れ日)</strong> - Cahaya matahari yang menyaring melalui dedaunan</li><li><strong>Mono no aware (物の哀れ)</strong> - Kesedihan indah atas ketidakkekalan</li><li><strong>Tsundoku (積ん読)</strong> - Membeli buku tapi tidak membacanya</li><li><strong>Wabi-sabi (侘寂)</strong> - Keindahan dalam ketidaksempurnaan</li><li><strong>Natsukashii (懐かしい)</strong> - Nostalgia yang menyenangkan</li></ul>',
    cover_image_url: 'https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    is_hot: true,
  },
  {
    title: 'Tes Kepribadian ala Jepang: Golongan Darah vs Zodiak Barat',
    category_slug: 'fun',
    tags: ['otaku'],
    excerpt: 'Di Jepang, golongan darah dipercaya menentukan kepribadian. Lebih akurat dari zodiak?',
    content: '<p>Di Jepang, kepercayaan bahwa golongan darah menentukan kepribadian (ketsueki-gata) sangat populer, terutama di kalangan anak muda.</p><h2>Kepribadian per Golongan Darah</h2><ul><li><strong>Golongan A</strong> - Perfeksionis, terorganisir, sensitif</li><li><strong>Golongan B</strong> - Kreatif, egois, tidak konvensional</li><li><strong>Golongan O</strong> - Pemimpin, percaya diri, ambisius</li><li><strong>Golongan AB</strong> - Rasional, dingin, dua kepribadian</li></ul><h2>Fenomena Burahara</h2><p>Diskriminasi berdasarkan golongan darah (burahara) adalah masalah nyata di Jepang, terutama dalam rekrutmen kerja.</p>',
    cover_image_url: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
  },
];

// ---------------------------------------------------------------------------
// QUIZZES
// ---------------------------------------------------------------------------

const SAMPLE_QUIZZES = [
  {
    title: 'Trivia Anime Klasik Jepang',
    slug_base: 'trivia-anime-klasik-jepang',
    description: 'Tes pengetahuanmu tentang anime klasik Jepang!',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    quizType: 'trivia',
    pointsReward: 10,
    correctAnswerPoints: 5,
    questions: [
      {
        q: 'Siapa pencipta manga Dragon Ball?',
        opts: [
          { text: 'Akira Toriyama', isCorrect: true },
          { text: 'Eiichiro Oda', isCorrect: false },
          { text: 'Masashi Kishimoto', isCorrect: false },
          { text: 'Hajime Isayama', isCorrect: false },
        ],
      },
      {
        q: "Anime 'Spirited Away' diproduksi oleh studio?",
        opts: [
          { text: 'Studio Ghibli', isCorrect: true },
          { text: 'Kyoto Animation', isCorrect: false },
          { text: 'MAPPA', isCorrect: false },
          { text: 'Madhouse', isCorrect: false },
        ],
      },
      {
        q: 'Apa nama karakter utama anime Naruto?',
        opts: [
          { text: 'Naruto Uzumaki', isCorrect: true },
          { text: 'Sasuke Uchiha', isCorrect: false },
          { text: 'Kakashi Hatake', isCorrect: false },
          { text: 'Sakura Haruno', isCorrect: false },
        ],
      },
      {
        q: 'Berapa jumlah episode anime One Piece hingga tahun 2025?',
        opts: [
          { text: 'Lebih dari 1000 episode', isCorrect: true },
          { text: 'Sekitar 500 episode', isCorrect: false },
          { text: 'Tepat 700 episode', isCorrect: false },
          { text: 'Kurang dari 300 episode', isCorrect: false },
        ],
      },
      {
        q: 'Studio mana yang memproduksi anime Attack on Titan season final?',
        opts: [
          { text: 'MAPPA', isCorrect: true },
          { text: 'Wit Studio', isCorrect: false },
          { text: 'Ufotable', isCorrect: false },
          { text: 'A-1 Pictures', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'Kuis Budaya dan Tradisi Jepang',
    slug_base: 'kuis-budaya-tradisi-jepang',
    description: 'Seberapa dalam pengetahuanmu tentang budaya dan tradisi Jepang?',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    quizType: 'trivia',
    pointsReward: 15,
    correctAnswerPoints: 5,
    questions: [
      {
        q: 'Apa arti kata "Ikigai" dalam bahasa Jepang?',
        opts: [
          { text: 'Alasan untuk hidup', isCorrect: true },
          { text: 'Keindahan alam', isCorrect: false },
          { text: 'Semangat juang', isCorrect: false },
          { text: 'Ketenangan jiwa', isCorrect: false },
        ],
      },
      {
        q: 'Festival apa yang dirayakan dengan melihat bunga sakura bersama?',
        opts: [
          { text: 'Hanami', isCorrect: true },
          { text: 'Matsuri', isCorrect: false },
          { text: 'Obon', isCorrect: false },
          { text: 'Tanabata', isCorrect: false },
        ],
      },
      {
        q: 'Apa nama pakaian tradisional Jepang yang paling dikenal?',
        opts: [
          { text: 'Kimono', isCorrect: true },
          { text: 'Yukata', isCorrect: false },
          { text: 'Hakama', isCorrect: false },
          { text: 'Haori', isCorrect: false },
        ],
      },
      {
        q: 'Berapa jumlah karakter Hiragana dasar dalam bahasa Jepang?',
        opts: [
          { text: '46', isCorrect: true },
          { text: '26', isCorrect: false },
          { text: '52', isCorrect: false },
          { text: '100', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'Kuis Kuliner Jepang',
    slug_base: 'kuis-kuliner-jepang',
    description: 'Tes pengetahuanmu tentang makanan dan minuman khas Jepang!',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    quizType: 'trivia',
    pointsReward: 10,
    correctAnswerPoints: 5,
    questions: [
      {
        q: 'Mie Jepang mana yang terbuat dari tepung buckwheat?',
        opts: [
          { text: 'Soba', isCorrect: true },
          { text: 'Ramen', isCorrect: false },
          { text: 'Udon', isCorrect: false },
          { text: 'Somen', isCorrect: false },
        ],
      },
      {
        q: 'Apa nama teknik memasak Jepang yang menggunakan arang binchotan?',
        opts: [
          { text: 'Yakitori', isCorrect: true },
          { text: 'Tempura', isCorrect: false },
          { text: 'Shabu-shabu', isCorrect: false },
          { text: 'Sukiyaki', isCorrect: false },
        ],
      },
      {
        q: 'Sushi jenis apa yang berbentuk kerucut dari nori?',
        opts: [
          { text: 'Temaki', isCorrect: true },
          { text: 'Nigiri', isCorrect: false },
          { text: 'Maki', isCorrect: false },
          { text: 'Gunkan', isCorrect: false },
        ],
      },
      {
        q: 'Apa nama minuman teh Jepang yang berbentuk bubuk hijau?',
        opts: [
          { text: 'Matcha', isCorrect: true },
          { text: 'Sencha', isCorrect: false },
          { text: 'Hojicha', isCorrect: false },
          { text: 'Genmaicha', isCorrect: false },
        ],
      },
      {
        q: 'Wagyu grade A5 memiliki skor marbling BMS berapa?',
        opts: [
          { text: '8-12', isCorrect: true },
          { text: '1-3', isCorrect: false },
          { text: '4-6', isCorrect: false },
          { text: '13-15', isCorrect: false },
        ],
      },
    ],
  },
  {
    title: 'Kuis Manga dan Karakter Ikonik',
    slug_base: 'kuis-manga-karakter-ikonik',
    description: 'Seberapa hafal kamu dengan karakter-karakter manga legendaris?',
    thumbnailUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
    quizType: 'trivia',
    pointsReward: 10,
    correctAnswerPoints: 5,
    questions: [
      {
        q: 'Siapa kapten bajak laut dalam manga One Piece?',
        opts: [
          { text: 'Monkey D. Luffy', isCorrect: true },
          { text: 'Roronoa Zoro', isCorrect: false },
          { text: 'Portgas D. Ace', isCorrect: false },
          { text: 'Trafalgar Law', isCorrect: false },
        ],
      },
      {
        q: 'Manga Berserk diciptakan oleh siapa?',
        opts: [
          { text: 'Kentaro Miura', isCorrect: true },
          { text: 'Hirohiko Araki', isCorrect: false },
          { text: 'Naoki Urasawa', isCorrect: false },
          { text: 'Takehiko Inoue', isCorrect: false },
        ],
      },
      {
        q: 'Apa nama teknik andalan Naruto Uzumaki?',
        opts: [
          { text: 'Rasengan', isCorrect: true },
          { text: 'Chidori', isCorrect: false },
          { text: 'Amaterasu', isCorrect: false },
          { text: 'Susanoo', isCorrect: false },
        ],
      },
      {
        q: 'Dalam manga Death Note, siapa nama shinigami yang menjatuhkan Death Note?',
        opts: [
          { text: 'Ryuk', isCorrect: true },
          { text: 'Rem', isCorrect: false },
          { text: 'Gelus', isCorrect: false },
          { text: 'Sidoh', isCorrect: false },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// POLLS
// ---------------------------------------------------------------------------

const SAMPLE_POLLS = [
  {
    title: 'Anime Spring 2026 paling kamu tunggu?',
    slug_base: 'anime-spring-2026-favorit',
    description: 'Pilih satu anime spring 2026 yang paling kamu nantikan!',
    pollType: 'POLLING',
    pointsReward: 5,
    options: ['Chainsaw Man S2', 'Spy x Family S3', 'Demon Slayer Movie', 'Jujutsu Kaisen S3'],
  },
  {
    title: 'Makanan Jepang favoritmu saat berkunjung ke Jepang?',
    slug_base: 'makanan-jepang-favorit',
    description: 'Dari sekian banyak kuliner Jepang, mana yang paling ingin kamu coba?',
    pollType: 'POLLING',
    pointsReward: 5,
    options: ['Ramen', 'Sushi', 'Wagyu Steak', 'Takoyaki', 'Tempura'],
  },
  {
    title: 'Studio anime mana yang paling kamu suka?',
    slug_base: 'studio-anime-favorit',
    description: 'Pilih studio anime favoritmu berdasarkan karya-karya yang telah mereka hasilkan.',
    pollType: 'VOTING',
    pointsReward: 5,
    options: ['Studio Ghibli', 'MAPPA', 'Kyoto Animation', 'Ufotable', 'Wit Studio'],
  },
  {
    title: 'Destinasi wisata Jepang yang paling ingin kamu kunjungi?',
    slug_base: 'destinasi-wisata-jepang-favorit',
    description: 'Jika kamu bisa pergi ke satu tempat di Jepang sekarang, mana yang kamu pilih?',
    pollType: 'POLLING',
    pointsReward: 5,
    options: ['Tokyo', 'Kyoto', 'Osaka', 'Hokkaido', 'Okinawa'],
  },
];

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------

const SAMPLE_USERS = [
  {
    email: 'budi.santoso@gmail.com',
    username: 'budisantoso',
    name: 'Budi Santoso',
    displayName: 'Budi ✨',
    bio: 'Pecinta anime dan manga sejak SD. Suka nulis review.',
    totalPoints: 320,
  },
  {
    email: 'siti.rahayu@gmail.com',
    username: 'sitirahayu',
    name: 'Siti Rahayu',
    displayName: 'Siti Rahayu',
    bio: 'Traveler yang terobsesi dengan Jepang. Sudah 3x ke sana!',
    totalPoints: 580,
  },
  {
    email: 'andi.wijaya@gmail.com',
    username: 'andiwijaya',
    name: 'Andi Wijaya',
    displayName: 'Andi W.',
    bio: 'Otaku level dewa. Koleksi figure lebih dari 200 buah.',
    totalPoints: 1240,
  },
  {
    email: 'dewi.kusuma@gmail.com',
    username: 'dewikusuma',
    name: 'Dewi Kusuma',
    displayName: 'Dewi 🌸',
    bio: 'Belajar bahasa Jepang otodidak. Sekarang sudah N3!',
    totalPoints: 760,
  },
  {
    email: 'rizky.pratama@gmail.com',
    username: 'rizkypratama',
    name: 'Rizky Pratama',
    displayName: 'Rizky',
    bio: 'Gamer dan manga reader. Favorit: Berserk dan Vagabond.',
    totalPoints: 430,
  },
  {
    email: 'maya.indah@gmail.com',
    username: 'mayaindah',
    name: 'Maya Indah',
    displayName: 'Maya Indah',
    bio: 'Food blogger yang jatuh cinta dengan kuliner Jepang.',
    totalPoints: 290,
  },
  {
    email: 'fajar.nugroho@gmail.com',
    username: 'fajarnugroho',
    name: 'Fajar Nugroho',
    displayName: 'Fajar ⚡',
    bio: 'Cosplayer aktif. Sudah cosplay lebih dari 50 karakter.',
    totalPoints: 910,
  },
  {
    email: 'lina.hartati@gmail.com',
    username: 'linahartati',
    name: 'Lina Hartati',
    displayName: 'Lina',
    bio: 'Penggemar Studio Ghibli sejak nonton Totoro pertama kali.',
    totalPoints: 150,
  },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function createSlug(base) {
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${clean}-${Math.random().toString(36).substring(2, 8)}`;
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting seed...');

  // ── 1. Admin user ──────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jepangku.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'JepangkuAdmin2025!';

  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        passwordHash: hashedPassword,
        name: 'Admin Jepangku',
        role: 'ADMIN',
        status: 'active',
        profile: {
          create: {
            displayName: 'Admin Jepangku',
            bio: 'Official Administrator of Jepangku Portal.',
          },
        },
      },
    });
    console.log(`✅ Created admin: ${adminEmail}`);
  } else {
    console.log(`⏭  Admin already exists: ${adminEmail}`);
  }

  // ── 2. Sample users ────────────────────────────────────────────────────
  const defaultUserPassword = 'UserJepangku2025!';
  const hashedUserPassword = await bcrypt.hash(defaultUserPassword, 10);

  for (const userData of SAMPLE_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      console.log(`⏭  User exists: ${userData.email}`);
      continue;
    }
    await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash: hashedUserPassword,
        name: userData.name,
        role: 'USER',
        status: 'active',
        totalPoints: userData.totalPoints,
        profile: {
          create: {
            displayName: userData.displayName,
            bio: userData.bio,
          },
        },
      },
    });
    console.log(`✅ Created user: ${userData.email}`);
  }

  // ── 3. Categories ──────────────────────────────────────────────────────
  const categories = {};
  for (let i = 0; i < CATEGORIES_DATA.length; i++) {
    const cat = CATEGORIES_DATA[i];
    let dbCat = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!dbCat) {
      dbCat = await prisma.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          color: cat.color,
          sortOrder: i,
          isActive: true,
        },
      });
      console.log(`✅ Created category: ${cat.name}`);
    }
    categories[cat.slug] = dbCat;
  }

  // ── 4. Tags ────────────────────────────────────────────────────────────
  const tags = {};
  for (const tagData of TAGS_DATA) {
    let dbTag = await prisma.tag.findUnique({ where: { slug: tagData.slug } });
    if (!dbTag) {
      dbTag = await prisma.tag.create({
        data: { name: tagData.name, slug: tagData.slug },
      });
      console.log(`✅ Created tag: ${tagData.name}`);
    }
    tags[tagData.slug] = dbTag;
  }

  // ── 5. Articles ────────────────────────────────────────────────────────
  // Idempotent: check by exact title
  for (let i = 0; i < SAMPLE_ARTICLES.length; i++) {
    const art = SAMPLE_ARTICLES[i];
    const category = categories[art.category_slug];
    if (!category) {
      console.warn(`⚠️  Category not found for article: ${art.title}`);
      continue;
    }

    const existing = await prisma.article.findFirst({ where: { title: art.title } });
    if (existing) {
      console.log(`⏭  Article exists: "${art.title}"`);
      continue;
    }

    const slug = createSlug(art.title);
    const publishedAt = new Date(Date.now() - i * 23 * 60 * 60 * 1000 - i * 37 * 60 * 1000);

    const created = await prisma.article.create({
      data: {
        title: art.title,
        slug,
        excerpt: art.excerpt,
        content: art.content,
        coverImageUrl: art.cover_image_url,
        status: 'PUBLISHED',
        visibility: 'public',
        isFeatured: art.is_featured || false,
        isHot: art.is_hot || false,
        publishedAt,
        viewCount: 80 + i * 53,
        weeklyViewCount: 30 + i * 17,
        bookmarkCount: 3 + i,
        shareCount: 1 + i,
        authorId: admin.id,
        categoryId: category.id,
        createdAt: publishedAt,
        updatedAt: publishedAt,
      },
    });

    // Attach tags
    if (art.tags && art.tags.length > 0) {
      for (const tagSlug of art.tags) {
        const tag = tags[tagSlug];
        if (tag) {
          await prisma.articleTag.create({
            data: { articleId: created.id, tagId: tag.id },
          });
        }
      }
    }

    console.log(`✅ Created article: "${art.title}"`);
  }

  // ── 6. Quizzes ─────────────────────────────────────────────────────────
  for (const quizData of SAMPLE_QUIZZES) {
    const existing = await prisma.quiz.findFirst({ where: { title: quizData.title } });
    if (existing) {
      console.log(`⏭  Quiz exists: "${quizData.title}"`);
      continue;
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: quizData.title,
        slug: createSlug(quizData.slug_base),
        description: quizData.description,
        thumbnailUrl: quizData.thumbnailUrl,
        quizType: quizData.quizType,
        status: 'ACTIVE',
        pointsReward: quizData.pointsReward,
        correctAnswerPoints: quizData.correctAnswerPoints,
        allowRetry: false,
        showResultImmediately: true,
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < quizData.questions.length; i++) {
      const qd = quizData.questions[i];
      const question = await prisma.quizQuestion.create({
        data: { quizId: quiz.id, questionText: qd.q, sortOrder: i },
      });
      for (let j = 0; j < qd.opts.length; j++) {
        await prisma.quizOption.create({
          data: {
            questionId: question.id,
            optionText: qd.opts[j].text,
            isCorrect: qd.opts[j].isCorrect,
            sortOrder: j,
          },
        });
      }
    }
    console.log(`✅ Created quiz: "${quizData.title}" (${quizData.questions.length} questions)`);
  }

  // ── 7. Polls ───────────────────────────────────────────────────────────
  for (const pollData of SAMPLE_POLLS) {
    const existing = await prisma.poll.findFirst({ where: { title: pollData.title } });
    if (existing) {
      console.log(`⏭  Poll exists: "${pollData.title}"`);
      continue;
    }

    const poll = await prisma.poll.create({
      data: {
        title: pollData.title,
        slug: createSlug(pollData.slug_base),
        description: pollData.description,
        pollType: pollData.pollType,
        status: 'ACTIVE',
        pointsReward: pollData.pointsReward,
        allowGuestVote: false,
        showResultBeforeVote: false,
        createdBy: admin.id,
      },
    });

    for (let i = 0; i < pollData.options.length; i++) {
      await prisma.pollOption.create({
        data: {
          pollId: poll.id,
          optionText: pollData.options[i],
          voteCount: 0,
          sortOrder: i,
        },
      });
    }
    console.log(`✅ Created poll: "${pollData.title}" (${pollData.options.length} options)`);
  }

  // ── 8. User Activities (for leaderboard) ──────────────────────────────
  // Fetch all seeded users (excluding admin) and all quizzes/polls/articles
  const allUsers = await prisma.user.findMany({
    where: { role: 'USER' },
    select: { id: true, email: true },
  });

  if (allUsers.length === 0) {
    console.log('⏭  No users found, skipping activity seed.');
  } else {
    const allQuizzes = await prisma.quiz.findMany({
      include: { questions: { include: { options: true } } },
    });
    const allPolls = await prisma.poll.findMany({
      include: { options: true },
    });
    const allArticles = await prisma.article.findMany({
      select: { id: true },
    });

    // Helper: random int between min and max inclusive
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Helper: date within last N days
    const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

    // Per-user activity config — controls how "active" each user is
    // Maps to SAMPLE_USERS order: budi, siti, andi, dewi, rizky, maya, fajar, lina
    const activityConfig = [
      { quizzes: 2, polls: 2, bookmarks: 3, loginDays: 5, extraPoints: 50  }, // budi
      { quizzes: 3, polls: 3, bookmarks: 5, loginDays: 7, extraPoints: 120 }, // siti
      { quizzes: 4, polls: 4, bookmarks: 8, loginDays: 7, extraPoints: 300 }, // andi (top)
      { quizzes: 3, polls: 3, bookmarks: 6, loginDays: 6, extraPoints: 180 }, // dewi
      { quizzes: 2, polls: 2, bookmarks: 4, loginDays: 5, extraPoints: 80  }, // rizky
      { quizzes: 1, polls: 2, bookmarks: 3, loginDays: 4, extraPoints: 40  }, // maya
      { quizzes: 4, polls: 3, bookmarks: 7, loginDays: 7, extraPoints: 220 }, // fajar
      { quizzes: 1, polls: 1, bookmarks: 2, loginDays: 3, extraPoints: 20  }, // lina
    ];

    for (let uIdx = 0; uIdx < allUsers.length; uIdx++) {
      const user = allUsers[uIdx];
      const cfg = activityConfig[uIdx] || activityConfig[activityConfig.length - 1];

      // ── a. Daily Login Rewards ────────────────────────────────────────
      for (let d = 0; d < cfg.loginDays; d++) {
        const rewardDate = new Date(daysAgo(d));
        const dateStr = rewardDate.toISOString().split('T')[0]; // YYYY-MM-DD

        const existingLogin = await prisma.dailyLoginReward.findFirst({
          where: { userId: user.id, rewardDate: dateStr },
        });
        if (existingLogin) continue;

        const loginPoints = 5;
        const tx = await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: 'daily_login',
            sourceType: 'login',
            points: loginPoints,
            description: `Daily login reward - ${dateStr}`,
            occurredAt: rewardDate,
          },
        });
        await prisma.dailyLoginReward.create({
          data: {
            userId: user.id,
            rewardDate: dateStr,
            pointsAwarded: loginPoints,
            pointTransactionId: tx.id,
          },
        });
      }

      // ── b. Quiz Attempts ──────────────────────────────────────────────
      const quizzesToAttempt = allQuizzes.slice(0, cfg.quizzes);
      for (const quiz of quizzesToAttempt) {
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: { userId: user.id, quizId: quiz.id },
        });
        if (existingAttempt) continue;

        const questions = quiz.questions;
        if (questions.length === 0) continue;

        // Simulate answers: user gets ~70-100% correct
        let correctCount = 0;
        const answerData = [];
        for (const question of questions) {
          const correctOpt = question.options.find((o) => o.isCorrect);
          const wrongOpts = question.options.filter((o) => !o.isCorrect);
          const isCorrect = Math.random() > 0.25; // 75% chance correct
          const selectedOpt = isCorrect
            ? correctOpt
            : wrongOpts[randInt(0, wrongOpts.length - 1)] || correctOpt;
          if (!selectedOpt) continue;
          if (isCorrect) correctCount++;
          answerData.push({ question, selectedOpt, isCorrect });
        }

        const score = (correctCount / questions.length) * 100;
        const pointsAwarded = correctCount * quiz.correctAnswerPoints + quiz.pointsReward;
        const attemptDate = daysAgo(randInt(0, 6));

        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId: quiz.id,
            userId: user.id,
            score,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            pointsAwarded,
            isPointAwarded: true,
            startedAt: attemptDate,
            submittedAt: new Date(attemptDate.getTime() + randInt(2, 8) * 60 * 1000),
            createdAt: attemptDate,
          },
        });

        for (const { question, selectedOpt, isCorrect } of answerData) {
          await prisma.quizAttemptAnswer.create({
            data: {
              attemptId: attempt.id,
              questionId: question.id,
              selectedOptionId: selectedOpt.id,
              isCorrect,
              createdAt: attemptDate,
            },
          });
        }

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: 'quiz_completed',
            sourceType: 'quiz',
            sourceId: quiz.id,
            points: pointsAwarded,
            description: `Completed quiz: ${quiz.title} (${correctCount}/${questions.length} correct)`,
            occurredAt: attemptDate,
          },
        });

        console.log(`  ✅ Quiz attempt: ${user.email} → "${quiz.title}" (${correctCount}/${questions.length})`);
      }

      // ── c. Poll Votes ─────────────────────────────────────────────────
      const pollsToVote = allPolls.slice(0, cfg.polls);
      for (const poll of pollsToVote) {
        const existingVote = await prisma.pollVote.findFirst({
          where: { userId: user.id, pollId: poll.id },
        });
        if (existingVote) continue;

        if (poll.options.length === 0) continue;
        const chosenOption = poll.options[randInt(0, poll.options.length - 1)];
        const voteDate = daysAgo(randInt(0, 6));

        await prisma.pollVote.create({
          data: {
            pollId: poll.id,
            optionId: chosenOption.id,
            userId: user.id,
            pointsAwarded: poll.pointsReward,
            isPointAwarded: true,
            votedAt: voteDate,
            createdAt: voteDate,
          },
        });

        // Increment voteCount on the chosen option
        await prisma.pollOption.update({
          where: { id: chosenOption.id },
          data: { voteCount: { increment: 1 } },
        });

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: 'poll_voted',
            sourceType: 'poll',
            sourceId: poll.id,
            points: poll.pointsReward,
            description: `Voted on poll: ${poll.title}`,
            occurredAt: voteDate,
          },
        });

        console.log(`  ✅ Poll vote: ${user.email} → "${poll.title}"`);
      }

      // ── d. Bookmarks ──────────────────────────────────────────────────
      const articlesToBookmark = allArticles.slice(0, cfg.bookmarks);
      for (const article of articlesToBookmark) {
        const existingBookmark = await prisma.bookmark.findFirst({
          where: { userId: user.id, articleId: article.id, deletedAt: null },
        });
        if (existingBookmark) continue;

        const bookmarkDate = daysAgo(randInt(0, 6));
        await prisma.bookmark.create({
          data: {
            userId: user.id,
            articleId: article.id,
            firstBookmarkedAt: bookmarkDate,
            createdAt: bookmarkDate,
          },
        });

        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: 'article_bookmarked',
            sourceType: 'article',
            sourceId: article.id,
            points: 2,
            description: 'Bookmarked an article',
            occurredAt: bookmarkDate,
          },
        });
      }
      console.log(`  ✅ Bookmarks: ${user.email} → ${articlesToBookmark.length} articles`);

      // ── e. Extra point transactions (article reads, shares, etc.) ─────
      const extraActivities = [
        { activityType: 'article_read',   sourceType: 'article', points: 1,  description: 'Read an article' },
        { activityType: 'article_shared',  sourceType: 'article', points: 3,  description: 'Shared an article' },
        { activityType: 'profile_updated', sourceType: 'profile', points: 5,  description: 'Updated profile' },
        { activityType: 'article_read',   sourceType: 'article', points: 1,  description: 'Read an article' },
        { activityType: 'article_read',   sourceType: 'article', points: 1,  description: 'Read an article' },
      ];

      let remainingExtra = cfg.extraPoints;
      let actIdx = 0;
      while (remainingExtra > 0 && actIdx < 20) {
        const act = extraActivities[actIdx % extraActivities.length];
        const pts = Math.min(act.points, remainingExtra);
        const articleId = allArticles[actIdx % allArticles.length]?.id;
        await prisma.pointTransaction.create({
          data: {
            userId: user.id,
            activityType: act.activityType,
            sourceType: act.sourceType,
            sourceId: act.sourceType === 'article' ? articleId : null,
            points: pts,
            description: act.description,
            occurredAt: daysAgo(randInt(0, 6)),
          },
        });
        remainingExtra -= pts;
        actIdx++;
      }
      console.log(`  ✅ Extra transactions: ${user.email} → ~${cfg.extraPoints} pts`);
    }

    console.log('✅ All user activities seeded.');
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
