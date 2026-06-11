
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { PRODUCT_PLACEHOLDER } from '@/lib/constants';
import { isBlockedImageUrl } from '@/lib/supabaseConfig';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  containerClassName = "",
  aspectRatio = "aspect-auto",
  onLoad,
  loading = 'lazy',
  width = 600,
  height = 800,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const blocked = isBlockedImageUrl(src);
  const isPlaceholder = !src || blocked || src === PRODUCT_PLACEHOLDER || error;
  const imageSrc = isPlaceholder ? PRODUCT_PLACEHOLDER : src!;

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
      onLoad?.();
    }
  }, [imageSrc, onLoad]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${isPlaceholder ? 'bg-secondary/5' : 'bg-white'} ${containerClassName}`}>
      {!loaded && !isPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
          <motion.img 
            src={PRODUCT_PLACEHOLDER}
            alt="Cargando..." 
            className="w-12 h-12 object-contain opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      )}
      
      <motion.img
        ref={imgRef}
        key={imageSrc}
        src={imageSrc}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={() => {
          setError(true);
          setLoaded(true);
          onLoad?.();
        }}
        initial={{ opacity: 0, scale: 1 }}
        animate={loaded || isPlaceholder ? { 
          opacity: 1, 
          scale: 1,
        } : {}}
        transition={{ 
          duration: 0.6, 
          ease: [0.21, 0, 0.07, 1] 
        }}
        className={`w-full h-full transition-all duration-700 ${
          loaded || isPlaceholder ? 'opacity-100' : 'opacity-0'
        } ${
          isPlaceholder 
            ? 'object-contain p-12 md:p-20 opacity-40' 
            : 'object-cover group-hover:scale-105'
        } ${className}`}
      />
    </div>
  );
};
