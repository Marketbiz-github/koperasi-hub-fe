"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Loader2,
    Users,
    Gift,
    BarChart3
} from 'lucide-react';
import { campaignService } from '@/services/apiService';
import { getAccessToken } from '@/utils/auth';
import { toast } from 'sonner';
import { CampaignSharesTable } from '../../components/CampaignSharesTable';

export default function CampaignSharesPage() {
    const { id } = useParams();
    const router = useRouter();
    const [shares, setShares] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await getAccessToken();
            if (!token) return;

            const sharesRes = await campaignService.getCampaignShares(token, id as string);

            if (sharesRes.data) {
                // Adjust based on the provided response structure: data.data is the array
                const sharesData = sharesRes.data.data || sharesRes.data || [];
                setShares(Array.isArray(sharesData) ? sharesData : []);
            }
        } catch (error) {
            console.error('Error fetching campaign shares:', error);
            toast.error('Gagal mengambil data statistik share');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-gray-500 font-medium">Memuat statistik share...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Statistik Share Campaign</h1>
                        <p className="text-sm text-gray-500 mt-0.5">ID Campaign: #{id}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Aktivitas Promotor</h2>
                </div>
                <CampaignSharesTable shares={shares} />
            </div>
        </div>
    );
}
