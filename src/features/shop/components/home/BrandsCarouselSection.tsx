import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BRAND_CAROUSEL } from '../../data/homeContent';
import { SectionHeading } from './SectionHeading';

export const BrandsCarouselSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  return (
    <section id="marcas" className="py-16 md:py-24 bg-accent">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading eyebrow="Distribuidores oficiales" title="Nuestras marcas" />

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Marcas anteriores"
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white shadow-lg border border-secondary/5 items-center justify-center text-secondary hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Marcas siguientes"
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white shadow-lg border border-secondary/5 items-center justify-center text-secondary hover:text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 px-1"
            style={{ perspective: '1200px' }}
          >
            {BRAND_CAROUSEL.map((brand, i) => (
              <div
                key={brand.name}
                className="snap-center shrink-0 w-[220px] md:w-[260px]"
                style={{
                  transform: `rotateY(${(i % 2 === 0 ? -1 : 1) * 4}deg)`,
                }}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-secondary shadow-xl group">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/categoria/cascos"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-10 py-3.5 transition-colors"
          >
            Ver todas las marcas
          </Link>
        </div>
      </div>
    </section>
  );
};
