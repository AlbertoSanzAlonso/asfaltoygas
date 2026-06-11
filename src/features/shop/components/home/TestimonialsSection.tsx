import React from 'react';
import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../../data/homeContent';
import { SectionHeading } from './SectionHeading';

export const TestimonialsSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-accent">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <SectionHeading title="¿Qué opinan nuestros clientes?" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className="bg-white p-8 md:p-10 border border-secondary/5 shadow-sm hover:shadow-md transition-shadow"
          >
            <Quote className="w-8 h-8 text-primary/30 mb-5" />
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="font-sans text-secondary/80 text-sm md:text-base leading-relaxed mb-6">
              "{t.text}"
            </p>
            <div>
              <p className="font-display font-bold text-secondary uppercase tracking-wide text-sm">
                {t.name}
              </p>
              <p className="font-sans text-secondary/50 text-xs mt-0.5">{t.location}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);
