import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CtaBannerSection: React.FC = () => (
  <section className="relative overflow-hidden">
    <div className="relative min-h-[320px] md:min-h-[420px]">
      <img
        src="https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop"
        alt="Aventura off-road en moto"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-secondary/65" />
      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 h-full min-h-[320px] md:min-h-[420px] flex flex-col justify-center">
        <p className="font-display text-primary text-sm font-semibold tracking-[0.35em] uppercase mb-4">
          Off-road &amp; aventura
        </p>
        <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide max-w-2xl leading-[0.95] mb-6">
          No sigas el camino.<br />Créalo.
        </h2>
        <Link
          to="/categoria/equipaje"
          className="inline-flex items-center gap-2 w-fit border-2 border-white text-white hover:bg-white hover:text-secondary font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3.5 transition-colors"
        >
          Descubre la gama <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);
