import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { planService } from '@/services/apiService'

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        let return_url: string | undefined;
        try {
            const body = await request.json();
            return_url = body.return_url;
        } catch (e) {
            // Body might be empty or not JSON, ignore
        }

        const data = await planService.orderPlan({ 
            plan_id: Number(id), 
            return_url 
        }, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Gagal melakukan order paket' },
            { status: error.status || 500 }
        )
    }
}
