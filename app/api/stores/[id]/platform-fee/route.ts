import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { storeService } from '@/services/apiService'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    try {
        const data = await storeService.getStorePlatformFee(token || "", id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil platform fee store' }, { status: error.status || 500 })
    }
}
