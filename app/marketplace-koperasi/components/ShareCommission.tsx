"use client";

import React from 'react';
import { Facebook, MessageCircle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ShareCommissionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
};

export default function ShareCommission({
  open,
  onOpenChange,
}: ShareCommissionProps) {
  const [href, setHref] = React.useState('');

  React.useEffect(() => {
    setHref(window.location.href);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Produk</DialogTitle>
        </DialogHeader>

        {/* Social Share */}
        <div className="flex justify-between text-center px-12 mb-6 mt-4">
          {/* Facebook */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                23
              </span>
            </div>
            <span className="text-sm text-gray-700">Facebook</span>
          </div>

          {/* WhatsApp */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                10
              </span>
            </div>
            <span className="text-sm text-gray-700">WhatsApp</span>
          </div>

          {/* X */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                6
              </span>
            </div>
            <span className="text-sm text-gray-700">X</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            readOnly
            value={href}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={() =>
                navigator.clipboard.writeText(window.location.href)
              }
              className="flex-1 gradient-green text-white py-2 rounded-md text-sm font-medium"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500">
        *Sebarkan link untuk memperoleh komisi dari setiap transaksi
        </p>
      </DialogContent>
    </Dialog>
  );
}
