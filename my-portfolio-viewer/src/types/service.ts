export const getServiceData = async <T>(uri: string): Promise<T> => {
  const response = await fetch(uri, {
    method: 'GET',
  });
  const jsonResponse = await response.json();
  return jsonResponse;
};
