import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generalCategoryService } from '@/services/apiService'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const id = (await params).id

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await generalCategoryService.getDetail(token, id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil detail kategori' }, { status: error.status || 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const id = (await params).id

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const data = await generalCategoryService.update(token, id, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal memperbarui kategori' }, { status: error.status || 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const id = (await params).id

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await generalCategoryService.delete(token, id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menghapus kategori' }, { status: error.status || 500 })
    }
}
