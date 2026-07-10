/**
 * Pool gambar — URL dipetakan ke R2 via image-r2-registry.json setelah migrasi.
 */

const R2_REGISTRY = (() => {
  try {
    return require("./image-r2-registry.json");
  } catch {
    return {};
  }
})();

function unsplash(photoId, { w = 1200, q = 85, fit = true } = {}) {
  const regKey = `${photoId}|w=${w}|q=${q}${fit ? "|fit" : ""}`;
  if (R2_REGISTRY[regKey]) return R2_REGISTRY[regKey];

  const base = `https://images.unsplash.com/${photoId}`;
  const params = new URLSearchParams({
    auto: "format",
    w: String(w),
    q: String(q),
  });
  if (fit) params.set("fit", "crop");
  return `${base}?${params}`;
}

/** photo-... path tanpa domain */
const PHOTOS = {
  anime: [
    "photo-1612036782180-6f0b6cd846fe",
    "photo-1601850494422-3cf14624b0b3",
    "photo-1625189659340-887baac3ea32",
    "photo-1578632767115-351597cf2477",
    "photo-1542816417-0983c9c9ad53",
  ],
  manga: [
    "photo-1613376023733-0a73315d9b06",
    "photo-1618519764620-7403abdbdfe9",
    "photo-1516979187457-637abb4f9353",
  ],
  culture: [
    "photo-1528164344705-47542687000d",
    "photo-1545569341-9eb8b30979d9",
    "photo-1493976040374-85c8e12f0c0e",
  ],
  travel: [
    "photo-1540959733332-eab4deabeeaf",
    "photo-1492571350019-22de08371fd3",
    "photo-1526481280693-3bfa7568e0f3",
    "photo-1565130838609-c3a86655db61",
    "photo-1570521462033-3015e76e7432",
    "photo-1592914610354-fd354ea45e48",
    "photo-1590559899731-a382839e5549",
    "photo-1528360983277-13d401cdc186",
  ],
  food: [
    "photo-1553621042-f6e147245754",
    "photo-1569718212165-3a8278d5f624",
    "photo-1617196034796-73dfa7b1fd56",
    "photo-1557872943-16a5ac26437e",
    "photo-1611143669185-af224c5e3252",
    "photo-1546833999-b9f581a1996d",
    "photo-1541014741259-de529411b96a",
    "photo-1558030006-450675393462",
    "photo-1579584425555-c3ce17fd4351",
    "photo-1551218808-94e220e084d2",
  ],
  event: [
    "photo-1492684223066-81342ee5ff30",
    "photo-1501281668745-f7f57925c3b4",
    "photo-1514525253161-7a46d19cd819",
    "photo-1522383225653-ed111181a951",
  ],
  technology: [
    "photo-1518770660439-4636190af475",
    "photo-1531297484001-80022131f5a1",
    "photo-1485827404703-89b55fcc595e",
    "photo-1526374965328-7f61d4dc18c5",
    "photo-1592155931584-901ac15763e3",
  ],
  lifestyle: [
    "photo-1500530855697-b586d89ba3ee",
    "photo-1511988617509-a57c8a288659",
    "photo-1470115636492-6d2b56f9146d",
  ],
  education: [
    "photo-1513475382585-d06e58bcb0e0",
    "photo-1524995997946-a1c2e315a42f",
    "photo-1456513080510-7bf3a84b82f8",
  ],
  fun: [
    "photo-1511882150382-421056c89033",
    "photo-1550745165-9bc0b252726f",
    "photo-1493711662062-fa541adb3fc8",
  ],
  studio: [
    "photo-1607604276583-eef5d076aa5f",
    "photo-1613376023733-0a73315d9b06",
  ],
  gacha: [
    "photo-1511882150382-421056c89033",
    "photo-1550745165-9bc0b252726f",
    "photo-1493711662062-fa541adb3fc8",
  ],
  work: [
    "photo-1600880292203-757bb62b4baf",
  ],
  camera: ["photo-1516035069371-29a1b244cc32"],
  automotive: ["photo-1485827404703-89b55fcc595e"],
  gaming: ["photo-1493711662062-fa541adb3fc8"],
  nomad: ["photo-1513475382585-d06e58bcb0e0"],
  elderly: ["photo-1511988617509-a57c8a288659"],
  konbini: ["photo-1558030006-450675393462"],
  music: ["photo-1470229722913-7c0e2dbbafd3"],
  skincare: ["photo-1556228578-0d85b1a4d571"],
  souvenirs: ["photo-1541014741259-de529411b96a"],
  film: ["photo-1489599849927-2ee91cede3ba"],
  /** Cadangan unik untuk thumbnail kuis/poll — sudah diverifikasi HEAD 200 */
  extra: [
    "photo-1478436127897-769e1b3f0f36",
    "photo-1581833971358-2c8b550f87b3",
    "photo-1578662996442-48f60103fc96",
    "photo-1582719478250-c89cae4dc85b",
    "photo-1519681393784-d120267933ba",
    "photo-1625246333195-78d9c38ad449",
    "photo-1557804506-669a67965ba0",
    "photo-1571019613454-1cb2f99b2d8b",
    "photo-1598300042247-d088f8ab3a91",
    "photo-1614850523459-c2f4c699c52e",
    "photo-1633356122544-f134324a6cee",
    "photo-1469474968028-56623f02e42e",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1441974231531-c6227db76b6e",
    "photo-1506905925346-21bda4d32df4",
    "photo-1500534314209-a25ddb2bd429",
    "photo-1501594907352-04cda38ebc29",
    "photo-1493246507139-91e8fad9978e",
    "photo-1635070041078-e363dbe005cb",
    "photo-1677442136019-21780ecad995",
    "photo-1682687220742-aba13b6e50ba",
  ],
};

/** Kota → foto travel spesifik */
const CITY_PHOTO_IDS = {
  Tokyo: "photo-1540959733332-eab4deabeeaf",
  Kyoto: "photo-1493976040374-85c8e12f0c0e",
  Osaka: "photo-1590559899731-a382839e5549",
  Nagoya: "photo-1565130838609-c3a86655db61",
  Sapporo: "photo-1528360983277-13d401cdc186",
  Fukuoka: "photo-1526481280693-3bfa7568e0f3",
  Hiroshima: "photo-1570521462033-3015e76e7432",
  Okinawa: "photo-1492571350019-22de08371fd3",
};

/** Makanan → foto food spesifik */
const FOOD_PHOTO_IDS = {
  Ramen: "photo-1569718212165-3a8278d5f624",
  Sushi: "photo-1579584425555-c3ce17fd4351",
  Takoyaki: "photo-1611143669185-af224c5e3252",
  Tempura: "photo-1558030006-450675393462",
  Udon: "photo-1553621042-f6e147245754",
  Soba: "photo-1617196034796-73dfa7b1fd56",
  "Wagyu Steak": "photo-1546833999-b9f581a1996d",
  "Matcha Dessert": "photo-1541014741259-de529411b96a",
};

/** Topik kuis → pool gambar thumbnail */
const QUIZ_TOPIC_POOL = {
  "Anime Klasik": "anime",
  "Budaya Jepang": "culture",
  "Kuliner Jepang": "food",
  "Manga Ikonik": "manga",
  "Tempat Wisata": "travel",
  "Teknologi Pop": "technology",
  "Bahasa Jepang": "education",
};

/** Override cover artikel per cover_key (lebih spesifik dari kategori) */
const ARTICLE_COVER_POOL = {
  minimum_wage: "work",
  sony_camera: "camera",
  toyota_ev: "automotive",
  nintendo_switch: "gaming",
  visa_nomad: "nomad",
  demographics: "elderly",
  ai_startup: "technology",
  konbini_trend: "konbini",
  jpop_fest: "music",
  film_review: "film",
  spotify_wrapped: "music",
  idol_debut: "music",
  skincare_review: "skincare",
  switch_controller: "gaming",
  omiyage: "souvenirs",
};

function poolUrls(keys, w = 1200) {
  const ids = keys.flatMap((k) => PHOTOS[k] || []);
  return ids.map((id) => unsplash(id, { w }));
}

function photoUrlForPool(poolKey, index = 0, w = 1200) {
  const pool = PHOTOS[poolKey] || PHOTOS.culture;
  const id = pool[index % pool.length];
  return unsplash(id, { w });
}

function cityPhotoUrl(cityName, w = 400) {
  const id = CITY_PHOTO_IDS[cityName] || PHOTOS.travel[0];
  return unsplash(id, { w, q: 80 });
}

function foodPhotoUrl(foodName, w = 400) {
  const id = FOOD_PHOTO_IDS[foodName] || PHOTOS.food[0];
  return unsplash(id, { w, q: 80 });
}

function quizThumbnailForTopic(topic, index = 0) {
  const poolKey = QUIZ_TOPIC_POOL[topic] || "culture";
  return photoUrlForPool(poolKey, index, 1200);
}

function articleCoverForKey(coverKey, index = 0) {
  const poolKey = ARTICLE_COVER_POOL[coverKey];
  if (poolKey) return photoUrlForPool(poolKey, index, 1200);
  return null;
}

const IMAGES = {
  articleCovers: Object.fromEntries(
    Object.entries(PHOTOS)
      .filter(([k]) =>
        [
          "anime",
          "manga",
          "culture",
          "travel",
          "food",
          "event",
          "technology",
          "lifestyle",
          "education",
          "fun",
        ].includes(k),
      )
      .map(([k, ids]) => [k, ids.map((id) => unsplash(id, { w: 1200, q: 85 }))]),
  ),
  articleFallback: poolUrls(["culture", "travel"], 1200),
  pollThumbnails: {
    city: poolUrls(["travel"], 800),
    food: poolUrls(["food"], 800),
    anime: poolUrls(["anime"], 800),
    studio: poolUrls(["studio"], 800),
    gacha: poolUrls(["gacha"], 800),
    experience: poolUrls(["culture", "event", "travel"], 800),
  },
};

module.exports = {
  unsplash,
  PHOTOS,
  IMAGES,
  CITY_PHOTO_IDS,
  FOOD_PHOTO_IDS,
  QUIZ_TOPIC_POOL,
  ARTICLE_COVER_POOL,
  poolUrls,
  photoUrlForPool,
  cityPhotoUrl,
  foodPhotoUrl,
  quizThumbnailForTopic,
  articleCoverForKey,
};
