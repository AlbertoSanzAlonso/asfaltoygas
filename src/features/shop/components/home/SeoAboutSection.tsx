import React from 'react';
import { BRAND } from '@/lib/brand';

export const SeoAboutSection: React.FC = () => (
  <section className="py-12 md:py-16 bg-accent border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wide text-secondary mb-6">
          {BRAND.name} — tu tienda de equipamiento motero
        </h2>
        <div className="font-sans text-sm text-secondary/60 leading-relaxed space-y-4">
          <p>
            En {BRAND.name} encontrarás cascos homologados ECE 22.06, chaquetas, guantes, botas y accesorios
            de las mejores marcas del sector: HJC, AGV, Shoei, Nolan, Airoh, Alpinestars y muchas más.
          </p>
          <p>
            Equípate con protección certificada para carretera, urbano o aventura. Envío gratuito en pedidos
            superiores a 50 €, pago seguro y devoluciones en 14 días.
          </p>
        </div>
      </div>
    </div>
  </section>
);
