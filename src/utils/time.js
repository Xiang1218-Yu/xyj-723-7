export const millisecondsToStr = (milliseconds, showMilliseconds = false) => {
  const numberEnding = (number) => {
    return (number > 1) ? 's' : '';
  };

  let temp = Math.floor(milliseconds / 1000);
  let years = Math.floor(temp / 31536000);
  if (years) {
    return years + ' year' + numberEnding(years);
  }
  let days = Math.floor((temp %= 31536000) / 86400);
  if (days) {
    return days + ' day' + numberEnding(days);
  }
  let hours = Math.floor((temp %= 86400) / 3600);
  if (hours) {
    return hours + ' hour' + numberEnding(hours);
  }
  let minutes = Math.floor((temp %= 3600) / 60);
  if (minutes) {
    return minutes + ' minute' + numberEnding(minutes);
  }
  let seconds = temp % 60;
  if (seconds) {
    let result = seconds + ' second' + numberEnding(seconds);
    if (showMilliseconds) {
      result += ' ' + (milliseconds % 1000) + ' millisecond' + numberEnding(milliseconds % 1000);
    }
    return result;
  }
  if (showMilliseconds) {
    return (milliseconds % 1000) + ' millisecond' + numberEnding(milliseconds % 1000);
  }
  return 'less than a second';
};
