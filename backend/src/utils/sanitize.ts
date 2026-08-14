export function sanitizeFilename(filename: string): string {
  // Remove invalid filesystem characters (Windows)
  return filename
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeUrl(url: string): string {
  // Basic URL sanitization - remove any extra parameters that could be malicious
  return url.split('&')[0]; // simplistic
}