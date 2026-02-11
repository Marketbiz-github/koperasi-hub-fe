import { NextResponse } from 'next/server'
import { authService, userService } from '@/services/apiService'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            name, email, password, phone,
            subdomain, store_name,
            flag_ids, // Changed from flag_id to flag_ids (array)
            plan_id,
            // ipaymu_password, // Removed specific field, will use password
            captchaToken,
            role,
            // Affiliation fields
            parent_id,
            affiliation_type
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
        // "Digunakan untuk melakukan pendaftaran user baru dengan satu endpoint... token tidak di perlukan"

        // Prepare payload for onboarding
        const onboardingPayload = {
            name,
            email,
            password,
            phone,
            role: role || 'vendor',
            store_name,
            store_subdomain: subdomain, // Mapping subdomain -> store_subdomain
            ipaymu_password: password, // Default to account password if not provided? Or make it required? User request showed it in JSON.
            flag_ids: Array.isArray(flag_ids) ? flag_ids.map(Number) : (flag_ids ? [Number(flag_ids)] : []),
            plan_id: plan_id ? Number(plan_id) : 1 // Default to 1 as requested
        };

        console.log('[DEBUG] Calling Onboarding API with:', JSON.stringify(onboardingPayload, null, 2));

        let onboardingResult;
        try {
            onboardingResult = await authService.onboarding(onboardingPayload);
        } catch (error: any) {
            console.error('Onboarding API Error:', error);
            return NextResponse.json(
                {
                    message: error.message || 'Gagal melakukan pendaftaran onboarding',
                    errorData: error.data
                },
                { status: error.status || 400 }
            )
        }

        const newUserId = onboardingResult.data?.user?.id || onboardingResult.data?.user_id;

        if (!newUserId) {
            console.warn('[WARN] Onboarding success but no User ID returned:', onboardingResult);
        }

        // 3. Handle Affiliation (if applicable)
        if (newUserId && parent_id && affiliation_type) {
            console.log(`[DEBUG] Processing affiliation for User ${newUserId} -> Parent ${parent_id} (${affiliation_type})`);

            try {
                // Login as Super Admin to get token for affiliation
                const adminEmail = process.env.SUPER_ADMIN_EMAIL
                const adminPassword = process.env.SUPER_ADMIN_PASSWORD

                if (adminEmail && adminPassword) {
                    const loginResult = await authService.login(adminEmail, adminPassword)
                    const adminToken = loginResult.data?.token

                    if (adminToken) {
                        await userService.addAffiliation({
                            parent_id: Number(parent_id),
                            child_id: Number(newUserId),
                            type: affiliation_type
                        }, adminToken);
                        console.log('[DEBUG] Affiliation verified successfully');
                    } else {
                        console.error('[ERROR] Failed to get admin token for affiliation');
                    }
                } else {
                    console.error('[ERROR] Super Admin credentials not configured for affiliation');
                }
            } catch (affError: any) {
                console.error('[ERROR] Affiliation failed:', affError.message);
                // We don't block registration success if affiliation fails, but we log it.
            }
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
        console.error('Registration Route Error:', error)
        return NextResponse.json(
            {
                message: error.message || 'Terjadi kesalahan sistem',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
