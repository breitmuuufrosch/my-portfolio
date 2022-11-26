export type Dividend = {
  symbol: string,
  total: number,
}

export type DividendTotal = {
  all: Dividend[],
  total: number,
}

export const getDividends = async <T>(): Promise<T> => {
  const response = await fetch('http://localhost:3333/securities', {
    method: 'GET',
  });
  const jsonResponse = await response.json();
  console.info(jsonResponse);
  return jsonResponse;
  // return await JSON.stringify(jsonResponse);
};
