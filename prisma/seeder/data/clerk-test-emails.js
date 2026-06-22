/** Clerk dev test emails — OTP selalu 424242, tanpa inbox. */
const CLERK_TEST_ADMIN_EMAIL = "admin+clerk_test@jepangku.com";
const CLERK_TEST_SAMPLE_USER_EMAIL = "budi+clerk_test@jepangku.com";
const CLERK_TEST_CONTRIBUTOR_EMAIL = "kontributor+clerk_test@jepangku.com";

const LEGACY_EMAIL_MIGRATIONS = [
  { from: "admin@jepangku.com", to: CLERK_TEST_ADMIN_EMAIL },
  { from: "budi.santoso@gmail.com", to: CLERK_TEST_SAMPLE_USER_EMAIL },
];

module.exports = {
  CLERK_TEST_ADMIN_EMAIL,
  CLERK_TEST_SAMPLE_USER_EMAIL,
  CLERK_TEST_CONTRIBUTOR_EMAIL,
  LEGACY_EMAIL_MIGRATIONS,
};
