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
        const feature_ids: number[] = body.feature_ids || []
        
        const results = await Promise.all(
            feature_ids.map(featureId => 
                featureService.assignFeatureToPlan(Number(id), featureId, token)
            )
        )
        return NextResponse.json({ message: 'Berhasil meng-assign fitur', data: results })
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Gagal meng-assign fitur ke paket' }, { status: error.status || 500 })
    }
}
