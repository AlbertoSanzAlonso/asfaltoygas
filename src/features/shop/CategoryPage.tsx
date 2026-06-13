
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from "@/lib/api";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product, Subcategory, Brand } from '@/types';
import { useScrollRestoration } from "@/lib/useScrollRestoration";
import { SeoHelmet } from '@/components/seo/SeoHelmet';
import { absoluteUrl, truncateDescription } from '@/lib/seo/constants';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

const CategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subQuery = searchParams.get('sub');
  const brandQuery = searchParams.get('marca');

  const filterKey = `${subQuery || 'null'}-${brandQuery || 'null'}`;
  const wasRestored = React.useRef(false);

  const [selectedSub, setSelectedSub] = useState<number | null>(() =>
    subQuery ? parseInt(subQuery, 10) : null
  );
  const [selectedBrand, setSelectedBrand] = useState<number | null>(() =>
    brandQuery ? parseInt(brandQuery, 10) : null
  );

  const [page, setPage] = useState(() => {
    const savedPage = sessionStorage.getItem(`page-${category}-${filterKey}`);
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isMobileTipoOpen, setIsMobileTipoOpen] = useState(false);
  const [isMobileBrandMenuOpen, setIsMobileBrandMenuOpen] = useState(false);

  const lastState = React.useRef({ category, subQuery, brandQuery });

  const applyFilters = (subId: number | null, brandId: number | null) => {
    const params = new URLSearchParams();
    if (subId) params.set('sub', subId.toString());
    if (brandId) params.set('marca', brandId.toString());
    setSearchParams(params);
    setPage(1);
    setAllProducts([]);
    wasRestored.current = false;
  };

  React.useEffect(() => {
    if (
      lastState.current.category !== category ||
      lastState.current.subQuery !== subQuery ||
      lastState.current.brandQuery !== brandQuery
    ) {
      setSelectedSub(subQuery ? parseInt(subQuery, 10) : null);
      setSelectedBrand(brandQuery ? parseInt(brandQuery, 10) : null);

      const saved = sessionStorage.getItem(
        `page-${category}-${subQuery || 'null'}-${brandQuery || 'null'}`
      );
      setPage(saved ? parseInt(saved, 10) : 1);
      setAllProducts([]);
      wasRestored.current = false;

      lastState.current = { category, subQuery, brandQuery };
    }
  }, [subQuery, brandQuery, category]);

  React.useEffect(() => {
    sessionStorage.setItem(
      `page-${category}-${selectedSub || 'null'}-${selectedBrand || 'null'}`,
      page.toString()
    );
  }, [category, selectedSub, selectedBrand, page]);

  const handleSubChange = (subId: number | null) => {
    setSelectedSub(subId);
    applyFilters(subId, selectedBrand);
    setIsMobileTipoOpen(false);
  };

  const handleBrandChange = (brandId: number | null) => {
    setSelectedBrand(brandId);
    applyFilters(selectedSub, brandId);
    setIsMobileBrandMenuOpen(false);
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
    queryKey: ['products', categoryId, selectedSub, selectedBrand, page],
    queryFn: () => {
      const isRestoring = page > 1 && allProducts.length === 0;
      const actualPage = isRestoring ? 1 : page;
      const actualPageSize = isRestoring ? page * pageSize : pageSize;

      const catId = category?.toLowerCase() === 'todas' ? undefined : categoryId?.toString();

      return api.products.getAll(
        catId,
        selectedSub?.toString(),
        actualPage,
        actualPageSize,
        true,
        undefined,
        undefined,
        undefined,
        selectedBrand ?? undefined
      );
    },
    enabled: category?.toLowerCase() === 'todas' || !!categoryId,
    staleTime: 1000 * 60 * 5,
  });

  const products = productsData?.products;

  const restorationTrigger = allProducts.length;
  useScrollRestoration(
    `category-${category}-${selectedSub || 'null'}-${selectedBrand || 'null'}`,
    restorationTrigger
  );

  React.useEffect(() => {
    if (products) {
      setAllProducts((prev) => {
        if (prev.length === 0 || page === 1) {
          if (products.length > pageSize) wasRestored.current = true;
          return products;
        }

        const existingIds = new Set(prev.map((p) => p.product_id));
        const newItems = products.filter((p) => !existingIds.has(p.product_id));
        if (newItems.length === 0) return prev;
        return [...prev, ...newItems];
      });
    }
  }, [products, page]);

  const hasMore = productsData ? allProducts.length < productsData.total : false;
  const showEmptyState =
    !isLoading && !isFetching && !isError && productsData && allProducts.length === 0;
  const categoryNotFound =
    !isCategoryLoading && category && category.toLowerCase() !== 'todas' && !categoryData;
  const supabaseMissing = !isSupabaseConfigured();

  const categoryTitle = categoryData?.name || category || 'Categoría';
  const tipoLabel = category?.toLowerCase() === 'cascos' ? 'Tipo de casco' : 'Tipo';
  const categoryDescription = truncateDescription(
    `Descubre ${categoryTitle.toLowerCase()} en Asfalto y Gas. Cascos y equipación motera con envío gratuito desde 50 €.`,
  );

  const renderTipoFilter = () => {
    if (!subcategories?.length) return null;

    return (
      <div className="mt-12">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mb-6 text-center">
          {tipoLabel}
        </p>

        <div className="block md:hidden px-6 relative z-30">
          <div className="max-w-[280px] mx-auto">
            <button
              type="button"
              onClick={() => setIsMobileTipoOpen(!isMobileTipoOpen)}
              className="w-full bg-accent-dark border border-secondary/10 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between group hover:border-primary/50 transition-all rounded-xl"
            >
              <span className="flex-1 text-center">
                {selectedSub
                  ? subcategories.find((s) => s.id === selectedSub)?.name.toUpperCase()
                  : 'TODOS'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-primary transition-transform duration-300 ${isMobileTipoOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isMobileTipoOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-6 right-6 mt-2 bg-white border border-gray-100 shadow-2xl z-40 overflow-hidden rounded-2xl"
                >
                  <div className="max-h-[60vh] overflow-y-auto py-2 space-y-1 px-2">
                    <button
                      type="button"
                      onClick={() => handleSubChange(null)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors rounded-xl ${!selectedSub ? 'text-primary bg-primary/5' : 'text-secondary hover:bg-gray-50'}`}
                    >
                      TODOS
                      {!selectedSub && <Check className="w-3 h-3" />}
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubChange(sub.id)}
                        className={`w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors rounded-xl ${selectedSub === sub.id ? 'text-primary bg-primary/5' : 'text-secondary hover:bg-gray-50'}`}
                      >
                        {sub.name}
                        {selectedSub === sub.id && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => handleSubChange(null)}
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] border transition-all duration-300 rounded-full ${!selectedSub ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'border-secondary/10 hover:border-secondary hover:translate-y-[-2px]'}`}
          >
            Todos
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSubChange(sub.id)}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] border transition-all duration-300 rounded-full ${selectedSub === sub.id ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'border-secondary/10 hover:border-secondary hover:translate-y-[-2px]'}`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderMarcaFilter = () => {
    if (!categoryBrands?.length) return null;

    return (
      <div className="mt-10">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-secondary/40 mb-6 text-center">
          Marca
        </p>

        <div className="block md:hidden px-6 relative z-25">
          <div className="max-w-[280px] mx-auto">
            <button
              type="button"
              onClick={() => setIsMobileBrandMenuOpen(!isMobileBrandMenuOpen)}
              className="w-full bg-accent-dark border border-secondary/10 px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between rounded-xl"
            >
              <span className="flex-1 text-center">
                {selectedBrand
                  ? categoryBrands.find((b) => b.id === selectedBrand)?.name.toUpperCase()
                  : 'TODAS'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-primary transition-transform ${isMobileBrandMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isMobileBrandMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-6 right-6 mt-2 bg-white border shadow-2xl z-40 overflow-hidden rounded-2xl"
                >
                  <div className="max-h-[50vh] overflow-y-auto py-2 px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleBrandChange(null)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl ${!selectedBrand ? 'text-primary bg-primary/5' : 'text-secondary'}`}
                    >
                      TODAS
                      {!selectedBrand && <Check className="w-3 h-3" />}
                    </button>
                    {categoryBrands.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => handleBrandChange(brand.id)}
                        className={`w-full flex items-center justify-between px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl ${selectedBrand === brand.id ? 'text-primary bg-primary/5' : 'text-secondary'}`}
                      >
                        {brand.name}
                        {selectedBrand === brand.id && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden md:flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => handleBrandChange(null)}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border rounded-full transition-all ${!selectedBrand ? 'bg-secondary border-secondary text-white' : 'border-secondary/10 hover:border-secondary'}`}
          >
            Todas
          </button>
          {categoryBrands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleBrandChange(brand.id)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.25em] border rounded-full transition-all ${selectedBrand === brand.id ? 'bg-secondary border-secondary text-white' : 'border-secondary/10 hover:border-secondary'}`}
            >
              {brand.name}
            </button>
          ))}
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

          {renderTipoFilter()}
          {renderMarcaFilter()}
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
              {allProducts.map((product: Product, index: number) => (
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

            {hasMore && (
              <div className="flex justify-center pt-12">
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={isFetching}
                  className="px-12 py-4 bg-transparent border-2 border-secondary text-secondary text-[10px] font-black uppercase tracking-[0.3em] hover:bg-secondary hover:text-white transition-all disabled:opacity-50 rounded-full"
                >
                  {isFetching ? 'Cargando más piezas...' : 'Ver más artículos'}
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
