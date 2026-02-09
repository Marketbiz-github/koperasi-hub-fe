import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { productCategoryService } from '@/services/apiService'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await productCategoryService.getDetail(token, id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const data = await productCategoryService.update(token, id, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await productCategoryService.delete(token, id)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}
