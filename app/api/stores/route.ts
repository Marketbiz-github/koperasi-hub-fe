import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { storeService } from '@/services/apiService'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const search = request.nextUrl.searchParams.get('search') || undefined
    const limit = request.nextUrl.searchParams.get('limit') ? Number(request.nextUrl.searchParams.get('limit')) : undefined

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await storeService.getStores(token, { search, limit })
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil data store' }, { status: error.status || 500 })
    }
}
