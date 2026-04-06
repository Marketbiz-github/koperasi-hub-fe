export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export function validateImage(file: File): ValidationResult {
    if (!ALLOWED_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau PDF.',
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'Ukuran file terlalu besar. Maksimal 2MB.',
        };
    }

    return { valid: true };
}
