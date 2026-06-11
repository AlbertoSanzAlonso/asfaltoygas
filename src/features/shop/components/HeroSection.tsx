import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BRAND } from '@/lib/brand';

export const HeroSection: React.FC = () => {
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-secondary/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1558981403-c5f9899a28dc?q=80&w=2070&auto=format&fit=crop"
          alt="Motociclista con casco en carretera"
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="relative z-20 w-full max-w-[1800px] px-6 mx-auto">
        <h1 className="sr-only">
          {BRAND.tagline} | {BRAND.name}
        </h1>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          <img
            src="/assets/logo/logo-asfaltoygas-blanco.svg"
            alt={BRAND.name}
            className="w-[85vw] md:w-[50vw] max-w-2xl mx-auto drop-shadow-2xl mb-8"
          />
          <p className="text-white/90 text-sm md:text-base font-medium tracking-[0.2em] uppercase max-w-2xl leading-relaxed mb-10">
            Cascos integrales, modulares y off-road de las mejores marcas.
            Equipación y accesorios para carretera y aventura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/categoria/cascos"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white px-10 py-4 text-xs font-black tracking-[0.25em] uppercase hover:bg-primary-dark transition-colors"
            >
              Ver cascos <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/categoria/equipacion"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-10 py-4 text-xs font-black tracking-[0.25em] uppercase hover:bg-white/10 transition-colors"
            >
              Equipación
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-white">Desliza</span>
        <div className="w-px h-12 bg-white" />
      </motion.div>
    </section>
  );
};
