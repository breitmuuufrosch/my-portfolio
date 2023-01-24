export const rounding = (value?: number, digits = 2): number => {
  if (Number.isNaN(Number(value))) { return Number.NaN; }

  const factor = 10 ** digits;
  const rounded = Math.round(Number(value) * factor) / factor;
  return rounded;
};

export const formatNumber = (value?: number, digits = 2): string => {
  const rounded = rounding(value, digits);

  if (Number.isNaN(rounded) || value === 0) {
    return '-';
  }

  return rounded.toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const formatPercentage = (value?: number, digits = 2): string => {
  const rounded = rounding(value, digits);

  if (Number.isNaN(rounded)) {
    return '-';
  }

  return `${rounded.toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits })}\u00a0%`;
};

export const camelize = (value: string) => value.replace(
  /(?:^\w|[A-Z]|\b\w)/g,
  (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()),
).replace(/\s+/g, '');

export const formatDate = (value?: Date): string => {
  if (value === null) {
    return '-';
  }

  return new Date(value).toLocaleDateString('de-CH', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const isoDate = (value: Date) => new Date(value).toISOString().substring(0, 10);
