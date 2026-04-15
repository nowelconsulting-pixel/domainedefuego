export const MAX_PHOTO_SIZE_MB = 2;
export const MAX_PHOTOS = 10;
export const COMPRESS_MAX_WIDTH = 1400;
export const COMPRESS_QUALITY = 0.82;

export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Fichier non image'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > COMPRESS_MAX_WIDTH) {
        height = Math.round((height * COMPRESS_MAX_WIDTH) / width);
        width = COMPRESS_MAX_WIDTH;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', COMPRESS_QUALITY);
      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Impossible de charger l\'image')); };
    img.src = url;
  });
}

export function base64Size(b64: string): number {
  // approximate byte size from base64 string
  return Math.round((b64.length * 3) / 4);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function totalBase64Size(photos: string[]): number {
  return photos.reduce((sum, p) => sum + base64Size(p), 0);
}

export function detectVideoType(url: string): 'youtube' | 'instagram' | 'direct' | null {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/instagram\.com/.test(url)) return 'instagram';
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith('data:video')) return 'direct';
  return null;
}

export function getYoutubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

export function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

/**
 * Resolve a CMS image URL.
 * URLs of the form "local:<key>" are stored as base64 in localStorage.
 * All other URLs are returned as-is.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('local:')) {
    const key = url.slice('local:'.length);
    return localStorage.getItem(key) ?? '';
  }
  return url;
}
