
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import type { Product } from "@/types/index";
import { ProductImage } from "./ProductImage";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user, isAuthenticated, updateUser, setPendingFavorite } = useAuthStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const isFavorite = user?.favorites?.includes(String(product.product_id)) || false;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setPendingFavorite(product.product_id);
      navigate('/login');
      return;
    }

    if (!user) return;

    const currentFavorites = user.favorites || [];
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== product.product_id)
      : [...currentFavorites, product.product_id];

    updateUser({ favorites: newFavorites });

    if (!isFavorite) {
      import("@/store/useCartStore").then(m => {
        m.useCartStore.getState().openModal({
          title: 'Añadido a favoritos',
          message: `El artículo ${product.name} se ha guardado en tu lista personal.`,
          type: 'favorites'
        });
      });
    }

    try {
      if (isFavorite) {
        await api.favorites.remove(user.customer_id, product.product_id);
        queryClient.invalidateQueries({ queryKey: ['favorites', user.customer_id] });
      } else {
        await api.favorites.add(user.customer_id, product.product_id);
        queryClient.invalidateQueries({ queryKey: ['favorites', user.customer_id] });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      updateUser({ favorites: currentFavorites });
    }
  };

  return (
    <div className="group relative flex flex-col bg-transparent">
      <Link to={`/producto/${product.product_id}`}>
        <ProductImage 
          src={product.images?.[0]} 
          alt={product.name} 
          onLoad={() => setIsLoaded(true)}
          aspectRatio="aspect-[3/4]"
          containerClassName="rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-500"
        />
      </Link>
        
      {/* Absolute Overlays (Heart and Badge) */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-1.5 right-1.5 md:top-2 md:right-2 p-1.5 md:p-2 rounded-full backdrop-blur-md transition-all duration-500 z-20 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        } ${
          isFavorite 
            ? 'bg-primary text-white scale-110 shadow-lg' 
            : 'bg-white/10 text-white hover:bg-white/20 hover:scale-110'
        }`}
      >
        <Heart className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {((product as any).is_new || (product as any).featured) && (
        <span className={`absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 uppercase tracking-widest italic transition-all duration-500 z-20 ${
          isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}>
          Novedad
        </span>
      )}

      {/* Text Info */}
      <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="mt-2 md:mt-3 flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xs md:text-xs font-bold tracking-tight text-secondary uppercase italic truncate">
              {product.name}
            </h3>
            <p className="text-[9px] text-secondary/40 mt-0.5 uppercase tracking-widest">
              {product.category}
            </p>
          </div>
          <p className="text-xs md:text-xs font-black text-secondary italic shrink-0">
            {product.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
    </div>
  );
};
