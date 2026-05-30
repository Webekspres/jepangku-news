const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SAMPLE_ARTICLES = [
  {
    title: "Sakura Bloom 2026: Tempat Terbaik Lihat Bunga Sakura di Jepang",
    category_slug: "travel",
    excerpt: "Musim semi telah tiba! Inilah 10 lokasi terbaik untuk menikmati keindahan bunga sakura tahun ini.",
    content: "<p>Musim semi di Jepang adalah salah satu momen paling magis dalam setahun. Ketika bunga sakura mulai mekar, seluruh negara berubah menjadi lautan warna pink yang memukau.</p><h2>1. Ueno Park, Tokyo</h2><p>Salah satu hotspot hanami paling populer di Tokyo dengan lebih dari 1000 pohon sakura.</p><h2>2. Maruyama Park, Kyoto</h2><p>Terkenal dengan pohon sakura raksasa yang diterangi pada malam hari.</p><h2>3. Hirosaki Castle, Aomori</h2><p>Pemandangan kastil dikelilingi sakura yang menakjubkan.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1558870832-c8db4b5b47d1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    is_featured: true,
    is_hot: true,
  },
  {
    title: "Anime Musim Spring 2026: 5 Judul Wajib Tonton",
    category_slug: "anime",
    excerpt: "Daftar anime baru yang siap menghibur kamu di musim semi ini, dari aksi hingga slice of life.",
    content: "<p>Musim spring 2026 kembali menghadirkan deretan anime berkualitas. Berikut adalah pilihan terbaik yang wajib masuk watchlist kamu:</p><h2>1. Chainsaw Man Season 2</h2><p>Kelanjutan kisah Denji yang penuh aksi dan kekacauan.</p><h2>2. Spy x Family Season 3</h2><p>Keluarga Forger kembali dengan misi-misi baru.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1534085757171-98a01360495c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    is_hot: true,
  },
  {
    title: "Mengenal Ikigai: Filosofi Hidup Bahagia ala Jepang",
    category_slug: "culture",
    excerpt: "Konsep Ikigai mengajarkan kita menemukan tujuan hidup melalui perpaduan passion, mission, vocation, dan profession.",
    content: "<p>Ikigai (生き甲斐) adalah konsep filosofis Jepang yang berarti 'alasan untuk hidup'. Kata ini berasal dari iki (hidup) dan gai (nilai atau alasan).</p><p>Filosofi ini menggabungkan empat elemen kunci:</p><ul><li>Apa yang kamu cintai</li><li>Apa yang kamu kuasai</li><li>Apa yang dunia butuhkan</li><li>Apa yang bisa dibayar</li></ul>",
    cover_image_url: "https://images.unsplash.com/photo-1545569310-29ddd0a82dac?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  },
  {
    title: "Ramen vs Udon vs Soba: Mie Mana yang Paling Otentik?",
    category_slug: "food",
    excerpt: "Tiga jenis mie ikonik Jepang ini punya karakter dan sejarah yang berbeda. Mana favoritmu?",
    content: "<p>Jepang dikenal sebagai negara dengan budaya mie yang sangat kaya. Tiga jenis mie paling populer adalah ramen, udon, dan soba. Masing-masing punya keunikan tersendiri.</p><h2>Ramen</h2><p>Mie tipis dengan kuah kaldu kaya rasa. Bisa shoyu, miso, tonkotsu, atau shio.</p><h2>Udon</h2><p>Mie tebal yang kenyal, biasanya disajikan dengan kuah ringan.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  },
  {
    title: "10 Manga Terlaris Sepanjang Masa di Jepang",
    category_slug: "manga",
    excerpt: "Dari One Piece hingga Dragon Ball, inilah manga yang telah mencetak rekor penjualan global.",
    content: "<p>Industri manga Jepang telah melahirkan banyak karya legendaris. Berikut adalah top 10 manga dengan penjualan tertinggi:</p><h2>1. One Piece - 516.6 juta copy</h2><p>Karya Eiichiro Oda yang masih berjalan hingga kini.</p><h2>2. Golgo 13 - 300 juta copy</h2><p>Manga aksi seinen terpanjang yang masih aktif.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    is_featured: false,
  },
  {
    title: "Akihabara: Surga Anime dan Elektronik di Jantung Tokyo",
    category_slug: "travel",
    excerpt: "Jalan-jalan virtual ke distrik Akihabara yang penuh dengan toko anime, manga, gaming, dan maid cafe.",
    content: "<p>Akihabara, atau yang akrab disebut 'Akiba', adalah distrik di Tokyo yang menjadi pusat budaya pop Jepang. Dari toko manga raksasa hingga arcade game lawas, semuanya bisa kamu temui di sini.</p><h2>Yang Wajib Dikunjungi</h2><ul><li>Mandarake - Toko manga & figure bekas terlengkap</li><li>Super Potato - Game retro paradise</li><li>Maid Cafe - Pengalaman unik ala anime</li></ul>",
    cover_image_url: "https://images.unsplash.com/photo-1542931287-023b922fa89b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    is_hot: true,
  },
  {
    title: "Mengapa Generasi Muda Jepang Lebih Suka Solo Living?",
    category_slug: "lifestyle",
    excerpt: "Tren solo culture di Jepang semakin meningkat. Apa penyebabnya dan bagaimana dampaknya?",
    content: "<p>Di Jepang modern, semakin banyak anak muda yang memilih hidup sendiri tanpa pasangan atau keluarga. Fenomena ini disebut 'ohitorisama' (sendirian).</p><p>Penyebab tren ini bervariasi:</p><ul><li>Tingginya biaya hidup di kota besar</li><li>Fokus pada karir dan pengembangan diri</li><li>Kebebasan personal</li></ul>",
    cover_image_url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  },
  {
    title: "Belajar Bahasa Jepang dari 0: Hiragana dan Katakana",
    category_slug: "education",
    excerpt: "Panduan lengkap memulai pembelajaran bahasa Jepang dengan dua sistem tulisan dasar.",
    content: "<p>Bahasa Jepang menggunakan tiga sistem tulisan: Hiragana (ひらがな), Katakana (カタカナ), dan Kanji (漢字). Sebagai pemula, fokuslah pada Hiragana dan Katakana terlebih dahulu.</p><h2>Hiragana</h2><p>Digunakan untuk kata-kata asli Jepang. Total 46 karakter dasar.</p><h2>Katakana</h2><p>Digunakan untuk kata serapan dari bahasa asing. Juga 46 karakter dasar.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1528164344705-47542687000d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  },
  {
    title: "Comiket 2026: Event Manga Terbesar di Dunia",
    category_slug: "event",
    excerpt: "Persiapkan dirimu! Comiket musim winter 2026 akan kembali dengan ratusan ribu doujinshi unik.",
    content: "<p>Comic Market atau Comiket adalah event doujinshi (komik amatir/penggemar) terbesar di dunia yang diadakan dua kali setahun di Tokyo Big Sight.</p><p>Event ini menjadi tempat berkumpulnya creator, kolektor, dan penggemar dari seluruh dunia.</p>",
    cover_image_url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  },
];

function createSlug(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${slug}-${Math.random().toString(36).substring(2, 10)}`;
}

async function main() {
  console.log('Seeding database...');

  // 1. Create default admin user if not exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jepangku.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'JepangkuAdmin2025!';
  
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

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
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Anime', slug: 'anime', color: '#D90429' },
    { name: 'Manga', slug: 'manga', color: '#0A0A0A' },
    { name: 'Culture', slug: 'culture', color: '#D90429' },
    { name: 'Travel', slug: 'travel', color: '#0A0A0A' },
    { name: 'Food', slug: 'food', color: '#D90429' },
    { name: 'Event', slug: 'event', color: '#0A0A0A' },
    { name: 'Technology', slug: 'technology', color: '#D90429' },
    { name: 'Lifestyle', slug: 'lifestyle', color: '#0A0A0A' },
    { name: 'Education', slug: 'education', color: '#D90429' },
    { name: 'Fun', slug: 'fun', color: '#0A0A0A' },
  ];

  const categories = {};
  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    let dbCat = await prisma.category.findUnique({
      where: { slug: cat.slug },
    });
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
      console.log(`Created category: ${cat.name}`);
    }
    categories[cat.slug] = dbCat;
  }

  // 3. Seed Articles
  const articleCount = await prisma.article.count();
  if (articleCount === 0) {
    for (let i = 0; i < SAMPLE_ARTICLES.length; i++) {
      const art = SAMPLE_ARTICLES[i];
      const category = categories[art.category_slug];
      if (!category) continue;

      const slug = createSlug(art.title);
      const publishedAt = new Date(Date.now() - i * 24 * 60 * 60 * 1000 - i * 2 * 60 * 60 * 1000);

      await prisma.article.create({
        data: {
          title: art.title,
          slug: slug,
          excerpt: art.excerpt,
          content: art.content,
          coverImageUrl: art.cover_image_url,
          status: 'PUBLISHED',
          visibility: 'public',
          isFeatured: art.is_featured || false,
          isHot: art.is_hot || false,
          publishedAt: publishedAt,
          viewCount: 100 + i * 47,
          weeklyViewCount: 50 + i * 12,
          bookmarkCount: 5 + i,
          shareCount: 2 + i,
          authorId: admin.id,
          categoryId: category.id,
          createdAt: publishedAt,
          updatedAt: publishedAt,
        },
      });
      console.log(`Created article: ${art.title}`);
    }
  } else {
    console.log('Articles already seeded.');
  }

  // 4. Seed Quiz
  const quizCount = await prisma.quiz.count();
  if (quizCount === 0) {
    const quiz = await prisma.quiz.create({
      data: {
        title: 'Trivia Anime Klasik Jepang',
        slug: createSlug('Trivia Anime Klasik'),
        description: 'Tes pengetahuanmu tentang anime klasik Jepang!',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
        quizType: 'trivia',
        status: 'ACTIVE',
        pointsReward: 10,
        correctAnswerPoints: 5,
        allowRetry: false,
        showResultImmediately: true,
        createdBy: admin.id,
      },
    });

    const questionsData = [
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
    ];

    for (let i = 0; i < questionsData.length; i++) {
      const qd = questionsData[i];
      const question = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionText: qd.q,
          sortOrder: i,
        },
      });

      for (let j = 0; j < qd.opts.length; j++) {
        const opt = qd.opts[j];
        await prisma.quizOption.create({
          data: {
            questionId: question.id,
            optionText: opt.text,
            isCorrect: opt.isCorrect,
            sortOrder: j,
          },
        });
      }
    }
    console.log('Created sample quiz with 3 questions.');
  } else {
    console.log('Quiz already seeded.');
  }

  // 5. Seed Poll
  const pollCount = await prisma.poll.count();
  if (pollCount === 0) {
    const poll = await prisma.poll.create({
      data: {
        title: 'Anime Spring 2026 paling kamu tunggu?',
        slug: createSlug('Anime Spring 2026 Favorit'),
        description: 'Pilih satu anime spring 2026 yang paling kamu nantikan!',
        pollType: 'POLLING',
        status: 'ACTIVE',
        pointsReward: 5,
        allowGuestVote: false,
        showResultBeforeVote: false,
        createdBy: admin.id,
      },
    });

    const pollOptions = ['Chainsaw Man S2', 'Spy x Family S3', 'Demon Slayer Movie', 'Jujutsu Kaisen S3'];
    for (let i = 0; i < pollOptions.length; i++) {
      const opt = pollOptions[i];
      await prisma.pollOption.create({
        data: {
          pollId: poll.id,
          optionText: opt,
          voteCount: 0,
          sortOrder: i,
        },
      });
    }
    console.log('Created sample poll.');
  } else {
    console.log('Poll already seeded.');
  }

  console.log('Seeding complete successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
