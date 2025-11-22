export function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildYearOptions(items = [], dateKey) {
  const years = new Set();
  items.forEach((item) => {
    const date = parseDate(item?.[dateKey]);
    if (date) {
      years.add(String(date.getFullYear()));
    }
  });
  return Array.from(years).sort();
}

export function filterByYear(items = [], year, dateKey) {
  if (!year || year === "all") return items;
  return items.filter((item) => {
    const date = parseDate(item?.[dateKey]);
    return date && String(date.getFullYear()) === year;
  });
}

export function aggregateMonthlyMetrics(items = [], dateKey, metrics = []) {
  if (!metrics.length) return [];

  const map = new Map();

  items.forEach((item) => {
    const date = parseDate(item?.[dateKey]);
    if (!date) return;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        date: new Date(date.getFullYear(), date.getMonth(), 1),
      });
      metrics.forEach((metric) => {
        map.get(key)[metric.key] = 0;
      });
    }
    const target = map.get(key);
    metrics.forEach((metric) => {
      const value =
        typeof metric.accessor === "function"
          ? metric.accessor(item)
          : item?.[metric.key];
      target[metric.key] += Number(value) || 0;
    });
  });

  return Array.from(map.values()).sort((a, b) => a.date - b.date);
}

export function topCategoriesBySum(
  items = [],
  categoryKey,
  valueKey,
  limit = 5
) {
  const sums = items.reduce((acc, item) => {
    const category = item?.[categoryKey];
    if (!category) return acc;
    const value = Number(item?.[valueKey]) || 0;
    acc[category] = (acc[category] ?? 0) + value;
    return acc;
  }, {});

  return Object.entries(sums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category);
}

export function aggregateCategoryTotals(items = [], categoryKey, valueKey) {
  const totals = items.reduce((acc, item) => {
    const category = item?.[categoryKey];
    if (!category) return acc;
    const value = Number(item?.[valueKey]) || 0;
    acc[category] = (acc[category] ?? 0) + value;
    return acc;
  }, {});

  return Object.entries(totals).map(([name, value]) => ({
    name,
    value,
  }));
}
