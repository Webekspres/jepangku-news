/**
 * Data share artikel — beragam metode dan user.
 */

const { CLERK_TEST_SAMPLE_USER_EMAIL, DUMMY_USER_EMAIL_LIST } = require("./clerk-test-emails.js");

const AUTHORS = [CLERK_TEST_SAMPLE_USER_EMAIL, ...DUMMY_USER_EMAIL_LIST.filter((e) => e !== CLERK_TEST_SAMPLE_USER_EMAIL)];

const SHARE_METHODS = [
  "copy-link",
  "whatsapp",
  "twitter",
  "facebook",
  "telegram",
  "email",
];

const ARTICLE_SHARES_DATA = [];

for (let i = 0; i < 45; i++) {
  ARTICLE_SHARES_DATA.push({
    author_email: AUTHORS[i % AUTHORS.length],
    article_index: i % 30,
    share_method: SHARE_METHODS[i % SHARE_METHODS.length],
    points_awarded: 5,
    is_point_awarded: i % 5 !== 0,
    days_ago: 1 + (i % 20),
  });
}

module.exports = { ARTICLE_SHARES_DATA };
