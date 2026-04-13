import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { platformFeeService } from '@/services/apiService'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await platformFeeService.getList(token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil data platform fee' }, { status: error.status || 500 })
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
        const data = await platformFeeService.create(token, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menambah platform fee' }, { status: error.status || 500 })
    }
}
