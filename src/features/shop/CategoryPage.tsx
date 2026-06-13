
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product, Subcategory, Brand } from '@/types';
import { SeoHelmet } from '@/components/seo/SeoHelmet';
import { absoluteUrl, truncateDescription } from '@/lib/seo/constants';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

const BRAND_SCALES: Record<string, number> = {
  'acerbis': 1.3,
  'airoh': 1.3,
  'hjc': 1.3,
  'ls2': 1.3,
  'mt-helmets': 1.3,
  'nolan': 1.3,
  'piaggio': 1.45,
  'shoei': 1.3,
  'suomy': 1.3,
  'arai': 0.75,
  'gas-gas': 0.75,
  'unik-racing': 0.65,
};

const BrandLogo: React.FC<{ brand: Brand; size?: 'sm' | 'md' }> = ({ brand, size = 'md' }) => {
  const baseHeight = size === 'sm' ? 34 : 50;
  const baseMaxWidth = size === 'sm' ? 110 : 160;
  const scale = BRAND_SCALES[brand.slug] ?? 1;
  const height = Math.round(baseHeight * scale);
  const maxWidth = Math.round(baseMaxWidth * scale);

  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="object-contain shrink-0"
        style={{ height, maxWidth }}
      />
    );
  }

  const font = size === 'sm' ? 'text-[9px]' : 'text-[11px]';
  return (
    <span className={`${font} font-black uppercase tracking-wider text-secondary/70 shrink-0 leading-none`}>
      {brand.name}
    </span>
  );
};

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subQuery = searchParams.get('sub');
  const brandQuery = searchParams.get('marca');
  const priceMinQuery = searchParams.get('precioMin');
  const priceMaxQuery = searchParams.get('precioMax');
  const sortQuery = searchParams.get('orden');

  const filterKey = `${subQuery || 'null'}-${brandQuery || 'null'}-${priceMinQuery || 'null'}-${priceMaxQuery || 'null'}-${sortQuery || 'null'}`;

  const [selectedSub, setSelectedSub] = useState<number | null>(() =>
    subQuery ? parseInt(subQuery, 10) : null
  );
  const [selectedBrand, setSelectedBrand] = useState<number | null>(() =>
    brandQuery ? parseInt(brandQuery, 10) : null
  );
  const [priceMin, setPriceMin] = useState<string>(() => priceMinQuery || '');
  const [priceMax, setPriceMax] = useState<string>(() => priceMaxQuery || '');
  const [sortOrder, setSortOrder] = useState<string>(() => sortQuery || '');

  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`page-${category}-${filterKey}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFiltersOpen) return;
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFiltersOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isFiltersOpen]);

  const lastState = React.useRef<{ category?: string; subQuery: string | null; brandQuery: string | null; priceMinQuery: string | null; priceMaxQuery: string | null; sortQuery: string | null }>({ category: undefined, subQuery: null, brandQuery: null, priceMinQuery: null, priceMaxQuery: null, sortQuery: null });

  const applyFilters = (subId: number | null, brandId: number | null, pMin?: string, pMax?: string, sort?: string) => {
    const params = new URLSearchParams();
    if (subId) params.set('sub', subId.toString());
    if (brandId) params.set('marca', brandId.toString());
    if (pMin) params.set('precioMin', pMin);
    if (pMax) params.set('precioMax', pMax);
    if (sort) params.set('orden', sort);
    setSearchParams(params);
    setPage(1);
  };

  React.useEffect(() => {
    if (
      lastState.current.category !== category ||
      lastState.current.subQuery !== subQuery ||
      lastState.current.brandQuery !== brandQuery ||
      lastState.current.priceMinQuery !== priceMinQuery ||
      lastState.current.priceMaxQuery !== priceMaxQuery ||
      lastState.current.sortQuery !== sortQuery
    ) {
      setSelectedSub(subQuery ? parseInt(subQuery, 10) : null);
      setSelectedBrand(brandQuery ? parseInt(brandQuery, 10) : null);
      setPriceMin(priceMinQuery || '');
      setPriceMax(priceMaxQuery || '');
      setSortOrder(sortQuery || '');

      const saved = sessionStorage.getItem(
        `page-${category}-${subQuery || 'null'}-${brandQuery || 'null'}-${priceMinQuery || 'null'}-${priceMaxQuery || 'null'}-${sortQuery || 'null'}`
      );
      setPage(saved ? parseInt(saved, 10) : 1);

      lastState.current = { category, subQuery, brandQuery, priceMinQuery, priceMaxQuery, sortQuery };
    }
  }, [subQuery, brandQuery, category, priceMinQuery, priceMaxQuery, sortQuery]);

  React.useEffect(() => {
    sessionStorage.setItem(
      `page-${category}-${selectedSub || 'null'}-${selectedBrand || 'null'}-${priceMin || 'null'}-${priceMax || 'null'}-${sortOrder || 'null'}`,
      page.toString()
    );
  }, [category, selectedSub, selectedBrand, priceMin, priceMax, sortOrder, page]);

  const handleSubChange = (subId: number | null) => {
    setSelectedSub(subId);
    applyFilters(subId, selectedBrand, priceMin, priceMax, sortOrder);
  };

  const handleBrandChange = (brandId: number | null) => {
    setSelectedBrand(brandId);
    applyFilters(selectedSub, brandId, priceMin, priceMax, sortOrder);
  };

  const handlePriceApply = () => {
    applyFilters(selectedSub, selectedBrand, priceMin, priceMax, sortOrder);
    setIsFiltersOpen(false);
  };

  const handleSortChange = (sort: string) => {
    setSortOrder(sort);
    applyFilters(selectedSub, selectedBrand, priceMin, priceMax, sort);
    setIsFiltersOpen(false);
  };

  const pageSize = 12;

  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['category-info', category],
    queryFn: async () => {
      const found = await api.categories.getByName(category!);
      return found ?? null;
    },
    enabled: !!category,
  });

  const categoryId = categoryData?.id;

  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: ['subcategories', categoryId],
    queryFn: () => api.categories.getSubcategories(categoryId!),
    enabled: !!categoryId,
  });

  const { data: categoryBrands } = useQuery<Brand[]>({
    queryKey: ['brands', categoryId, selectedSub],
    queryFn: () => api.brands.getByCategory(categoryId!, selectedSub ?? undefined),
    enabled: !!categoryId,
  });

  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<{ products: Product[]; total: number }>({
    queryKey: ['products', categoryId, selectedSub, selectedBrand, priceMin, priceMax, sortOrder, page],
    queryFn: () => {
      const catId = category?.toLowerCase() === 'todas' ? undefined : categoryId?.toString();
      return api.products.getAll(
        catId,
        selectedSub?.toString(),
        page,
        pageSize,
        true,
        undefined,
        undefined,
        undefined,
        selectedBrand ?? undefined,
        priceMin ? parseFloat(priceMin) : undefined,
        priceMax ? parseFloat(priceMax) : undefined,
        sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      );
    },
    enabled: category?.toLowerCase() === 'todas' || !!categoryId,
    staleTime: 1000 * 60 * 5,
  });

  const products = productsData?.products;

  const totalPages = productsData ? Math.ceil(productsData.total / pageSize) : 0;

  const showEmptyState =
    !isLoading && !isFetching && !isError && productsData && productsData.total === 0;
  const categoryNotFound =
    !isCategoryLoading && category && category.toLowerCase() !== 'todas' && !categoryData;
  const supabaseMissing = !isSupabaseConfigured();

  const categoryTitle = categoryData?.name || category || 'Categoría';
  const tipoLabel = category?.toLowerCase() === 'cascos' ? 'Tipo de casco' : 'Tipo';
  const categoryDescription = truncateDescription(
    `Descubre ${categoryTitle.toLowerCase()} en Asfalto y Gas. Cascos y equipación motera con envío gratuito desde 50 €.`,
  );

  const renderTipoContent = () => {
    if (!subcategories?.length) return null;
    return (
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mb-3">{tipoLabel}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => handleSubChange(null)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border rounded-full transition-all ${!selectedSub ? 'bg-primary border-primary text-white' : 'border-secondary/10 hover:border-secondary hover:translate-y-[-2px]'}`}>
            Todos
          </button>
          {subcategories.map((sub) => (
            <button key={sub.id} type="button" onClick={() => handleSubChange(sub.id)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border rounded-full transition-all ${selectedSub === sub.id ? 'bg-primary border-primary text-white' : 'border-secondary/10 hover:border-secondary hover:translate-y-[-2px]'}`}>
              {sub.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMarcaContent = () => {
    if (!categoryBrands?.length) return null;
    return (
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mb-3">Marca</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => handleBrandChange(null)}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border rounded-full transition-all ${!selectedBrand ? 'bg-secondary border-secondary text-white' : 'border-secondary/10 hover:border-secondary'}`}>
            Todas
          </button>
          {categoryBrands.map((brand) => (
            <button key={brand.id} type="button" onClick={() => handleBrandChange(brand.id)} title={brand.name}
              className={`p-1.5 rounded-lg transition-all ${selectedBrand === brand.id ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}>
              <BrandLogo brand={brand} size="sm" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPriceContent = () => {
    const isActive = priceMin !== '' || priceMax !== '' || sortOrder !== '';
    return (
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mb-3">Precio</p>
        <div className="flex items-center gap-2 mb-3">
          <input type="number" min="0" step="1" placeholder="Min" value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePriceApply(); }}
            className="w-full bg-accent-dark border border-secondary/10 px-3 py-2 text-[11px] font-bold text-secondary placeholder:text-secondary/30 rounded-lg text-center focus:outline-none focus:border-primary/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          <span className="text-xs font-bold text-secondary/40">–</span>
          <input type="number" min="0" step="1" placeholder="Max" value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handlePriceApply(); }}
            className="w-full bg-accent-dark border border-secondary/10 px-3 py-2 text-[11px] font-bold text-secondary placeholder:text-secondary/30 rounded-lg text-center focus:outline-none focus:border-primary/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button type="button" onClick={() => handleSortChange('asc')}
            className={`px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border transition-all ${sortOrder === 'asc' ? 'bg-primary border-primary text-white' : 'border-secondary/10 hover:border-secondary/40'}`}>
            ↓ Más barato
          </button>
          <button type="button" onClick={() => handleSortChange('desc')}
            className={`px-3 py-2 text-[9px] font-black uppercase tracking-[0.15em] rounded-lg border transition-all ${sortOrder === 'desc' ? 'bg-primary border-primary text-white' : 'border-secondary/10 hover:border-secondary/40'}`}>
            ↑ Más caro
          </button>
        </div>
        <div className="flex justify-center gap-2">
          <button type="button" onClick={handlePriceApply} disabled={!isActive}
            className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border rounded-full transition-all ${isActive ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark' : 'border-secondary/10 text-secondary/30 cursor-not-allowed'}`}>
            Aplicar
          </button>
          {isActive && (
            <button type="button" onClick={() => { setPriceMin(''); setPriceMax(''); setSortOrder(''); applyFilters(selectedSub, selectedBrand, '', '', ''); }}
              className="px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] border border-secondary/10 rounded-full text-secondary/50 hover:text-primary hover:border-primary/30 transition-all">
              Limpiar
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-accent min-h-screen pt-12 pb-32 text-secondary">
      <SeoHelmet
        title={categoryTitle}
        description={categoryDescription}
        path={`/categoria/${category}`}
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
              name: categoryTitle,
              item: absoluteUrl(`/categoria/${category}`),
            },
          ],
        }}
      />
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <header className="mb-20 text-center">
          <h1 className="text-[10vw] font-black tracking-tighter uppercase italic mb-6 leading-none">
            {categoryTitle}
          </h1>

          <div ref={filterRef} className="max-w-3xl mx-auto mt-8 relative z-30">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className={`w-full bg-accent-dark border px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between rounded-xl transition-all ${
                isFiltersOpen || selectedSub || selectedBrand || priceMin || priceMax || sortOrder
                  ? 'border-primary/50'
                  : 'border-secondary/10 hover:border-primary/50'
              }`}
            >
              <span className="flex-1 text-center">
                {selectedSub || selectedBrand || priceMin || priceMax || sortOrder ? 'Filtros activos' : 'Filtros'}
              </span>
              <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isFiltersOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 right-0 mt-2 bg-white border shadow-2xl overflow-hidden rounded-2xl"
                >
                  <div className="max-h-[65vh] overflow-y-auto py-4 px-5 space-y-5 scroll-area-viewport" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {renderTipoContent()}
                    {renderMarcaContent()}
                    {renderPriceContent()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {productsData && !isLoading && (
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary/40 mt-8">
              {productsData.total} artículo{productsData.total !== 1 ? 's' : ''}
            </p>
          )}
        </header>

        {supabaseMissing ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold">
              Catálogo no disponible. Configura las variables de Supabase en el entorno.
            </p>
          </div>
        ) : categoryNotFound ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold">
              Categoría no encontrada.
            </p>
          </div>
        ) : isError ? (
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
                className="relative"
              >
                <img
                  src="/assets/logo/logo-asfaltoygas-icon.svg"
                  alt="Cargando..."
                  className="w-12 h-12 object-contain"
                />
              </motion.div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-3/4 bg-white/5 animate-pulse rounded-3xl" />
              ))}
            </div>
          </div>
        ) : showEmptyState ? (
          <div className="py-40 text-center">
            <p className="text-gray-500 uppercase tracking-[0.3em] font-bold">
              No hay artículos disponibles en esta categoría actualmente.
            </p>
          </div>
        ) : (
          <div className="space-y-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {(products ?? []).map((product: Product, index: number) => (
                <motion.div
                  key={product.product_id}
                  id={`product-${product.product_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: (index % pageSize) * 0.05,
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
                  onClick={() => setPage((p) => p + 1)}
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

export default CategoryPage;
