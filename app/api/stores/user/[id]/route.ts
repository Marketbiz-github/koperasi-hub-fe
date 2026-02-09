import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { apiRequest } from '@/services/apiService'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    const id = (await params).id

    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Use apiRequest directly since there isn't a dedicated storeService for this yet
        // or we could add one to apiService.ts
        const data = await apiRequest(`/stores/user/${id}`, { token })
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
