export const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export function validateImage(file: File): ValidationResult {
    if (!ALLOWED_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: 'Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.',
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'Ukuran gambar terlalu besar. Maksimal 1MB.',
        };
    }

    return { valid: true };
}
