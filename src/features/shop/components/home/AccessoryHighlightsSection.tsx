import React from 'react';
import { Link } from 'react-router-dom';
import { ACCESSORY_HIGHLIGHTS } from '../../data/homeContent';

export const AccessoryHighlightsSection: React.FC = () => (
  <section className="py-12 md:py-16 bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide text-secondary text-center mb-8 md:mb-10">
        Viaja sin límites
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {ACCESSORY_HIGHLIGHTS.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className="relative flex items-center bg-accent border border-secondary/8 overflow-hidden group min-h-[140px]"
          >
            <div className="flex-1 p-5 md:p-6 z-10">
              <span className="inline-block bg-safety text-secondary font-display text-xs font-bold px-3 py-1 mb-3">
                {item.discount}
              </span>
              <h3 className="font-display text-lg font-bold uppercase tracking-wide text-secondary group-hover:text-primary transition-colors">
                {item.title}
              </h3>
            </div>
            <div className="w-28 md:w-32 h-full shrink-0 relative">
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
