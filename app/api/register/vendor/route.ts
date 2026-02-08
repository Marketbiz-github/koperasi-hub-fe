import { NextResponse } from 'next/server'
import { authService, adminService } from '@/services/apiService'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, phone, subdomain, store_name, flag_id, captchaToken, role } = body

        // 0. Verify CAPTCHA
        if (!captchaToken) {
            return NextResponse.json({ message: 'CAPTCHA token is required' }, { status: 400 });
        }

        const secretKey = process.env.GOOGLE_CAPTCHA_SECRET_KEY || process.env.GOOGLE_CAPTHA_SECRET_KEY;
        const verifyResponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`, {
            method: 'POST',
        });
        const verifyData = await verifyResponse.json();

        if (!verifyData.success) {
            return NextResponse.json({ message: 'Invalid CAPTCHA' }, { status: 400 });
        }

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

        // 2. Register New User
        let userResult;
        try {
            userResult = await authService.register({
                name,
                email,
                password,
                phone,
                role: role || 'vendor'
            })
        } catch (error: any) {
            return NextResponse.json(
                {
                    message: `Gagal mendaftarkan user: ${error.message}`,
                    errorData: error.data
                },
                { status: error.status || 400 }
            )
        }

        // The external API returns ID directly in data as verified by user: data.id
        const userId = userResult.data?.id || userResult.data?.user?.id

        if (!userId) {
            console.error('Registration response missing ID:', userResult)
            return NextResponse.json(
                { message: 'Registrasi berhasil tapi ID user tidak ditemukan' },
                { status: 400 }
            )
        }

        // 3. Assign Flag (Optional)
        if (flag_id) {
            try {
                // Ensure IDs are sent as numbers if possible, 
                // some APIs are strict about type validation
                await adminService.assignFlagToUser(adminToken, {
                    user_id: Number(userId),
                    flag_id: Number(flag_id)
                })
            } catch (error: any) {
                console.error('Assign flag fail for User:', userId, 'Flag:', flag_id, 'Error:', error.message)
                return NextResponse.json(
                    {
                        message: `Gagal memberikan label flag: ${error.message}`,
                        errorData: error.data
                    },
                    { status: error.status || 400 }
                )
            }
        }

        // 4. Create Store
        let storeResult;
        try {
            storeResult = await authService.createStore(adminToken, {
                user_id: userId,
                name: store_name,
                subdomain: subdomain
            })
        } catch (error: any) {
            console.error('Create store fail:', error)
            return NextResponse.json(
                {
                    message: `Gagal membuat toko: ${error.message}`,
                    errorData: error.data
                },
                { status: error.status || 400 }
            )
        }

        const storeId = storeResult.data?.id || storeResult.data?.store?.id

        if (!storeId) {
            console.error('Store creation response missing ID:', storeResult)
            return NextResponse.json(
                { message: 'Toko berhasil dibuat tapi ID toko tidak ditemukan' },
                { status: 400 }
            )
        }

        // 5. Register iPaymu SSO
        // try {
        //     await adminService.registerIpaymu(adminToken, storeId, { password })
        // } catch (error: any) {
        //     return NextResponse.json(
        //         { message: `Gagal registrasi iPaymu SSO: ${error.message}` },
        //         { status: 400 }
        //     )
        // }

        return NextResponse.json({
            meta: {
                code: 200,
                status: 'success',
                message: 'Vendor registration completed successfully'
            },
            data: {
                user_id: userId,
                store_id: storeId
            }
        })

    } catch (error: any) {
        console.error('Unified Register error:', error)
        return NextResponse.json(
            {
                message: error.message || 'Terjadi kesalahan sistem saat registrasi',
                errorData: error.data,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: error.status || 500 }
        )
    }
}
