export const rounding = (value: number, digits = 2): string => {
  if (Number.isNaN(Number(value)) || value === 0) {
    return '-';
  }
  const factor = 10 ** digits;
  const rounded = Math.round(Number(value) * factor) / factor;
  return rounded.toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const camelize = (value: string) => value.replace(
  /(?:^\w|[A-Z]|\b\w)/g,
  (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()),
).replace(/\s+/g, '');

export const dateString = (value: Date) => new Date(value).toISOString().substring(0, 10);
