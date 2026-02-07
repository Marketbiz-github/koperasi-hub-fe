'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
    const siteKey = process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_CAPTHA_SITE_KEY ||
        '6Lf432MsAAAAAAdf4tda4OczwMmveUiibzORMcCe';

    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={siteKey}
            scriptProps={{
                async: false,
                defer: false,
                appendTo: 'head',
                nonce: undefined,
            }}
        >
            {children}
        </GoogleReCaptchaProvider>
    );
}
