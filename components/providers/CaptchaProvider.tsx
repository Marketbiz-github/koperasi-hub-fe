'use client';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { usePathname } from 'next/navigation';

export function CaptchaProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const siteKey = process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY ||
        process.env.NEXT_PUBLIC_GOOGLE_CAPTHA_SITE_KEY ||
        '6Lf432MsAAAAAAdf4tda4OczwMmveUiibzORMcCe';

    // List of paths that require CAPTCHA
    const isCaptchaPage = pathname === '/login' || pathname.startsWith('/register/');

    if (!isCaptchaPage) {
        return <>{children}</>;
    }

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
