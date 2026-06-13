
import React from 'react';
import type { Category, Subcategory, Brand } from "@/types/index";

interface ProductCategoriesProps {
  categoryId?: number;
  subcategoryId?: number;
  brandId?: number;
  categoriesList: Category[];
  subcategoriesList: Subcategory[];
  brandsList: Brand[];
  totalStock: number;
  onCategoryChange: (id: number | undefined) => void;
  onSubcategoryChange: (id: number | undefined) => void;
  onBrandChange: (id: number | undefined) => void;
}

export const ProductCategories: React.FC<ProductCategoriesProps> = ({
  categoryId,
  subcategoryId,
  brandId,
  categoriesList,
  subcategoriesList,
  brandsList,
  totalStock,
  onCategoryChange,
  onSubcategoryChange,
  onBrandChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Categoría Maestra</label>
        <select 
          className="w-full bg-(--bg-card) border border-(--border-main) px-6 py-4 text-sm font-bold focus:border-primary outline-none appearance-none text-(--text-main) rounded-xl"
          value={categoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="" disabled>SELECCIONAR...</option>
          {categoriesList.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Subcategoría</label>
        <select 
          className="w-full bg-(--bg-card) border border-(--border-main) px-6 py-4 text-sm font-bold focus:border-primary outline-none appearance-none text-(--text-main) rounded-xl"
          value={subcategoryId || ''}
          onChange={(e) => onSubcategoryChange(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">NINGUNA / OTRA</option>
          {subcategoriesList.map(sub => (
            <option key={sub.id} value={sub.id}>{sub.name.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Fabricante</label>
        <select
          className="w-full bg-(--bg-card) border border-(--border-main) px-6 py-4 text-sm font-bold focus:border-primary outline-none appearance-none text-(--text-main) rounded-xl"
          value={brandId || ''}
          onChange={(e) => onBrandChange(e.target.value ? parseInt(e.target.value) : undefined)}
        >
          <option value="">SIN MARCA</option>
          {brandsList.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name.toUpperCase()}</option>
          ))}
        </select>
      </div>
      <div className="space-y-6">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Stock Total</label>
        <div className="w-full bg-(--bg-card) border border-(--border-main) px-6 py-4 text-sm font-black text-primary rounded-xl flex items-center">
          {totalStock} UNI
        </div>
      </div>
    </div>
  );
};
