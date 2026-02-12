import { NextResponse } from 'next/server'
import { authService, userService } from '@/services/apiService'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            name, email, password, phone,
            subdomain, store_name,
            flag_ids,
            plan_id,
            captchaToken,
            // role is hardcoded
            // Affiliation fields removed
        } = body

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

        // 2. Call Onboarding API
        const onboardingPayload = {
            name,
            email,
            password,
            phone,
            role: 'reseller', // Hardcoded role
            store_name,
            store_subdomain: subdomain,
            ipaymu_password: password,
            flag_ids: Array.isArray(flag_ids) ? flag_ids.map(Number) : (flag_ids ? [Number(flag_ids)] : []),
            plan_id: plan_id ? Number(plan_id) : 1
        };

        console.log('[DEBUG] Calling Onboarding API for Reseller with:', JSON.stringify(onboardingPayload, null, 2));

        let onboardingResult;
        try {
            onboardingResult = await authService.onboarding(onboardingPayload);
        } catch (error: any) {
            console.error('Onboarding API Error (Reseller):', error);
            return NextResponse.json(
                {
                    message: error.message || 'Gagal melakukan pendaftaran onboarding',
                    errorData: error.data
                },
                { status: error.status || 400 }
            )
        }

        return NextResponse.json({
            meta: {
                code: 200,
                status: 'success',
                message: 'Registration completed successfully'
            },
            data: onboardingResult.data
        })

    } catch (error: any) {
        console.error('Registration Route Error (Reseller):', error)
        return NextResponse.json(
            {
                message: error.message || 'Terjadi kesalahan sistem',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
