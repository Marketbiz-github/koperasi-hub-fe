import { useAuthStore } from '@/store/authStore';

export async function getAccessToken(): Promise<string | null> {
    const token = useAuthStore.getState().token;
    return token;
}
