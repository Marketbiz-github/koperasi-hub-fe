import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const role = cookieStore.get('role')?.value
  const userId = cookieStore.get('user_id')?.value

  if (!token || !userId) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Optional: Validasi ke API eksternal jika endpoint tersedia
  // const userProfile = await authService.getMe(token);

  return NextResponse.json({
    user: {
      id: userId,
      name: 'User',
      email: '', // Not stored in cookies yet
      role: role || 'vendor',
    },
  })
}
