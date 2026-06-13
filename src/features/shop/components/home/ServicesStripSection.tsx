import React from 'react';
import { Link } from 'react-router-dom';
import { SERVICES } from '../../data/homeContent';

export const ServicesStripSection: React.FC = () => (
  <section className="bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto">
      <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wide text-secondary text-center py-8 md:py-10 px-4">
        Servicios y asistencia
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((service) => (
          <Link
            key={service.title}
            to={service.href}
            className="bg-primary hover:bg-primary-dark transition-colors text-white font-display text-sm md:text-base font-bold uppercase tracking-wide text-center py-8 md:py-10 px-6 border-t sm:border-t-0 sm:border-l border-white/15 first:border-l-0"
          >
            {service.title}
          </Link>
        ))}
      </div>
    </div>
  </section>
);
