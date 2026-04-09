import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { featureService } from '@/services/apiService'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    try {
        const data = await featureService.getFeatureDetail(id, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengambil detail fitur' }, { status: error.status || 500 })
    }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const data = await featureService.updateFeature(id, body, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal mengupdate fitur' }, { status: error.status || 500 })
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
        const data = await featureService.deleteFeature(id, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal menghapus fitur' }, { status: error.status || 500 })
    }
}
