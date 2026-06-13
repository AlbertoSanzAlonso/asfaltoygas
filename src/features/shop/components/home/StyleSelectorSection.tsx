import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RIDING_STYLES } from '../../data/homeContent';

export const StyleSelectorSection: React.FC = () => (
  <section className="py-12 md:py-16 bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide text-secondary text-center mb-8 md:mb-10">
        ¿Cuál es tu estilo?
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {RIDING_STYLES.map((style) => (
          <Link
            key={style.label}
            to={style.href}
            className="relative aspect-square overflow-hidden group block"
          >
            <img
              src={style.image}
              alt={style.label}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-secondary/40 group-hover:bg-secondary/30 transition-colors" />
            <div className="absolute inset-0 flex items-end p-4">
              <span className="font-display text-sm md:text-base font-bold text-white uppercase tracking-wide">
                {style.label}
              </span>
            </div>
          </Link>
        ))}

        <Link
          to="/categoria/cascos"
          className="relative aspect-square bg-primary hover:bg-primary-dark transition-colors flex flex-col items-center justify-center p-4 group"
        >
          <span className="font-display text-sm md:text-base font-bold text-white uppercase tracking-wide text-center leading-tight">
            Todos los estilos
          </span>
          <ArrowRight className="w-6 h-6 text-white mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </section>
);
