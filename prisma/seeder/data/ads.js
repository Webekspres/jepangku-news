const { IMAGES } = require("./images.js");

const ADS_DATA = [
  {
    key: "center-partner",
    position: "center",
    title: "Belajar JLPT dengan Jepangku LMS",
    imageUrl: IMAGES.articleCovers.travel[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=homepage-banner",
    altText: "Belajar bahasa Jepang dengan Jepangku LMS",
    isActive: true,
    sortOrder: 0,
  },
  {
    key: "center-partner-2",
    position: "center",
    title: "Kursus Bahasa Jepang Online untuk Pemula",
    imageUrl: IMAGES.articleCovers.culture[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=homepage-banner-2",
    altText: "Promo kedua partner Jepangku",
    isActive: true,
    sortOrder: 1,
  },
  {
    key: "sidebar-partner",
    position: "sidebar",
    title: "Promo Kursus Jepangku di Sidebar",
    imageUrl: IMAGES.articleCovers.lifestyle[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=sidebar",
    altText: "Promo partner di sidebar",
    isActive: true,
    sortOrder: 0,
  },
  {
    key: "sidebar-partner-2",
    position: "sidebar",
    title: "Tingkatkan Nihongo Lewat Jepangku LMS",
    imageUrl: IMAGES.articleCovers.culture[0],
    linkUrl: "https://dev.kursus.jepangku.com/kursus?utm_source=jepangku.com&utm_medium=sidebar-2",
    altText: "Promo kedua partner di sidebar",
    isActive: true,
    sortOrder: 1,
  },
];

module.exports = { ADS_DATA };
