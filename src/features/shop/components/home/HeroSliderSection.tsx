import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Construction } from 'lucide-react';
import { HERO_SLIDES } from '../../data/homeContent';
import { HeroSmokeEffect } from './HeroSmokeEffect';

export const HeroSliderSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const total = HERO_SLIDES.length;

  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = HERO_SLIDES[active];

  return (
    <section className="relative bg-secondary">
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center gap-2 sm:gap-3 bg-safety text-secondary font-display font-bold uppercase text-xs sm:text-sm tracking-[0.15em] py-2.5 sm:py-3 px-4">
        <Construction className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.5} />
        <span>Sitio en construcción · Próximamente disponible</span>
      </div>
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1] min-h-[320px] max-h-[560px]">
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img src={slide.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/70 to-secondary/30" />
            </motion.div>
          </AnimatePresence>
        </div>

        <HeroSmokeEffect />

        <div className="absolute inset-0 z-10 flex items-center px-6 sm:px-10 lg:px-16 pointer-events-none">
          <div className="w-full max-w-[1800px] mx-auto pointer-events-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 max-w-4xl">
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white uppercase leading-[0.9] tracking-wide">
                {slide.titleLeft}
              </h1>
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-safety uppercase leading-[0.9] tracking-wide sm:text-right">
                {slide.titleRight}
              </h1>
            </div>
            <p className="font-sans text-white/80 text-sm md:text-base mt-6 max-w-md">
              {slide.subtitle}
            </p>
            <Link
              to={slide.href}
              className="inline-block mt-8 bg-safety hover:bg-safety-dark text-secondary font-display font-bold text-sm tracking-[0.2em] uppercase px-10 py-3.5 transition-colors"
            >
              Ver oferta
            </Link>
          </div>
        </div>

        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-safety transition-colors"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5]" />
        </button>
        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-safety transition-colors"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10 stroke-[1.5]" />
        </button>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Ir a slide ${i + 1}`}
              className={`h-1 transition-all ${i === active ? 'w-10 bg-safety' : 'w-4 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
