import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { planService } from '@/services/apiService'

export async function POST(request: Request) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { plan_id, return_url } = body;
        
        if (!plan_id) {
            return NextResponse.json({ message: 'plan_id diperlukan' }, { status: 400 });
        }

        const data = await planService.orderPlan({ plan_id: Number(plan_id), return_url }, token);
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Gagal memproses langganan' },
            { status: error.status || 500 }
        )
    }
}
