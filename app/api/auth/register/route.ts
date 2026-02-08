import { NextResponse } from 'next/server';
import { authService } from '@/services/apiService';
import { setAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        // 1. Parse Input dari frontend (page.tsx)
        const body = await req.json();
        const {
            name, email, password, phone,
            minishop_name, subdomain, address, area,
            flag_name,
            affiliate_code,
            role,
            captchaToken
        } = body;

        // 1. Verify CAPTCHA
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

        // 2. Register User (External API)
        console.log("Stepping into: Register User...");
        const registerRes = await authService.register({
            name,
            email,
            password,
            phone,
            role: role || 'vendor' // Kirim role ke API
        });
        console.log("Register User Success:", registerRes);

        // 3. Login otomatis untuk dapat token
        console.log("Stepping into: Auto Login...");
        let token, roleRes, user_id;
        try {
            const loginRes = await authService.login(email, password);
            token = loginRes.data.token;
            roleRes = loginRes.data.role;
            user_id = loginRes.data.user_id;
            console.log("Auto Login Success");
        } catch (loginErr: any) {
            console.error("Auto Login Failed after registration:", loginErr.message);
            return NextResponse.json({
                message: "Registrasi sukses, silakan login secara manual.",
                isRegisterSuccess: true
            }, { status: 200 });
        }

        // 4. Create Flag (Jika ada)
        const effectiveFlag = flag_name || `Vendor-${minishop_name || name}`;
        console.log("Stepping into: Create Flag...");
        try {
            await authService.createFlag(token, effectiveFlag);
            console.log("Create Flag Success");
        } catch (err: any) {
            console.error("Gagal buat flag:", err.message);
        }

        // 5. Create Store
        console.log("Stepping into: Create Store...");
        if (minishop_name) {
            try {
                const storePayload = {
                    user_id: Number(user_id),
                    name: minishop_name,
                    description: address || `Toko milik ${name}`,
                    phone: phone,
                    domain: subdomain,
                    status: '1'
                };
                console.log(`[DEBUG] Auth Register: Store Payload:`, JSON.stringify(storePayload));

                await authService.createStore(token, storePayload);
                console.log("Create Store Success");
            } catch (err: any) {
                console.error("Gagal buat store:", err.message);
            }
        }

        // 6. Finalisasi Session (Set Cookie) using utility
        await setAuthSession(token, roleRes, user_id);

        return NextResponse.json({
            message: 'Registrasi berhasil',
            data: {
                user: { id: user_id, email, role: roleRes, name }
            }
        });

    } catch (error: any) {
        console.error("Register Error Root:", error.message);
        return NextResponse.json(
            { message: error.message || 'Registrasi gagal' },
            { status: 400 }
        );
    }
}
