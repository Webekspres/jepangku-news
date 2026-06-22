const JAKARTA_TZ = "Asia/Jakarta";

/** Start/end of the current calendar day in Asia/Jakarta (UTC+7). */
export function getJakartaDayBounds(now = new Date()): {
  start: Date;
  end: Date;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;

  return {
    start: new Date(`${year}-${month}-${day}T00:00:00+07:00`),
    end: new Date(`${year}-${month}-${day}T23:59:59.999+07:00`),
  };
}
