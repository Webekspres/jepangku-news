const { DUMMY_USER_EMAILS } = require("./clerk-test-emails.js");

/** `targetXp` dipakai script Core `seed-dev-data` untuk leaderboard dev. */
const SAMPLE_USERS = [
  {
    id: "seed_budisantoso",
    email: DUMMY_USER_EMAILS.budisantoso,
    username: "budisantoso",
    name: "Budi Santoso",
    displayName: "Budi ✨",
    bio: "Pecinta anime dan manga sejak SD. Suka nulis review.",
    targetXp: 320,
  },
  {
    id: "seed_sitirahayu",
    email: DUMMY_USER_EMAILS.sitirahayu,
    username: "sitirahayu",
    name: "Siti Rahayu",
    displayName: "Siti Rahayu",
    bio: "Traveler yang terobsesi dengan Jepang. Sudah 3x ke sana!",
    targetXp: 580,
  },
  {
    id: "seed_andiwijaya",
    email: DUMMY_USER_EMAILS.andiwijaya,
    username: "andiwijaya",
    name: "Andi Wijaya",
    displayName: "Andi W.",
    bio: "Otaku level dewa. Koleksi figure lebih dari 200 buah.",
    targetXp: 1240,
  },
  {
    id: "seed_dewikusuma",
    email: DUMMY_USER_EMAILS.dewikusuma,
    username: "dewikusuma",
    name: "Dewi Kusuma",
    displayName: "Dewi 🌸",
    bio: "Belajar bahasa Jepang otodidak. Sekarang sudah N3!",
    targetXp: 760,
  },
  {
    id: "seed_rizkypratama",
    email: DUMMY_USER_EMAILS.rizkypratama,
    username: "rizkypratama",
    name: "Rizky Pratama",
    displayName: "Rizky",
    bio: "Gamer dan manga reader. Favorit: Berserk dan Vagabond.",
    targetXp: 430,
  },
  {
    id: "seed_mayaindah",
    email: DUMMY_USER_EMAILS.mayaindah,
    username: "mayaindah",
    name: "Maya Indah",
    displayName: "Maya Indah",
    bio: "Food blogger yang jatuh cinta dengan kuliner Jepang.",
    targetXp: 290,
  },
  {
    id: "seed_fajarnugroho",
    email: DUMMY_USER_EMAILS.fajarnugroho,
    username: "fajarnugroho",
    name: "Fajar Nugroho",
    displayName: "Fajar ⚡",
    bio: "Cosplayer aktif. Sudah cosplay lebih dari 50 karakter.",
    targetXp: 910,
  },
  {
    id: "seed_linahartati",
    email: DUMMY_USER_EMAILS.linahartati,
    username: "linahartati",
    name: "Lina Hartati",
    displayName: "Lina",
    bio: "Penggemar Studio Ghibli sejak nonton Totoro pertama kali.",
    targetXp: 150,
  },
];

module.exports = SAMPLE_USERS;
