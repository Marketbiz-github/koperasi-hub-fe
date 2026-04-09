// app/marketplace/thankyou/page.tsx
'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMounted } from '@/hooks/useMounted';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number') || searchParams.get('ref');

  if (!useMounted()) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
          <div className="h-2 bg-emerald-500 w-full" />
          <CardContent className="pt-12 pb-10 px-8 text-center">
            <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Terima Kasih!</h1>
            <p className="text-gray-600 mb-8">
              Pesanan Anda telah kami terima dan sedang dalam proses verifikasi pembayaran.
            </p>

            {orderNumber && (
              <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Nomor Pesanan</p>
                <p className="text-lg font-mono font-bold text-gray-800">{orderNumber}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={() => router.push('/marketplace')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02]"
              >
                <ShoppingBag className="mr-2 w-5 h-5" />
                Lanjut Belanja
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/')}
                  className="h-11 font-semibold"
                >
                  <Home className="mr-2 w-4 h-4" />
                  Beranda
                </Button>
                <Button 
                  variant="outline" 
                   onClick={() => router.push('/marketplace/cart')}
                  className="h-11 font-semibold"
                >
                  <Package className="mr-2 w-4 h-4" />
                  Pesanan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-400 text-sm mt-8">
          Butuh bantuan? <Link href="/contact" className="text-emerald-600 font-medium hover:underline">Hubungi kami</Link>
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouContent />
    </Suspense>
  );
}
