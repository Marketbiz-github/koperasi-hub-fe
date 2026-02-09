import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { productService } from '@/services/apiService'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const store_id = searchParams.get('store_id')
    const page = searchParams.get('page')
    const limit = searchParams.get('limit')
    const name = searchParams.get('name')
    const status = searchParams.get('status')
    const category_id = searchParams.get('product_category_id')

    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await productService.getProducts({
            store_id: store_id || undefined,
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            name: name || undefined,
            status: status || undefined,
            category_id: category_id || undefined,
        }, token)

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('API Products Proxy Error:', error)
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}
