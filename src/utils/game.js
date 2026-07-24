export const objectToList = (object) => {
  return Object.values(object).sort((a, b) => a.order - b.order);
};
