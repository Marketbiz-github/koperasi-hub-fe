import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decodeFakeToken } from '@/lib/fakeJwt'

export async function GET() {
  const token = (await cookies()).get('access_token')?.value

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = decodeFakeToken(token)

  if (!user) {
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}
