import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { productCategoryService } from '@/services/apiService'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await productCategoryService.getList(token)
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
        const data = await productCategoryService.create(token, body)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}
