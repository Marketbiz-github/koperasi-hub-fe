import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { platformFeeService } from '@/services/apiService'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const data = await platformFeeService.update(token, id, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengupdate platform fee' }, { status: error.status || 500 })
    }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await platformFeeService.delete(token, id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menghapus platform fee' }, { status: error.status || 500 })
    }
}
