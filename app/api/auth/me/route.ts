import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { userService } from '@/services/apiService'

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

  try {
    const result = await userService.getUserDetail(token, userId);

    return NextResponse.json({
      user: {
        ...result.data,
        role: role || result.data.role || 'vendor', // Fallback to cookie role if needed
      },
    })
  } catch (error) {
    // If external API fails, fallback to basic cookie info so the UI doesn't break
    return NextResponse.json({
      user: {
        id: userId,
        name: 'User',
        email: '',
        role: role || 'vendor',
      },
    })
  }
}
