import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { SeoHelmet } from '@/components/seo/SeoHelmet';
import { absoluteUrl, truncateDescription } from '@/lib/seo/constants';
import type { Product } from '@/types';

const PAGE_SIZE = 12;

type HighlightMode = 'novedades' | 'outlet';

const CONFIG: Record<
  HighlightMode,
  {
    title: string;
    path: string;
    description: string;
    emptyMessage: string;
    isNewOnly?: boolean;
    isOutletOnly?: boolean;
  }
> = {
  novedades: {
    title: 'Novedades',
    path: '/novedades',
    description:
      'Descubre las últimas novedades de Asfalto y Gas. Equipamiento para motorista con envío gratuito desde 50 €.',
    emptyMessage: 'No hay novedades disponibles ahora mismo.',
    isNewOnly: true,
  },
  outlet: {
    title: 'Outlet',
    path: '/outlet',
    description:
      'Productos outlet de Asfalto y Gas. Oportunidades en cascos y equipación con envío gratuito desde 50 €.',
    emptyMessage: 'No hay productos en outlet ahora mismo.',
    isOutletOnly: true,
  },
};

function resolveMode(pathname: string): HighlightMode {
  return pathname.startsWith('/outlet') ? 'outlet' : 'novedades';
}

const HighlightCollectionPage: React.FC = () => {
  const { pathname } = useLocation();
  const mode = resolveMode(pathname);
  const config = CONFIG[mode];
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [mode]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, mode]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products', 'highlight', mode, page],
    queryFn: () =>
      api.products.getAll(
        undefined,
        undefined,
        page,
        PAGE_SIZE,
        true,
        undefined,
        config.isNewOnly,
        undefined,
        undefined,
        undefined,
        undefined,
        null,
        config.isOutletOnly,
      ),
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const showEmpty = !isLoading && !isFetching && !isError && total === 0;

  return (
    <div className="min-h-screen pt-6 pb-32 text-secondary">
      <SeoHelmet
        title={config.title}
        description={truncateDescription(config.description)}
        path={config.path}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Inicio',
              item: absoluteUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: config.title,
              item: absoluteUrl(config.path),
            },
          ],
        }}
      />

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-xs font-bold tracking-[0.2em] uppercase text-secondary/60 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <header className="mb-12 text-center">
          <h1 className="text-[7vw] font-black tracking-tighter uppercase italic mb-4 leading-none">
            {config.title}
          </h1>
          {total > 0 && (
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
              {total} {total === 1 ? 'artículo' : 'artículos'}
            </p>
          )}
        </header>

        {isError ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold">
              No se pudieron cargar los productos.
            </p>
            {error instanceof Error && (
              <p className="mt-4 text-sm text-secondary/50">{error.message}</p>
            )}
          </div>
        ) : isLoading && page === 1 ? (
          <div className="space-y-12">
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1.05, 1.3, 1],
                  rotate: [0, -5, 5, -5, 0],
                  opacity: [0.6, 1, 0.8, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.2, 0.4, 0.6, 1],
                }}
              >
                <img
                  src="/assets/logo/logo-asfaltoygas-icon.svg"
                  alt="Cargando..."
                  className="w-12 h-12 object-contain"
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <div key={i} className="aspect-3/4 bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        ) : showEmpty ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold mb-8">
              {config.emptyMessage}
            </p>
            <Link
              to="/categoria/cascos"
              className="inline-flex items-center gap-2 bg-primary text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-primary-dark transition-colors"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className={`space-y-20 ${isFetching ? 'opacity-60 transition-opacity' : ''}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {products.map((product, index) => (
                <motion.div
                  key={product.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: (index % PAGE_SIZE) * 0.04,
                    ease: [0.21, 0, 0.07, 1],
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-12">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-secondary/10 rounded-full hover:border-secondary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  const p = start + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      disabled={isFetching}
                      className={`w-9 h-9 text-[10px] font-black uppercase rounded-full transition-all ${
                        p === page
                          ? 'bg-secondary text-white'
                          : 'hover:bg-secondary/5 text-secondary/60'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isFetching}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border border-secondary/10 rounded-full hover:border-secondary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HighlightCollectionPage;
