'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function DashboardHydration({
    children,
}: {
    children: React.ReactNode;
}) {
    const { hydrate } = useAuthStore();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return <>{children}</>;
}
