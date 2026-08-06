import React from 'react';
import { BRAND_LOGOS } from '../../data/homeContent';

export const BrandLogosSection: React.FC = () => (
  <section id="marcas" className="py-10 md:py-14">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-end justify-center gap-x-10 gap-y-10 md:gap-x-14">
        {BRAND_LOGOS.map((brand) => {
          const scale = 'scale' in brand ? brand.scale : 1;
          return (
            <div
              key={brand.name}
              className="group relative flex flex-col items-center pb-4"
            >
              <div
                className="relative z-10"
                style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  title={brand.name}
                  loading="lazy"
                  className="h-8 md:h-10 w-auto max-w-[120px] object-contain opacity-40 grayscale transition-all duration-300 select-none group-hover:-translate-y-1 group-hover:opacity-80 group-hover:grayscale-0"
                />
              </div>
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-1/2 h-3 w-14 -translate-x-1/2 transition-all duration-300 group-hover:h-2.5 group-hover:w-16 group-hover:opacity-80"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
