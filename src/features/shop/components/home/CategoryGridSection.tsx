import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HOME_CATEGORIES } from '../../data/homeContent';
import { SectionHeading } from './SectionHeading';

const CARD_WIDTH = 240;
const CARD_GAP = 52;

const getOffset = (index: number, active: number, total: number) => {
  let offset = index - active;
  const half = Math.floor(total / 2);
  if (offset > half) offset -= total;
  if (offset < -half) offset += total;
  return offset;
};

const CategoryCard: React.FC<{ cat: typeof HOME_CATEGORIES[number] }> = ({ cat }) => (
  <Link
    to={cat.href}
    className="group relative block aspect-[4/5] overflow-hidden bg-secondary shadow-2xl"
  >
    <img
      src={cat.image}
      alt={cat.label}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
      style={{ objectPosition: cat.objectPosition }}
    />
    <div className="absolute inset-0 bg-primary/70 mix-blend-multiply group-hover:bg-primary/60 transition-colors" />
    <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent" />
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <span className="font-display text-white text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-wide text-center leading-tight drop-shadow-lg">
        {cat.label}
      </span>
    </div>
  </Link>
);

export const CategoryGridSection: React.FC = () => {
  const [active, setActive] = useState(2);
  const [isDesktop, setIsDesktop] = useState(false);
  const total = HOME_CATEGORIES.length;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const touchStartX = useRef(0);

  const prev = () => setActive((i) => (i - 1 + total) % total);
  const next = () => setActive((i) => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
        <SectionHeading eyebrow="Catálogo" title="¿En qué podemos ayudarte?" align="left" />

        {isDesktop ? (
          <div className="mt-4 md:mt-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {HOME_CATEGORIES.map((cat) => (
                <CategoryCard key={cat.label} cat={cat} />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative mt-4 md:mt-8">
            <button
              type="button"
              onClick={prev}
              aria-label="Categoría anterior"
              className="hidden absolute left-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white shadow-lg border border-secondary/10 items-center justify-center text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Categoría siguiente"
              className="hidden absolute right-0 top-1/2 -translate-y-1/2 z-30 w-11 h-11 bg-white shadow-lg border border-secondary/10 items-center justify-center text-secondary hover:text-primary transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              className="relative mx-auto h-[320px] sm:h-[380px] max-w-[1100px] touch-pan-y"
              style={{ perspective: '1400px' }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                {HOME_CATEGORIES.map((cat, index) => {
                  const offset = getOffset(index, active, total);
                  const isActive = offset === 0;
                  const absOffset = Math.abs(offset);
                  const hidden = absOffset > 2;

                  return (
                    <motion.div
                      key={cat.label}
                      className="absolute top-1/2 left-1/2 w-[200px] sm:w-[220px]"
                      initial={false}
                      animate={{
                        x: offset * (CARD_WIDTH * 0.55 + CARD_GAP) - CARD_WIDTH / 2,
                        y: '-50%',
                        rotateY: offset * -38,
                        scale: 1 - absOffset * 0.11,
                        opacity: hidden ? 0 : 1 - absOffset * 0.18,
                        zIndex: 20 - absOffset,
                      }}
                      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                      style={{
                        transformStyle: 'preserve-3d',
                        pointerEvents: hidden ? 'none' : 'auto',
                      }}
                    >
                      <Link
                        to={cat.href}
                        onClick={(e) => {
                          if (!isActive) {
                            e.preventDefault();
                            setActive(index);
                          }
                        }}
                        className={`group relative block aspect-[3/4] overflow-hidden bg-secondary shadow-2xl ${
                          isActive ? 'ring-2 ring-primary/40' : ''
                        }`}
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <img
                          src={cat.image}
                          alt={cat.label}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                          style={{ objectPosition: cat.objectPosition }}
                        />
                        <div className="absolute inset-0 bg-primary/70 mix-blend-multiply group-hover:bg-primary/60 transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary/85 via-secondary/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <span className="font-display text-white text-xl font-bold uppercase tracking-wider text-center leading-tight drop-shadow-lg">
                            {cat.label}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {HOME_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Ir a ${cat.label}`}
                  className={`h-1.5 transition-all ${
                    i === active ? 'w-8 bg-primary' : 'w-3 bg-secondary/20 hover:bg-secondary/40'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/categoria/cascos"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-10 py-4 transition-colors"
          >
            Ver todo el catálogo <ArrowRight className="w-4 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
