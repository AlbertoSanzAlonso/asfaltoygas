import { type FC, type ReactNode, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BrandWatermark } from './BrandWatermark';
import { RouteSeo } from '@/components/seo/RouteSeo';

interface ShopLayoutProps {
  children: ReactNode;
  setIsCartOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export const ShopLayout: FC<ShopLayoutProps> = ({ children, setIsCartOpen, isMenuOpen, setIsMenuOpen }) => {
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);
  return (
    <div className="relative min-h-screen bg-accent text-secondary selection:bg-primary selection:text-white flex flex-col overflow-x-hidden">
      <RouteSeo />
      <BrandWatermark />
      <Navbar
        setIsCartOpen={setIsCartOpen} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />
      
      <main className="relative z-10 grow pt-16 lg:pt-36">
        {children}
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};
