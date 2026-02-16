export const DURATION_OPTIONS = [
  { label: "1 day", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
] as const;

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
export const PRECISION = 1e18;
