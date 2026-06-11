import { type FC, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User as UserIcon, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { BRAND } from '@/lib/brand';

interface NavbarProps {
  setIsCartOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/categoria/cascos', label: 'Cascos' },
  { to: '/categoria/equipacion', label: 'Equipación' },
  { to: '/categoria/accesorios', label: 'Accesorios' },
  { to: '/#novedades', label: 'Top ventas' },
];

export const Navbar: FC<NavbarProps> = ({ setIsCartOpen, isMenuOpen, setIsMenuOpen }) => {
  const { user, isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const favoriteCount = user?.favorites?.length || 0;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleInicioClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/categoria/cascos?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/categoria/cascos');
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white border-b border-secondary/8 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-4 h-16 md:h-[72px]">
            {/* Mobile menu */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden p-2 -ml-2 text-secondary hover:text-primary transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" onClick={handleInicioClick} className="shrink-0 flex items-center gap-3 group">
              <img
                src="/assets/logo/logo-asfaltoygas-icon.svg"
                alt={BRAND.name}
                className="h-10 w-10 md:h-11 md:w-11 transition-transform group-hover:scale-105"
              />
              <div className="hidden sm:block leading-tight">
                <span className="font-display font-bold text-secondary text-base md:text-lg uppercase tracking-wide block">
                  {BRAND.name}
                </span>
                <span className="font-sans text-[10px] text-secondary/50 uppercase tracking-[0.2em]">
                  {BRAND.tagline}
                </span>
              </div>
            </Link>

            {/* Search — desktop */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-auto">
              <div className="flex w-full border border-secondary/15 overflow-hidden">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cascos, chaquetas, marcas..."
                  className="flex-1 px-4 py-2.5 font-sans text-sm text-secondary placeholder:text-secondary/40 focus:outline-none bg-accent/50"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="bg-primary hover:bg-primary-dark text-white px-5 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Nav links — desktop */}
            <nav className="hidden xl:flex items-center gap-6 shrink-0">
              {NAV_LINKS.slice(1).map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="font-display text-xs font-semibold tracking-[0.15em] uppercase text-secondary/80 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-5 ml-auto shrink-0">
              <Link to="/cuenta/favoritos" aria-label="Favoritos" className="relative text-secondary hover:text-primary transition-colors p-1">
                <Heart className="w-5 h-5" />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {favoriteCount}
                  </span>
                )}
              </Link>

              <Link to="/cuenta" aria-label="Mi cuenta" className="relative text-secondary hover:text-primary transition-colors p-1">
                <UserIcon className="w-5 h-5" />
                {isAuthenticated && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
                )}
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Cesta"
                className="relative flex items-center gap-2 text-secondary hover:text-primary transition-colors p-1"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="hidden md:block font-display text-xs font-semibold tracking-[0.1em] uppercase">
                  ({totalItems})
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-secondary/60 backdrop-blur-sm z-60 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-70 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 flex justify-between items-center border-b border-secondary/8">
                <img src="/assets/logo/logo-asfaltoygas-negro.svg" alt={BRAND.name} className="h-9 w-auto" />
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-secondary hover:text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { handleSearch(e); setIsMenuOpen(false); }} className="p-4 border-b border-secondary/8">
                <div className="flex border border-secondary/15 overflow-hidden">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-accent/30"
                  />
                  <button type="submit" className="bg-primary text-white px-4">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <nav className="flex-1 px-6 py-8 flex flex-col gap-5">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={(e) => { if (item.label === 'Inicio') handleInicioClick(e); setIsMenuOpen(false); }}
                    className="font-display text-xl font-semibold uppercase tracking-wide text-secondary hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-secondary/8">
                <p className="font-sans text-[10px] text-secondary/40 uppercase tracking-[0.3em] text-center">
                  {BRAND.tagline}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
