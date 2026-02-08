export async function getAccessToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/auth/token', {
            credentials: 'include',
        });
        const data = await response.json();
        return data.token || null;
    } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
    }
}
