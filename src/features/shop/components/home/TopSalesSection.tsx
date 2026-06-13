import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/types';

interface TopSalesSectionProps {
  products: Product[] | undefined;
  isLoading: boolean;
}

export const TopSalesSection: React.FC<TopSalesSectionProps> = ({ products, isLoading }) => (
  <section id="novedades" className="py-12 md:py-16 bg-safety">
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide text-secondary">
          Imprescindibles
        </h2>
        <Link
          to="/categoria/cascos"
          className="inline-flex items-center gap-2 font-display text-xs font-bold tracking-[0.2em] uppercase text-secondary hover:text-primary transition-colors shrink-0"
        >
          Ver catálogo <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-[3/4] bg-white/60 animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {products.slice(0, 5).map((product) => (
            <div key={product.product_id} className="bg-white p-3 shadow-sm">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-secondary/10">
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
