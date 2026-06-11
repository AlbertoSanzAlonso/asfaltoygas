import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/types';
import { SectionHeading } from './SectionHeading';

interface TopSalesSectionProps {
  products: Product[] | undefined;
  isLoading: boolean;
}

export const TopSalesSection: React.FC<TopSalesSectionProps> = ({ products, isLoading }) => (
  <section id="novedades" className="py-16 md:py-24 bg-white border-t border-secondary/5">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
        <div>
          <SectionHeading eyebrow="Lo más vendido" title="Top ventas" align="left" />
        </div>
        <Link
          to="/categoria/cascos"
          className="inline-flex items-center gap-2 font-display text-xs font-bold tracking-[0.2em] uppercase text-secondary hover:text-primary transition-colors shrink-0 mb-2"
        >
          Ver catálogo <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-accent animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-accent border border-secondary/5">
          <p className="font-sans text-secondary/60 text-sm mb-6">
            Próximamente nuevos productos en catálogo.
          </p>
          <Link
            to="/categoria/cascos"
            className="inline-flex items-center gap-2 bg-primary text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-primary-dark transition-colors"
          >
            Explorar categorías
          </Link>
        </div>
      )}
    </div>
  </section>
);
