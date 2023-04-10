export interface CurrencyOverview {
  currency: string,
  sum: number,
}

export const groupBy = <T>(values: T[], prop: string): { [key: string]: T[] } => values.reduce((group, item) => {
  const currency = item[prop];
  const newGroup = group;
  newGroup[currency] = newGroup[currency] ?? [];
  newGroup[currency].push(item);
  return newGroup;
}, {});

export const getTotal = <T>(values: { [key: string]: T[] }, prop: string): CurrencyOverview[] => {
  const currencies = Object.keys(values);

  console.log(currencies, values);
  return currencies.map((c) => ({
    currency: c,
    sum: values[c].reduce((sum, t) => sum + t[prop], 0),
  }));
};
