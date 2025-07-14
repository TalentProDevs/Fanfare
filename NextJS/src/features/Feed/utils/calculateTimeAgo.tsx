export function formatTimeAgo(createdAt?: string | number): string {
  if (!createdAt) return "a moment ago";

  const now = new Date();
  const createdDate = new Date(createdAt);

  // Calculate the difference in calendar days
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const createdUTC = Date.UTC(createdDate.getUTCFullYear(), createdDate.getUTCMonth(), createdDate.getUTCDate());
  const dayDifference = Math.floor((nowUTC - createdUTC) / (1000 * 60 * 60 * 24));

  if (dayDifference === 0) {
    const timeDifference = now.getTime() - createdDate.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return "a moment ago";
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    }
  }

  if (dayDifference === 1) {
    return "1 day ago";
  }

  if (dayDifference < 30) {
    return `${dayDifference} days ago`;
  }

  const months = Math.floor(dayDifference / 30);
  if (months < 12) {
    return `${months} months ago`;
  }

  const years = Math.floor(dayDifference / 365);
  return `${years} years ago`;
}
