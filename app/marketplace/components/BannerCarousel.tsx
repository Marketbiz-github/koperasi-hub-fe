'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function BannerCarousel() {
  const slides = [
    {
      title: 'Bangun Kerjasama dengan Vendor Ternama',
      subtitle: 'Temukan vendor yang sesuai kebutuhan koperasi Anda',
      image: '/images/banners/suka1.webp',
    },
    {
      title: 'Penawaran Eksklusif untuk Koperasi',
      subtitle: 'Nikmati harga dan benefit khusus untuk anggota',
      image: '/images/banners/suka2.webp',
    },
    {
      title: 'Integrasi Mudah dan Cepat',
      subtitle: 'Atur pesanan dan komunikasi langsung dengan vendor',
      image: '/images/banners/suka3.webp',
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl shadow-lg h-48 sm:h-64 md:h-80 lg:h-96">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-transform duration-700 ease-in-out
                ${i === index ? 'translate-x-0' : i < index ? '-translate-x-full' : 'translate-x-full'}
              `}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={i === 0}
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />

              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Controls */}
          <button
            aria-label="previous"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white px-3 py-2 rounded-full shadow z-20"
          >
            ‹
          </button>

          <button
            aria-label="next"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white px-3 py-2 rounded-full shadow z-20"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition
                  ${i === index ? 'bg-white' : 'bg-white/50'}
                `}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
