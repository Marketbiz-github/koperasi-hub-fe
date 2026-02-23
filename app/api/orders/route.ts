import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { orderService } from '@/services/apiService'

export async function POST(request: Request) {
    const body = await request.json()
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await orderService.createOrder(body, token)
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('API Orders Proxy Error:', error)
        return NextResponse.json({ message: error.message }, { status: error.status || 500 })
    }
}
