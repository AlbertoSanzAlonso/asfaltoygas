import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, Award } from 'lucide-react';
import { BRAND } from '@/lib/brand';

const TRUST_ITEMS = [
  { icon: Shield, title: 'Cascos homologados', desc: 'Normativa ECE 22.06 europea' },
  { icon: Truck, title: 'Envío en 48 h', desc: 'Gratis desde 50 € en península' },
  { icon: Award, title: 'Marcas premium', desc: 'HJC, AGV, Shoei, Nolan y más' },
];

export const AboutStripSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary uppercase tracking-wide mb-6">
            Tu especialista en equipamiento motero
          </h2>
          <div className="space-y-4 font-sans text-secondary/70 text-sm md:text-base leading-relaxed">
            <p>
              En <strong className="text-secondary font-semibold">{BRAND.name}</strong> encontrarás
              cascos, chaquetas, guantes y accesorios de las principales marcas del sector.
              {BRAND.tagline} con asesoramiento experto y envío rápido en toda España.
            </p>
            <p>
              Trabajamos con fabricantes líderes para ofrecerte la máxima protección en carretera,
              sport, touring y off-road. Porque en la carretera, tu seguridad no es negociable.
            </p>
          </div>
          <Link
            to="/conocenos"
            className="inline-block mt-8 font-display font-bold text-sm tracking-[0.2em] uppercase text-primary hover:text-primary-dark border-b-2 border-primary pb-1 transition-colors"
          >
            Conócenos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 bg-accent border border-secondary/5"
            >
              <div className="w-12 h-12 shrink-0 bg-white border border-secondary/5 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-secondary uppercase tracking-wide text-sm">
                  {title}
                </h3>
                <p className="font-sans text-secondary/60 text-xs mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
