/**
 * Rounds a number to a specified number of decimal places.
 * @param {number} num - The number to round.
 * @param {number} [precision=2] - The number of decimal places to round to.
 * @returns {number} - The rounded number.
 */
export const round = (num, precision = 2) => {
  if (isNaN(num)) {
    return 0;
  }

  // Calculate the multiplier based on the desired precision
  let multiplier = 1;
  while (precision-- > 0) {
    multiplier *= 10;
  }

  // Add an epsilon correction to handle floating point rounding errors
  const epsilonCorrection = 0.5 * Number.EPSILON * num;
  const roundedNum = Math.round((num + epsilonCorrection) * multiplier) / multiplier;
  
  return roundedNum;
}
