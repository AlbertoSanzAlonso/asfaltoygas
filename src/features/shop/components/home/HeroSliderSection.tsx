import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { HERO_SLIDES, HERO_WIDGET, PROMO_BANNERS } from '../../data/homeContent';
import { BRAND } from '@/lib/brand';

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
    <section className="pt-16 md:pt-[72px] bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">
        {/* Slider + widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          {/* Main slider */}
          <div className="lg:col-span-8 relative aspect-[16/9] lg:aspect-auto lg:min-h-[420px] overflow-hidden bg-secondary group">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/50 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-14 max-w-xl">
              <p className="font-display text-primary text-sm md:text-base font-semibold tracking-[0.3em] uppercase mb-3">
                {BRAND.tagline}
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase leading-[0.95] tracking-wide mb-4">
                {slide.title}
              </h1>
              <p className="font-sans text-white/75 text-sm md:text-base mb-8 max-w-sm">
                {slide.subtitle}
              </p>
              <Link
                to={slide.href}
                className="inline-flex items-center gap-2 w-fit bg-primary hover:bg-primary-dark text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3.5 transition-colors"
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Controls */}
            <button onClick={prev} aria-label="Anterior" className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} aria-label="Siguiente" className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-5 left-8 md:left-14 z-20 flex gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Ir a slide ${i + 1}`}
                  className={`h-1 transition-all ${i === active ? 'w-10 bg-primary' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </div>

          {/* Side widget */}
          <Link
            to={HERO_WIDGET.href}
            className="lg:col-span-4 relative min-h-[200px] lg:min-h-[420px] overflow-hidden bg-secondary group block"
          >
            <img
              src={HERO_WIDGET.image}
              alt={HERO_WIDGET.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-secondary/20" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
              <span className="inline-block w-fit bg-primary text-white font-display text-[10px] font-bold tracking-[0.25em] uppercase px-3 py-1 mb-4">
                {HERO_WIDGET.badge}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white uppercase tracking-wide mb-1">
                {HERO_WIDGET.title}
              </h3>
              <p className="font-sans text-white/70 text-sm mb-2">{HERO_WIDGET.subtitle}</p>
              <p className="font-display text-primary text-xl font-bold mb-5">{HERO_WIDGET.price}</p>
              <span className="inline-flex items-center gap-2 text-white font-display text-xs font-bold tracking-[0.2em] uppercase group-hover:text-primary transition-colors">
                {HERO_WIDGET.cta} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        </div>

        {/* Promo banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mt-4 md:mt-5">
          {PROMO_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              to={banner.href}
              className="relative h-36 md:h-44 overflow-hidden group block"
            >
              <img
                src={banner.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-secondary/70 group-hover:bg-secondary/60 transition-colors" />
              <div className="relative z-10 h-full flex flex-col justify-center px-6">
                <h3 className="font-display text-lg md:text-xl font-bold text-white uppercase tracking-wide">
                  {banner.title}
                </h3>
                <p className="font-sans text-white/70 text-xs md:text-sm mt-1">{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
