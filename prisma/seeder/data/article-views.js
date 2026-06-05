/**
 * Konfigurasi dan generator kunjungan artikel (ArticleView) untuk analytics.
 */

const ARTICLE_VIEWS_CONFIG = {
  /** Jumlah artikel published teratas yang akan diisi view */
  articleCount: 35,
  /** Rentang view per artikel */
  viewsPerArticle: { min: 8, max: 55 },
  /** Hari ke belakang untuk distribusi viewedAt */
  daysBack: 30,
  /** Proporsi kunjungan anonim (tanpa userId) */
  guestRatio: 0.55,
};

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Bangun spesifikasi view untuk satu artikel.
 * @param {number} articleIndex - index artikel di daftar published
 * @param {string} articleId - UUID artikel (untuk visitor key deterministik)
 */
function buildViewsForArticle(articleIndex, articleId) {
  const rng = mulberry32(articleIndex * 31337 + articleId.charCodeAt(0));
  const { viewsPerArticle, daysBack, guestRatio } = ARTICLE_VIEWS_CONFIG;
  const count =
    viewsPerArticle.min +
    Math.floor(rng() * (viewsPerArticle.max - viewsPerArticle.min + 1));

  const views = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(rng() * daysBack);
    const hoursAgo = Math.floor(rng() * 24);
    const isGuest = rng() < guestRatio;
    const userSlot = Math.floor(rng() * 8);

    views.push({
      article_index: articleIndex,
      user_slot: isGuest ? null : userSlot,
      visitor_key: isGuest
        ? `guest-${articleId.slice(0, 8)}-${i}`
        : `user-slot-${userSlot}`,
      days_ago: daysAgo,
      hours_ago: hoursAgo,
    });
  }

  return views;
}

module.exports = { ARTICLE_VIEWS_CONFIG, buildViewsForArticle };
