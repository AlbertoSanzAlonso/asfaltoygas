import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/shop/ProductCard';
import { SeoHelmet } from '@/components/seo/SeoHelmet';
import { absoluteUrl, truncateDescription } from '@/lib/seo/constants';
import { getBrandLogoSize } from '@/lib/brandLogos';
import { BRAND_LOGOS } from '@/features/shop/data/homeContent';
import type { Product } from '@/types';

const PAGE_SIZE = 12;

function resolveLogoUrl(slug: string, logoUrl?: string | null): string {
  if (logoUrl) return logoUrl;
  const fromHome = BRAND_LOGOS.find((b) => b.slug === slug);
  if (fromHome) return fromHome.logo;
  return `/assets/brands/${slug}.png`;
}

const BrandPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, slug]);

  const {
    data: brand,
    isLoading: isBrandLoading,
    isError: isBrandError,
  } = useQuery({
    queryKey: ['brand', slug],
    queryFn: () => api.brands.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10,
  });

  const brandId = brand?.id;

  const {
    data,
    isLoading: isProductsLoading,
    isFetching,
    isError: isProductsError,
    error,
  } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products', 'brand', brandId, page],
    queryFn: () =>
      api.products.getAll(
        undefined,
        undefined,
        page,
        PAGE_SIZE,
        true,
        undefined,
        undefined,
        undefined,
        brandId,
      ),
    enabled: !!brandId,
    staleTime: 1000 * 60 * 5,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isLoading = isBrandLoading || (!!brandId && isProductsLoading);
  const showEmpty = !isLoading && !isFetching && !isProductsError && brand && total === 0;
  const notFound = !isBrandLoading && !isBrandError && !!slug && !brand;

  const logoSrc = brand ? resolveLogoUrl(brand.slug, brand.logo_url) : '';
  const logoSize = brand ? getBrandLogoSize(brand.slug, 'md', 2.2) : { height: 120, maxWidth: 280 };
  const path = `/marca/${slug}`;
  const title = brand?.name ?? 'Marca';
  const description = brand
    ? `Productos ${brand.name} en Asfalto y Gas. Equipamiento para motorista con envío gratuito desde 50 €.`
    : 'Marcas de equipamiento para motorista en Asfalto y Gas.';

  return (
    <div className="min-h-screen pt-6 pb-32 text-secondary">
      <SeoHelmet
        title={brand ? brand.name : 'Marca'}
        description={truncateDescription(description)}
        path={path}
        noindex={notFound}
        jsonLd={
          brand
            ? {
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
                    name: brand.name,
                    item: absoluteUrl(path),
                  },
                ],
              }
            : undefined
        }
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

        {notFound || isBrandError ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold mb-8">
              No encontramos esta marca.
            </p>
            <Link
              to="/categoria/cascos"
              className="inline-flex items-center gap-2 bg-primary text-white font-display font-bold text-sm tracking-[0.2em] uppercase px-8 py-3.5 hover:bg-primary-dark transition-colors"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <>
            <header className="mb-14 flex flex-col items-center text-center gap-6">
              {isBrandLoading ? (
                <div className="h-28 w-56 bg-secondary/5 animate-pulse rounded-xl" />
              ) : (
                <img
                  src={logoSrc}
                  alt={title}
                  className="object-contain max-w-full"
                  style={{ height: logoSize.height, maxWidth: logoSize.maxWidth }}
                />
              )}
              <h1 className="sr-only">{title}</h1>
              {!isLoading && total > 0 && (
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary/40">
                  {total} {total === 1 ? 'artículo' : 'artículos'}
                </p>
              )}
            </header>

            {isProductsError ? (
              <div className="py-40 text-center">
                <p className="text-gray-500 uppercase tracking-[0.3em] font-bold">
                  No se pudieron cargar los productos.
                </p>
                {error instanceof Error && (
                  <p className="mt-4 text-sm text-secondary/50">{error.message}</p>
                )}
              </div>
            ) : isLoading && page === 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <div key={i} className="aspect-3/4 bg-white/5 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : showEmpty ? (
              <div className="py-40 text-center">
                <p className="text-gray-500 uppercase tracking-[0.3em] font-bold mb-8">
                  No hay productos de esta marca publicados ahora mismo.
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
          </>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
