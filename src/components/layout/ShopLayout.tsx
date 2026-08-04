import { type FC, type ReactNode, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
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
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none select-none"
      >
        <img
          src="/assets/logo/logo-team-asfaltoygas-bg.webp"
          alt=""
          decoding="async"
          className="w-[min(92vw,960px)] h-auto opacity-[0.10]"
        />
      </div>
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
