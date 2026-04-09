// app/dashboard/vendor/thankyou/page.tsx
'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMounted } from '@/hooks/useMounted';
import { useAuthStore } from '@/store/authStore';

function ThankYouVendorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const refId = searchParams.get('ref');
  const { hydrate } = useAuthStore();

  React.useEffect(() => {
    if (type === 'plan') {
      hydrate();
    }
  }, [type, hydrate]);

  if (!useMounted()) return null;

  const isPlan = type === 'plan';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-500">
        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="h-2 bg-emerald-500 w-full" />
          <CardContent className="pt-12 pb-10 px-8 text-center">
            <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Transaksi Berhasil!</h1>
            <p className="text-gray-500 mb-8">
              {isPlan
                ? 'Pembayaran paket langganan Anda telah diterima dan sedang diproses. Silakan refresh dashboard Anda beberapa saat lagi.'
                : 'Pembayaran transaksi Vendor Anda telah diterima dan sedang diproses.'}
            </p>

            {refId && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1">Referensi Transaksi</p>
                <p className="text-base font-mono font-bold text-gray-700">{refId}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="default"
                onClick={() => router.push('/dashboard/vendor')}
                className="h-12 font-bold bg-emerald-600 hover:bg-emerald-700 w-full shadow-lg shadow-emerald-100 text-white"
              >
                <LayoutDashboard className="mr-2 w-5 h-5" />
                Kembali ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ThankYouVendorPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouVendorContent />
    </Suspense>
  );
}
