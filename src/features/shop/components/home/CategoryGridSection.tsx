import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HOME_CATEGORIES } from '../../data/homeContent';
import { SectionHeading } from './SectionHeading';

export const CategoryGridSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading eyebrow="Catálogo" title="¿En qué podemos ayudarte?" />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {HOME_CATEGORIES.map((cat) => (
          <Link
            key={cat.label}
            to={cat.href}
            className="group relative aspect-[3/4] overflow-hidden bg-secondary"
          >
            <img
              src={cat.image}
              alt={cat.label}
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-primary/70 mix-blend-multiply group-hover:bg-primary/60 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <span className="font-display text-white text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-wider text-center leading-tight group-hover:scale-105 transition-transform">
                {cat.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/categoria/cascos"
          className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-light text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-10 py-4 transition-colors"
        >
          Ver todo el catálogo <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);
