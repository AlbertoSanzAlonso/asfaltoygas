import React from 'react';
import { motion } from 'framer-motion';
import { BRAND } from '@/lib/brand';

export const BrandsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 bg-secondary text-white">
      <div className="max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-black tracking-[0.4em] uppercase text-xs mb-4 block">
            Marcas de confianza
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            Nuestras marcas
          </h2>
          <p className="text-white/60 mt-6 max-w-2xl mx-auto text-sm leading-relaxed">
            Trabajamos con los principales fabricantes de cascos y equipación del sector.
            HJC, AGV, Shoei, Nolan, Airoh y muchas más.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
        >
          {BRAND.helmetBrands.map((brand) => (
            <div
              key={brand}
              className="flex items-center justify-center h-20 md:h-24 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all rounded-sm"
            >
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.15em] text-white/80">
                {brand}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
