import { NextResponse } from 'next/server';
import { authService } from '@/services/apiService';
import { setAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const result = await authService.login(email, password);
    const { token, role, user_id } = result.data;

    // Set cookies for session management using utility
    await setAuthSession(token, role, user_id);

    return NextResponse.json({
      message: 'Login success',
      user: {
        id: user_id,
        email: email,
        role: role,
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
