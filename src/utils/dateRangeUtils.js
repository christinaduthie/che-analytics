const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MIN_DATE_ISO = "1990-01-01";
const MIN_TIMESTAMP = Date.parse(`${MIN_DATE_ISO}T00:00:00Z`);
const MAX_WINDOW_DAYS = 31;

const formatDateInput = (date) => {
  const safeDate = new Date(date);
  if (Number.isNaN(safeDate.getTime())) {
    return MIN_DATE_ISO;
  }
  const year = safeDate.getFullYear();
  const month = String(safeDate.getMonth() + 1).padStart(2, "0");
  const day = String(safeDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const clampTimestamp = (timestamp) => {
  const today = Date.now();
  const clamped = Math.min(Math.max(timestamp, MIN_TIMESTAMP), today);
  return clamped;
};

const parseISODate = (value) => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const clampRange = (range = {}) => {
  const today = Date.now();
  const defaultEnd = clampTimestamp(today);
  const defaultStart = clampTimestamp(defaultEnd - (MAX_WINDOW_DAYS - 1) * DAY_IN_MS);
  const start = clampTimestamp(parseISODate(range.from) ?? defaultStart);
  const end = clampTimestamp(parseISODate(range.to) ?? defaultEnd);
  const orderedStart = Math.min(start, end);
  let orderedEnd = Math.max(start, end);
  if (orderedEnd - orderedStart > (MAX_WINDOW_DAYS - 1) * DAY_IN_MS) {
    orderedEnd = orderedStart + (MAX_WINDOW_DAYS - 1) * DAY_IN_MS;
  }
  return {
    from: formatDateInput(orderedStart),
    to: formatDateInput(orderedEnd),
  };
};

export const buildDefaultDateRange = () => clampRange();

export const ensureRangeWithinWindow = (range) => clampRange(range);

export const filterByDateRange = (items = [], dateField, range) => {
  if (!Array.isArray(items)) return [];
  const normalized = clampRange(range);
  const startTs = clampTimestamp(parseISODate(normalized.from));
  const endTs = clampTimestamp(parseISODate(normalized.to)) + (DAY_IN_MS - 1);
  return items.filter((item) => {
    const itemDate = parseISODate(item?.[dateField]);
    if (itemDate === null) {
      return false;
    }
    return itemDate >= startTs && itemDate <= endTs;
  });
};

export const rangeToDayOffsets = (range) => {
  const today = Date.now();
  const totalDays = Math.round((clampTimestamp(today) - MIN_TIMESTAMP) / DAY_IN_MS);
  const normalized = clampRange(range);
  const fromOffset = Math.round(
    (clampTimestamp(parseISODate(normalized.from)) - MIN_TIMESTAMP) / DAY_IN_MS
  );
  const toOffset = Math.round(
    (clampTimestamp(parseISODate(normalized.to)) - MIN_TIMESTAMP) / DAY_IN_MS
  );
  return {
    from: Math.max(0, Math.min(totalDays, fromOffset)),
    to: Math.max(0, Math.min(totalDays, toOffset)),
    totalDays,
  };
};

export const offsetsToRange = (offsetRange) => {
  const today = Date.now();
  const totalDays = Math.round((clampTimestamp(today) - MIN_TIMESTAMP) / DAY_IN_MS);
  const from = Math.max(0, Math.min(totalDays, offsetRange.from ?? 0));
  const to = Math.max(0, Math.min(totalDays, offsetRange.to ?? totalDays));
  return {
    from: formatDateInput(MIN_TIMESTAMP + from * DAY_IN_MS),
    to: formatDateInput(MIN_TIMESTAMP + to * DAY_IN_MS),
  };
};

export const DATE_RANGE_CONSTANTS = {
  MIN_DATE: MIN_DATE_ISO,
  MIN_TIMESTAMP,
  DAY_IN_MS,
  MAX_WINDOW_DAYS,
};

