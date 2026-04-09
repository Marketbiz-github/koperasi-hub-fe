'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PlanAccessGuardProps {
    children: ReactNode;
    role: 'vendor' | 'koperasi' | 'reseller';
}

export function PlanAccessGuard({ children, role }: PlanAccessGuardProps) {
    const pathname = usePathname();
    const { user } = useAuthStore();

    if (!user) return <>{children}</>;

    const isFreePlan = !user.plan || user.plan.price === '0' || user.plan.id === 1;

    // Daftar path yang boleh diakses meskipun menggunakan paket Free
    const allowedPathBaseUrls = [
        `/dashboard/${role}/store-settings`,
        `/dashboard/${role}/langganan`
    ];

    // Jika path-nya exact di root dashboard (contoh: /dashboard/vendor)
    const isDashboardHome = pathname === `/dashboard/${role}`;
    
    // Mengecek apakah mengakses menu pengaturan toko atau halaman langganan
    const isAllowedCustomPath = allowedPathBaseUrls.some(path => pathname === path || pathname.startsWith(path + '/'));

    const isAllowed = isDashboardHome || isAllowedCustomPath;

    if (isFreePlan && !isAllowed) {
        const upgradeUrl = `/dashboard/${role}/langganan`;
        
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
                    Menu Terkunci
                </h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Menu ini membuntuhkan langganan aktif. Upgrade paket langganan tokomu sekarang untuk menikmati semua fitur tanpa hambatan.
                </p>
                <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 h-12 shadow-lg shadow-orange-500/20 w-full sm:w-auto">
                    <Link href={upgradeUrl}>
                        <Zap className="mr-2 h-5 w-5" />
                        Upgrade Paket Sekarang
                    </Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
}
