'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselBannerProps = {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
  height?: string;
};

export default function CarouselBanner({
  images,
  autoPlay = true,
  interval = 5000,
  height = 'h-64 md:h-96',
}: CarouselBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlay || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, images.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsAutoPlay(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  if (images.length === 0) {
    return (
      <div className={`${height} bg-gray-300 rounded-lg overflow-hidden`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div
        className={`${height} relative rounded-lg overflow-hidden bg-gray-200 group`}
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => autoPlay && setIsAutoPlay(true)}
      >
        {/* Images */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                fill
                className="w-full h-full object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              aria-label="Previous slide"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              aria-label="Next slide"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slide Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#10b981] w-8'
                  : 'bg-gray-300 w-2.5 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
