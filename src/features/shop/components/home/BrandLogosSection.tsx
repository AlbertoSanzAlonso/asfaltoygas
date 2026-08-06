import React from 'react';
import { BRAND_LOGOS } from '../../data/homeContent';
import { getBrandLogoSize } from '@/lib/brandLogos';

const BrandMark: React.FC<{
  name: string;
  slug: string;
  logo: string;
}> = ({ name, slug, logo }) => {
  const { height, maxWidth } = getBrandLogoSize(slug, 'sm', 1.3);

  return (
    <div className="group relative flex shrink-0 cursor-pointer flex-col items-center px-3 md:px-5 pb-4">
      <div className="relative z-10 flex items-center justify-center" style={{ height: 104, minWidth: maxWidth }}>
        <img
          src={logo}
          alt={name}
          title={name}
          loading="lazy"
          draggable={false}
          className="object-contain opacity-40 grayscale transition-all duration-300 select-none group-hover:-translate-y-1 group-hover:opacity-80 group-hover:grayscale-0"
          style={{ height, maxWidth, width: 'auto' }}
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
};

export const BrandLogosSection: React.FC = () => {
  const loop = [...BRAND_LOGOS, ...BRAND_LOGOS];

  return (
    <section id="marcas" className="py-10 md:py-14 overflow-hidden" aria-label="Marcas">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 md:w-24 bg-gradient-to-r from-accent to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 md:w-24 bg-gradient-to-l from-accent to-transparent" />

        <div className="flex w-max animate-brand-marquee">
          {loop.map((brand, index) => (
            <BrandMark
              key={`${brand.slug}-${index}`}
              name={brand.name}
              slug={brand.slug}
              logo={brand.logo}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
