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
  shareUrl?: string;
};

export default function ShareCommission({
  open,
  onOpenChange,
  productName,
  shareUrl,
}: ShareCommissionProps) {
  const [href, setHref] = React.useState('');

  React.useEffect(() => {
    setHref(shareUrl || window.location.href);
  }, [shareUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagikan Produk</DialogTitle>
        </DialogHeader>

        {/* Social Share */}
        <div className="flex justify-between text-center px-12 mb-6 mt-4">
          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(href)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-sm text-gray-700">Facebook</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName} - ${href}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-sm text-gray-700">WhatsApp</span>
          </a>

          {/* X */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(href)}&text=${encodeURIComponent(productName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-sm text-gray-700">X</span>
          </a>
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
                navigator.clipboard.writeText(href)
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
