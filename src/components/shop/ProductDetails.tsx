import type { Product } from '@/types';
import { Package, Layers, Tag, Boxes, CheckCircle2, XCircle } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails = ({ product }: ProductDetailsProps) => {
  const hasDescription = product.description && product.description.trim().length > 0;
  const hasVariants = product.variants && product.variants.length > 0;
  const sizes = hasVariants
    ? [...new Set(product.variants.map((v) => v.size))]
    : [];
  const totalStock = product.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
  const inStock = totalStock > 0;

  const specs = [
    {
      icon: Tag,
      label: 'Marca',
      value: product.brand?.name || 'No especificada',
    },
    {
      icon: Layers,
      label: 'Categoría',
      value: product.category || 'No especificada',
    },
    {
      icon: Package,
      label: 'Subcategoría',
      value: product.subcategory || 'No especificada',
    },
    {
      icon: inStock ? CheckCircle2 : XCircle,
      label: 'Disponibilidad',
      value: inStock ? 'En stock' : 'Agotado',
      highlight: inStock,
    },
  ];

  return (
    <section className="mt-20 lg:mt-28 border-t border-secondary/10 pt-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Descripción */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-secondary/60 mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            Descripción
          </h2>

          {hasDescription ? (
            <div className="prose prose-invert prose-sm max-w-none text-secondary/80 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          ) : (
            <p className="text-secondary/40 text-sm italic">
              No hay descripción disponible para este producto.
            </p>
          )}
        </div>

        {/* Especificaciones */}
        <div>
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-secondary/60 mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            Especificaciones
          </h2>

          <div className="bg-white/5 border border-secondary/10 rounded-2xl overflow-hidden">
            <dl className="divide-y divide-secondary/10">
              {specs.map((spec) => {
                const Icon = spec.icon;
                return (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <dt className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-secondary/50">
                      <Icon className="w-4 h-4 text-primary" />
                      {spec.label}
                    </dt>
                    <dd
                      className={`text-sm font-medium text-right ${
                        spec.highlight ? 'text-primary' : 'text-secondary'
                      }`}
                    >
                      {spec.value}
                    </dd>
                  </div>
                );
              })}

              {sizes.length > 0 && (
                <div className="flex items-start justify-between px-6 py-4">
                  <dt className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-secondary/50">
                    <Boxes className="w-4 h-4 text-primary" />
                    {sizes.length === 1 ? 'Tamaño' : 'Tallas'}
                  </dt>
                  <dd className="text-sm font-medium text-secondary text-right">
                    {sizes.join(', ')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
