import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { gudangService } from '@/services/apiService'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const store_id = searchParams.get('store_id')
    const product_id = searchParams.get('product_id')
    const product_variant_id = searchParams.get('product_variant_id')

    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await gudangService.getList(token, {
            page: parseInt(page),
            limit: parseInt(limit),
            store_id: store_id || undefined,
            product_id: product_id || undefined,
            product_variant_id: product_variant_id || undefined
        })
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const data = await gudangService.create(token, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}
