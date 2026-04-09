'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionBannerProps {
    role: 'vendor' | 'koperasi' | 'reseller';
}

export function SubscriptionBanner({ role }: SubscriptionBannerProps) {
    const { user } = useAuthStore();

    if (!user) return null;

    const isFreePlan = !user.plan || user.plan.price === '0';
    if (!isFreePlan) return null;

    const upgradeUrl = `/dashboard/${role}/langganan`;

    return (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                    Kamu menggunakan <strong>Paket Gratis</strong>. Upgrade sekarang untuk mengakses semua fitur.
                </span>
            </div>
            <Button
                asChild
                size="sm"
                className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shrink-0 h-7 px-3 text-xs"
            >
                <Link href={upgradeUrl}>
                    <Zap className="mr-1 h-3 w-3" />
                    Upgrade Paket
                </Link>
            </Button>
        </div>
    );
}
