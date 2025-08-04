/**
 * Format a given date (Date|string|number) as a "time ago"/"in X" string.
 *
 * @param {Date|string|number} input - The date (or ISO string / timestamp) to compare with now.
 * @returns {string} A human-readable time difference, or '' if invalid.
 */
export const formatDistanceToNow = (input) => {
  // 1. Turn whatever you got into a Date
  const date = input instanceof Date
    ? input
    : new Date(input);

  // 2. Bail on invalid dates
  if (isNaN(date.getTime())) {
    console.warn('formatDistanceToNow called with invalid date:', input);
    return '';
  }

  const now = new Date();
  let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const isFuture = diffInSeconds < 0;
  diffInSeconds = Math.abs(diffInSeconds);

  const wrap = (value, unit) => {
    const label = value === 1 ? unit : unit + 's';
    return isFuture
      ? `in ${value} ${label}`
      : `${value} ${label} ago`;
  };

  if (diffInSeconds < 60) {
    return isFuture ? 'in a few seconds' : 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return wrap(diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return wrap(diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return wrap(diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return wrap(diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return wrap(diffInYears, 'year');
};
