import { URL } from 'url';

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function isYouTubeUrl(url: string): boolean {
  return /(youtube\.com|youtu\.be)/i.test(url);
}

export function sanitizePath(input: string): string {
  // Remove any path traversal sequences and dangerous chars
  return input.replace(/\.\./g, '').replace(/[<>:"|?*]/g, '');
}

export function isValidDownloadDir(dir: string): boolean {
  // Basic check: ensure it's an absolute path (Windows or Unix)
  return /^[a-zA-Z]:\\/.test(dir) || /^\//.test(dir);
}