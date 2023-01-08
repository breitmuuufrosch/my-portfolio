export const rounding = (value: number, digits = 2): string => {
  if (Number.isNaN(Number(value)) || value === 0) {
    return '-';
  }
  const factor = 10 ** digits;
  const rounded = Math.round(Number(value) * factor) / factor;
  return rounded.toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};
