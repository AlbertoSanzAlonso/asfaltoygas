import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Wind, Award } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const FEATURES = [
  {
    icon: Shield,
    title: 'Seguridad certificada',
    description: 'Todos nuestros cascos cumplen la normativa ECE 22.06 europea.',
  },
  {
    icon: Wind,
    title: 'Máximo confort',
    description: 'Aerodinámica, ventilación y peso reducido para largas rutas.',
  },
  {
    icon: Award,
    title: 'Marcas premium',
    description: 'Distribuidores oficiales de las mejores marcas del mercado.',
  },
];

export const FeaturedSection: React.FC = () => {
  return (
    <>
      <section className="py-24 md:py-40 bg-accent">
        <div className="px-6 sm:px-12 lg:px-20 max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5 space-y-12 text-center lg:text-left">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-tight text-secondary">
                Protege tu<br />
                <span className="text-primary">pasión.</span>
              </h2>
              <p className="text-secondary/60 text-lg leading-relaxed mx-auto lg:mx-0 max-w-md font-light">
                En {BRAND.name} encontrarás cascos y equipación para cada estilo de conducción:
                carretera, sport, touring, off-road y urbano. Asesoramiento experto y envío rápido.
              </p>
              <Link
                to="/conocenos"
                className="inline-flex items-center justify-center font-black tracking-[0.2em] uppercase bg-transparent border border-secondary/20 text-secondary hover:bg-secondary/5 px-12 py-4 text-sm hover:border-primary transition-all"
              >
                Conócenos
              </Link>
            </div>
            <div className="lg:col-span-7 relative">
              <div className="aspect-4/5 overflow-hidden rounded-sm shadow-2xl">
                <motion.img
                  src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=2070&auto=format&fit=crop"
                  className="w-full h-full object-cover scale-105"
                  alt="Cascos de moto en exposición"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-primary p-10 hidden md:block shadow-2xl">
                <p className="text-3xl font-black tracking-tighter uppercase text-white">
                  RIDE<br />SAFE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-accent-dark border-t border-secondary/5">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-secondary">{title}</h3>
                  <p className="text-sm text-secondary/60 leading-relaxed max-w-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 md:py-48 relative overflow-hidden flex items-center justify-center bg-primary">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img
            src="https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1000&auto=format&fit=crop"
            className="w-full h-full object-cover"
            alt="Motociclista en carretera de montaña"
          />
        </div>
        <div className="relative z-10 text-center max-w-5xl px-6">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-12 leading-tight text-white max-w-4xl mx-auto">
            "La carretera no perdona. Tu casco sí te protege."
          </h2>
          <div className="w-20 h-px bg-white mx-auto mb-12" />
          <p className="text-[10px] font-black tracking-[0.6em] uppercase text-white/80">{BRAND.name}</p>
        </div>
      </section>
    </>
  );
};
