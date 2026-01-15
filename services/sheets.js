const Papa = require("papaparse");

const SHEET_CSV_URL = process.env.SHEET_CSV_URL;

let cache = { rows: null, ts: 0 };
const TTL_MS = 60_000;

const getSheetRowsCached = async () => {
  const now = Date.now();

  // if (cache.rows && now - cache.ts < TTL_MS) return cache.rows;

  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) throw new Error(`Failed to fetch sheet CSV: ${res.status}`);

  const csv = await res.text();
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

  const rows = parsed.data.map((row) => {
    const cleaned = {};
    for (const [key, val] of Object.entries(row)) {
      cleaned[key] = typeof val === "string" ? val.trim() : val;
    }

    return cleaned;
  });

  cache = { rows, ts: now };
  return rows;
};

module.exports = { getSheetRowsCached };
