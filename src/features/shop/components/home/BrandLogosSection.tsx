import React from 'react';
import { BRAND_LOGOS } from '../../data/homeContent';

export const BrandLogosSection: React.FC = () => (
  <section id="marcas" className="py-10 md:py-14 bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
        {BRAND_LOGOS.map((brand) => (
          <span
            key={brand}
            className="font-display text-sm md:text-base font-bold uppercase tracking-[0.15em] text-secondary/25 hover:text-secondary/50 transition-colors select-none"
          >
            {brand}
          </span>
        ))}
      </div>
    </div>
  </section>
);
