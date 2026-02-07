import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { userService } from '@/services/apiService'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await userService.getUsers(token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
