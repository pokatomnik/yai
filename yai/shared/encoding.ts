export const encodeUri = (data: string) => {
  return btoa(encodeURI(data));
};

export const decodeUri = (data: string) => {
  return atob(decodeURI(data));
};
