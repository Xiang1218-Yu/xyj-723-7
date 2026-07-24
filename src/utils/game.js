// This function converts an object to a sorted list based on the order property of each object
export const objectToList = object => {
  // Convert the object to an array using Object.values()
  // Sort the array based on the order property of each object
  return Object.values(object).sort((a, b) =>  a.order - b.order);
}
