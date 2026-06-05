/**
 * Pool gambar Unsplash yang sudah diverifikasi (HEAD → image/*, status 200).
 * Gunakan helper unsplash() agar parameter ukuran/format konsisten.
 */

function unsplash(photoId, { w = 1200, q = 85, fit = true } = {}) {
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
    "photo-1612036782180-6f0b6cd846fe",
    "photo-1607604276583-eef5d076aa5f",
  ],
  gacha: [
    "photo-1526374965328-7f61d4dc18c5",
    "photo-1592155931584-901ac15763e3",
  ],
};

function poolUrls(keys, w = 1200) {
  const ids = keys.flatMap((k) => PHOTOS[k] || []);
  return ids.map((id) => unsplash(id, { w }));
}

const IMAGES = {
  /** Cover artikel per kategori slug */
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
  quizThumbnails: poolUrls(["anime", "food", "culture"], 1200),
  pollThumbnails: {
    city: poolUrls(["travel"], 800),
    food: poolUrls(["food"], 800),
    anime: poolUrls(["anime"], 800),
    studio: poolUrls(["studio"], 800),
    gacha: poolUrls(["gacha"], 800),
    experience: poolUrls(["culture", "event", "travel"], 800),
  },
  pollOptionImages: {
    city: PHOTOS.travel.map((id) => unsplash(id, { w: 400, q: 80 })),
    food: PHOTOS.food.map((id) => unsplash(id, { w: 400, q: 80 })),
  },
};

module.exports = { unsplash, PHOTOS, IMAGES };
