'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  isLoading: boolean;
  hasMore: boolean;
  loadingText?: string;
}

export default function InfiniteScrollTrigger({
  onIntersect,
  isLoading,
  hasMore,
  loadingText = 'Memuat lebih banyak produk...',
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = triggerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onIntersect();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Trigger slightly before the user completely reaches the bottom
        threshold: 0,
      }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
  }, [hasMore, isLoading, onIntersect]);

  if (!hasMore) {
    return (
      <div className="py-8 text-center text-slate-400 text-sm font-medium">
        Seluruh produk telah ditampilkan
      </div>
    );
  }

  return (
    <div
      ref={triggerRef}
      className="w-full flex justify-center items-center py-8 min-h-[100px]"
    >
      {isLoading && (
        <div className="flex flex-col items-center gap-3 text-[var(--store-primary,#10b981)]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-slate-500">{loadingText}</span>
        </div>
      )}
    </div>
  );
}
