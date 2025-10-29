/**
 * Formats a timestamp into a localized date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string or 'No disponible' if null
 */
export const formatTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return 'No disponible';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

/**
 * Calculates and formats the age of cached data
 * @param timestamp - Unix timestamp in milliseconds when data was cached
 * @returns Formatted string showing minutes and seconds (e.g., "2m 15s")
 */
export const getCacheAge = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  const ageMs = Date.now() - timestamp;
  const ageMinutes = Math.floor(ageMs / 60000);
  const ageSeconds = Math.floor((ageMs % 60000) / 1000);
  return `${ageMinutes}m ${ageSeconds}s`;
};

/**
 * Checks if cached data is still valid based on duration
 * @param timestamp - Unix timestamp in milliseconds when data was cached
 * @param duration - Maximum valid duration in milliseconds
 * @returns true if cache is still valid, false otherwise
 */
export const isCacheStillValid = (timestamp: number | null, duration: number): boolean => {
  if (!timestamp) return false;
  const age = Date.now() - timestamp;
  return age < duration;
};
