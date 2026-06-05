/**
 * Data share artikel — beragam metode dan user.
 */

const AUTHORS = [
  "budi.santoso@gmail.com",
  "siti.rahayu@gmail.com",
  "andi.wijaya@gmail.com",
  "dewi.kusuma@gmail.com",
  "rizky.pratama@gmail.com",
  "maya.indah@gmail.com",
  "fajar.nugroho@gmail.com",
  "lina.hartati@gmail.com",
];

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
