/**
 * Utility function to convert CloudFlare R2 public URLs to API endpoint URLs
 * This handles both existing public URLs and new API URLs
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '';
  
  // If it's already an API URL, return as is
  if (imageUrl.startsWith('/api/image/')) {
    return imageUrl;
  }
  
  // If it's a CloudFlare R2 public URL, convert to API URL
  // Pattern: https://pub-xxx.r2.dev/folder/filename.ext
  const r2PublicUrlPattern = /^https:\/\/[^\/]+\.r2\.dev\/(.+)$/;
  const match = imageUrl.match(r2PublicUrlPattern);
  
  if (match) {
    const filename = match[1];
    return `/api/image/${encodeURIComponent(filename)}`;
  }
  
  // If it's any other URL (external images, etc.), return as is
  return imageUrl;
}

/**
 * Extract filename from CloudFlare R2 public URL
 * Used for converting existing URLs to API format
 */
export function extractFilenameFromR2Url(url: string): string | null {
  const r2PublicUrlPattern = /^https:\/\/[^\/]+\.r2\.dev\/(.+)$/;
  const match = url.match(r2PublicUrlPattern);
  return match ? match[1] : null;
}
