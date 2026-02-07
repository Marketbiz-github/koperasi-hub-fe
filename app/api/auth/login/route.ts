import { NextResponse } from 'next/server';
import { authService } from '@/services/apiService';
import { setAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, captchaToken } = await req.json();

    // 1. Verify CAPTCHA
    if (!captchaToken) {
      return NextResponse.json({ message: 'CAPTCHA token is required' }, { status: 400 });
    }

    const secretKey = process.env.GOOGLE_CAPTCHA_SECRET_KEY || process.env.GOOGLE_CAPTHA_SECRET_KEY;
    const verifyResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`, {
      method: 'POST',
    });
    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return NextResponse.json({ message: 'Invalid CAPTCHA' }, { status: 400 });
    }

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
