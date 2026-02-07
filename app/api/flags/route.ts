import { NextResponse } from 'next/server'
import { authService, adminService } from '@/services/apiService'

export async function GET() {
    try {
        // 1. Login as Super Admin to get token
        const adminEmail = process.env.SUPER_ADMIN_EMAIL
        const adminPassword = process.env.SUPER_ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
            throw new Error('Super Admin credentials not configured')
        }

        const loginResult = await authService.login(adminEmail, adminPassword)
        const adminToken = loginResult.data?.token

        if (!adminToken) {
            throw new Error('Gagal mendapatkan token admin')
        }

        // 2. Fetch flags using admin token
        const flagsResult = await adminService.getFlags(adminToken)

        return NextResponse.json(flagsResult)
    } catch (error: any) {
        console.error('API Flags error:', error)
        return NextResponse.json(
            { message: error.message || 'Gagal mengambil data flags' },
            { status: 500 }
        )
    }
}
