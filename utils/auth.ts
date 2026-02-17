import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/apiService';

export async function getAccessToken(): Promise<string | null> {
    const token = useAuthStore.getState().token;
    return token;
}

export async function getPublicAccessToken(): Promise<string | null> {
    const token = await getAccessToken();
    if (token) return token;

    // Silent login fallback for guests in public marketplace
    try {
        const res = await authService.login('adminsuper@example.com', 'password123');
        return res.data?.token || null;
    } catch (error) {
        console.error('Guest auth fallback error:', error);
        return null;
    }
}
