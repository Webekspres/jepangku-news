const { IMAGES } = require("./images.js");

const ADS_DATA = [
  {
    key: "homepage-mid-partner",
    position: "homepage-mid",
    title: "Partner — Jepangku LMS JLPT",
    imageUrl: IMAGES.articleCovers.travel[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=homepage-banner",
    altText: "Belajar bahasa Jepang dengan Jepangku LMS",
    isActive: true,
    sortOrder: 0,
  },
  {
    key: "homepage-sidebar-partner",
    position: "homepage-sidebar",
    title: "Partner — Sidebar Homepage",
    imageUrl: IMAGES.articleCovers.culture[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=homepage-sidebar",
    altText: "Promo partner Jepangku",
    isActive: true,
    sortOrder: 0,
  },
  {
    key: "article-sidebar-partner",
    position: "article-sidebar",
    title: "Partner — Sidebar Artikel",
    imageUrl: IMAGES.articleCovers.lifestyle[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=article-sidebar",
    altText: "Promo partner di halaman artikel",
    isActive: true,
    sortOrder: 0,
  },
];

module.exports = { ADS_DATA };
