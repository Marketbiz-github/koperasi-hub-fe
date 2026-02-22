/**
 * Utility to handle image URLs and provide safe fallbacks for Next.js Image component.
 */

const ALLOWED_HOSTS = [
    'koperasi-hub-fe.test',
    'koperasihub.koyeb.app',
    'res.cloudinary.com',
    'localhost',
];

/**
 * Validates if an image source is safe to use with next/image.
 * @param src The image source URL or path
 * @returns boolean
 */
export function isValidImageSrc(src: string | null | undefined): boolean {
    if (!src) return false;

    // Relative paths are always valid
    if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../')) {
        return true;
    }

    try {
        const url = new URL(src);
        // Check if the hostname is in the allowed list or is a subdomain of an allowed host
        return ALLOWED_HOSTS.some(host =>
            url.hostname === host || url.hostname.endsWith(`.${host}`)
        );
    } catch (e) {
        // If it's not a valid URL and not a relative path, it's invalid
        return false;
    }
}

/**
 * Returns a safe image source for next/image, falling back to a placeholder if invalid.
 * @param src The original image source
 * @param fallback The fallback image path (default: /images/placeholder.png)
 * @returns string
 */
export function getSafeImageSrc(src: string | null | undefined, fallback: string = '/images/placeholder.png'): string {
    if (isValidImageSrc(src)) {
        return src as string;
    }
    return fallback;
}
