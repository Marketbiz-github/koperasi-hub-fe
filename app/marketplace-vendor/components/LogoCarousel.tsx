'use client';

import Image from 'next/image';

type LogoCarouselProps = {
  logos: string[];
};

export default function LogoCarousel({ logos }: LogoCarouselProps) {
  // duplicate array for seamless infinite scroll
  const items = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden py-6">
      <div className="flex w-max animate-logo-slide hover:[animation-play-state:paused]">
        {items.map((logo, index) => (
          <div
            key={index}
            className="
              shrink-0 
              mx-4 sm:mx-6 
              w-16 h-16 sm:w-20 sm:h-20
              rounded-full 
              bg-white 
              shadow-md 
              flex items-center justify-center
            "
          >
            <Image
              src={logo}
              alt={`Partner ${index + 1}`}
              width={80}
              height={80}
              className="rounded-full opacity-60 hover:opacity-100 transition"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
