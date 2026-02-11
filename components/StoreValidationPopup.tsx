'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { apiRequest } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { Loader2, AlertTriangle, Store } from 'lucide-react';
import Link from 'next/link';

interface StoreData {
    id: number;
    description: string | null;
    // ipaymu_va removed
    province_id: number | null;
    city_id: number | null;
    district_id: number | null;
    area_id: number | null;
    courier: string | null;
    logo: string | null;
    color: string | null;
    [key: string]: any;
}

export default function StoreValidationPopup() {
    const { user, isHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [storeData, setStoreData] = useState<StoreData | null>(null);

    useEffect(() => {
        // Only run on dashboard pages
        if (!pathname?.startsWith('/dashboard')) return;

        // Skip if on store settings page to avoid loop
        if (pathname?.endsWith('/store-settings')) {
            setShowPopup(false);
            return;
        }

        const checkStoreData = async () => {
            if (!isHydrated || !user || user.role === 'super_admin') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                // Fetch user stores
                const token = await getAccessToken();
                const response = await apiRequest(`/stores/user/${user.id}`, { token: token || undefined });

                if (response.data && response.data.length > 0) {
                    const store = response.data[0]; // Assuming user has one store for now
                    setStoreData(store);

                    // Check for critical missing fields as per requirement
                    const missingFields = [];
                    if (!store.description) missingFields.push('Deskripsi Toko');
                    // ipaymu_va check removed
                    if (!store.area_id) missingFields.push('Area/Kelurahan');
                    if (!store.logo) missingFields.push('Logo Toko');
                    // color check removed
                    if (!store.courier) missingFields.push('Kurir Pengiriman');

                    if (missingFields.length > 0) {
                        setShowPopup(true);
                    }
                }
            } catch (error) {
                console.error('Failed to validate store data:', error);
            } finally {
                setLoading(false);
            }
        };

        checkStoreData();
    }, [pathname, isHydrated, user]);

    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                        <Store className="w-8 h-8 text-orange-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Lengkapi Data Toko</h2>

                    <p className="text-slate-600 mb-6">
                        Halo <strong>{user?.name}</strong>! Sebelum mulai berjualan, mohon lengkapi informasi toko Anda terlebih dahulu.
                    </p>

                    <div className="w-full bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-left text-slate-700">
                                <p className="font-semibold mb-1">Data yang belum lengkap:</p>
                                <ul className="list-disc list-inside text-slate-600 space-y-1">
                                    {!storeData?.description && <li>Deskripsi Toko</li>}
                                    {/* ipaymu_va check removed */}
                                    {!storeData?.area_id && <li>Alamat Lengkap (Area/Kelurahan)</li>}
                                    {!storeData?.logo && <li>Logo Toko</li>}
                                    {/* color check removed */}
                                    {!storeData?.courier && <li>Kurir Pengiriman</li>}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/dashboard/${user?.role}/store-settings`}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Lengkapi Sekarang
                    </Link>

                    <p className="text-xs text-slate-400 mt-4">
                        Data ini diperlukan untuk operasional toko Anda.
                    </p>
                </div>
            </div>
        </div>
    );
}
