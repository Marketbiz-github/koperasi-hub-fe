import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { planService } from '@/services/apiService'

export async function GET(request: Request) {
    const cookieStore = await cookies()
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const token = cookieStore.get('access_token')?.value || headerToken

    const { searchParams } = new URL(request.url)
    const paramUserId = searchParams.get('user_id')
    const userId = cookieStore.get('user_id')?.value || paramUserId

    if (!token || !userId) {
        return NextResponse.json({ message: 'Unauthorized (Missing token or user_id)' }, { status: 401 })
    }

    try {
        const data = await planService.getUserSubscriptionHistory(Number(userId), token);
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Gagal memuat riwayat langganan' },
            { status: error.status || 500 }
        )
    }
}
