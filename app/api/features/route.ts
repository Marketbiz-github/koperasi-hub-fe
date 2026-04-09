import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { featureService } from '@/services/apiService'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    try {
        const data = await featureService.getFeatures(token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil data fitur' }, { status: error.status || 500 })
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const data = await featureService.createFeature(body, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menambah fitur' }, { status: error.status || 500 })
    }
}
