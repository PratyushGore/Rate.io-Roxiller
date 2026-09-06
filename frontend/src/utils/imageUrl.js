/**
 * Base URL for static assets (images, uploads).
 * Resolves against VITE_API_URL by stripping its trailing /api segment.
 * e.g., http://localhost:5000/api -> http://localhost:5000
 */
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const ASSET_BASE_URL = rawApiUrl.replace(/\/api\/?$/, "");

/**
 * Clean SVG placeholder for stores without an uploaded image.
 * Uses IMDb-inspired slate palette and brand gold accents.
 */
export const PLACEHOLDER_STORE_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDF8E7" />
          <stop offset="100%" stop-color="#F8F1D9" />
        </linearGradient>
      </defs>
      <rect width="600" height="360" fill="url(#bgGrad)" />
      <g transform="translate(240, 100)" fill="none" stroke="#D4AF37" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" transform="scale(5)" />
        <polyline points="9 22 9 12 15 12 15 22" transform="scale(5)" />
      </g>
      <text x="300" y="270" fill="#0F172A" font-family="Inter, sans-serif" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="1">
        STORERATE
      </text>
      <text x="300" y="295" fill="#64748B" font-family="Inter, sans-serif" font-size="13" text-anchor="middle">
        Storefront Image Coming Soon
      </text>
    </svg>
  `.trim());

/**
 * Resolves a relative image path into a fully qualified image URL.
 * Falls back to PLACEHOLDER_STORE_IMAGE if the path is missing or invalid.
 *
 * @param {string|null|undefined} path - Relative path (e.g. /uploads/stores/xyz.jpg)
 * @returns {string} Fully resolved image URL or data URI placeholder
 */
export function getImageUrl(path) {
  if (!path || typeof path !== "string" || path.trim().length === 0) {
    return PLACEHOLDER_STORE_IMAGE;
  }

  const trimmed = path.trim();

  // Return immediately if already an absolute URL or data URI
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  // Ensure single slash between ASSET_BASE_URL and path
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${ASSET_BASE_URL}${normalizedPath}`;
}

export default getImageUrl;
