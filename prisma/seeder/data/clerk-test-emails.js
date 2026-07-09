/** Clerk dev test emails — OTP selalu 424242, tanpa inbox. */
const CLERK_TEST_ADMIN_EMAIL = "admin+clerk_test@jepangku.com";
const CLERK_TEST_CONTRIBUTOR_EMAIL = "kontributor+clerk_test@jepangku.com";

/** Email dummy portal user — hindari alamat gmail.com yang bisa aktif di dunia nyata. */
const DUMMY_USER_EMAILS = {
  budisantoso: "budisantoso+clerk_test@jepangku.com",
  sitirahayu: "sitirahayu+clerk_test@jepangku.com",
  andiwijaya: "andiwijaya+clerk_test@jepangku.com",
  dewikusuma: "dewikusuma+clerk_test@jepangku.com",
  rizkypratama: "rizkypratama+clerk_test@jepangku.com",
  mayaindah: "mayaindah+clerk_test@jepangku.com",
  fajarnugroho: "fajarnugroho+clerk_test@jepangku.com",
  linahartati: "linahartati+clerk_test@jepangku.com",
};

const CLERK_TEST_SAMPLE_USER_EMAIL = DUMMY_USER_EMAILS.budisantoso;

const LEGACY_EMAIL_MIGRATIONS = [
  { from: "admin@jepangku.com", to: CLERK_TEST_ADMIN_EMAIL },
  { from: "budi.santoso@gmail.com", to: DUMMY_USER_EMAILS.budisantoso },
  { from: "budi+clerk_test@jepangku.com", to: DUMMY_USER_EMAILS.budisantoso },
  { from: "lina.hartati@gmail.com", to: DUMMY_USER_EMAILS.linahartati },
  { from: "fajar.nugroho@gmail.com", to: DUMMY_USER_EMAILS.fajarnugroho },
  { from: "maya.indah@gmail.com", to: DUMMY_USER_EMAILS.mayaindah },
  { from: "rizky.pratama@gmail.com", to: DUMMY_USER_EMAILS.rizkypratama },
  { from: "dewi.kusuma@gmail.com", to: DUMMY_USER_EMAILS.dewikusuma },
  { from: "andi.wijaya@gmail.com", to: DUMMY_USER_EMAILS.andiwijaya },
  { from: "siti.rahayu@gmail.com", to: DUMMY_USER_EMAILS.sitirahayu },
];

const DUMMY_USER_EMAIL_LIST = Object.values(DUMMY_USER_EMAILS);

module.exports = {
  CLERK_TEST_ADMIN_EMAIL,
  CLERK_TEST_SAMPLE_USER_EMAIL,
  CLERK_TEST_CONTRIBUTOR_EMAIL,
  DUMMY_USER_EMAILS,
  DUMMY_USER_EMAIL_LIST,
  LEGACY_EMAIL_MIGRATIONS,
};
