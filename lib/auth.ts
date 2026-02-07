import { cookies } from 'next/headers';

export const cookieOptions = {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
};

export async function setAuthSession(token: string, role: string, userId: string | number) {
    const cookieStore = await cookies();

    cookieStore.set('access_token', token, cookieOptions);
    cookieStore.set('role', role, { ...cookieOptions, httpOnly: false });
    cookieStore.set('user_id', String(userId), { ...cookieOptions, httpOnly: false });
}

export async function clearAuthSession() {
    const cookieStore = await cookies();

    cookieStore.delete('access_token');
    cookieStore.delete('role');
    cookieStore.delete('user_id');
}
