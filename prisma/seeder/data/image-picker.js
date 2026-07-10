/**
 * Alokasi gambar — setiap photo ID hanya dipakai sekali per batch picker.
 */

const { PHOTOS, unsplash } = require("./images.js");

function createUniquePicker() {
  const usedIds = new Set();

  function take(poolKeys, w = 1200, q = 85) {
    const keys = Array.isArray(poolKeys) ? poolKeys : [poolKeys];
    const searchOrder = [...keys, "extra"];

    for (const key of searchOrder) {
      for (const id of PHOTOS[key] || []) {
        if (!usedIds.has(id)) {
          usedIds.add(id);
          return unsplash(id, { w, q });
        }
      }
    }

    for (const ids of Object.values(PHOTOS)) {
      for (const id of ids) {
        if (!usedIds.has(id)) {
          usedIds.add(id);
          return unsplash(id, { w, q });
        }
      }
    }

    throw new Error(
      `Gambar unik habis (${usedIds.size} dipakai). Tambahkan photo ID baru di images.js`,
    );
  }

  return { take, usedCount: () => usedIds.size };
}

module.exports = { createUniquePicker };
