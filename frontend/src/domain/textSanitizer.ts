/**
 * Strips scraped HTML spacing entities (such as `&nbsp;`) and normalizes whitespace
 * before rendering product specs or descriptions in UI components.
 */
export function cleanHtmlText(val: unknown): string {
  return String(val ?? '')
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;?/gi, ' ')
    .replace(/&n(?:bs?)?$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
