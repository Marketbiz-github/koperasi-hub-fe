import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { planService } from '@/services/apiService'

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await planService.getUserSubscriptionHistory(Number(id), token);
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Gagal memuat riwayat langganan' },
            { status: error.status || 500 }
        )
    }
}
