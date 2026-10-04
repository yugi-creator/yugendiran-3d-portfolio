const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats "2023-01" → "Jan 2023" */
export function formatDate(dateString: string): string {
  const [year, month] = dateString.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTHS[monthIndex]} ${year}`;
}

/** Formats a date range: "Jan 2023 — Present" or "Jan 2022 — Dec 2023" */
export function formatDateRange(start: string, end: string | null): string {
  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : 'Present';
  return `${startFormatted} — ${endFormatted}`;
}
