/** Strip quotes, apostrophes, and ampersands from event location text. Commas are allowed. */
export function formatEventLocationInput(value: string): string {
  return value
    .replace(/&quot;/gi, '')
    .replace(/&apos;/gi, '')
    .replace(/&#0*39;/gi, '')
    .replace(/&amp;/gi, '')
    .replace(/["'&]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
