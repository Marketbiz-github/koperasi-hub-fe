import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { featureService } from '@/services/apiService'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        // Assuming body contains { feature_ids: number[] }
        const data = await featureService.assignFeatureToPlan({ plan_id: Number(id), feature_ids: body.feature_ids }, token)
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal meng-assign fitur ke paket' }, { status: error.status || 500 })
    }
}
