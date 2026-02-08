import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generalCategoryService } from '@/services/apiService'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    try {
        const data = await generalCategoryService.getList(token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil data kategori' }, { status: error.status || 500 })
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
        const data = await generalCategoryService.create(token, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menambah kategori' }, { status: error.status || 500 })
    }
}
