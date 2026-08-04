import { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Users, ExternalLink, Menu, X, Mail, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAdminStore } from "@/store/useAdminStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from "@/components/ThemeToggle";
import { BRAND } from '@/lib/brand';
import { BRAND_LOGO_ICON } from '@/lib/constants';
import { BrandWatermark } from '@/components/layout/BrandWatermark';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'products' | 'orders' | 'customers' | 'newsletter' | 'discounts';
  onTabChange: (tab: 'dashboard' | 'products' | 'orders' | 'customers' | 'newsletter' | 'discounts') => void;
}

const AdminBrandMark: React.FC<{ size?: 'sm' | 'lg' }> = ({ size = 'lg' }) => (
  <Link to="/" className="flex items-center gap-3 group">
    <img
      src={BRAND_LOGO_ICON}
      alt={BRAND.name}
      className={`${size === 'lg' ? 'h-16 w-16' : 'h-10 w-10'} object-contain transition-transform group-hover:scale-105`}
    />
    <div className="leading-tight">
      <span className={`font-display font-bold uppercase tracking-wide block ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {BRAND.name}
      </span>
      <span className="font-sans text-[10px] text-(--text-main)/50 uppercase tracking-[0.2em]">
        {BRAND.tagline}
      </span>
    </div>
  </Link>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { adminLogout } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''} bg-(--bg-main) text-(--text-main) overflow-hidden relative transition-colors duration-300`}>
      <BrandWatermark />
      {/* Cabecera con menú: visible por debajo de 1350px (móvil + tablet) */}
      <div className="flex min-[1350px]:hidden items-center justify-between p-4 border-b border-(--border-main) bg-(--bg-main) fixed top-0 left-0 w-full z-50">
        <AdminBrandMark size="sm" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-(--text-main) p-2">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar: fija y oculta por defecto hasta 1350px; visible en desktop ancho */}
      <aside className={`fixed min-[1350px]:static inset-y-0 left-0 w-72 border-r border-(--border-main) flex flex-col bg-(--bg-main) z-40 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full min-[1350px]:translate-x-0'}`}>
        <div className="p-10 grow overflow-y-auto">
          <div className="flex flex-col mb-16 items-start">
            <AdminBrandMark size="lg" />
          </div>
          
          <nav className="space-y-4">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Resumen' },
              { id: 'products', icon: Package, label: 'Productos' },
              { id: 'orders', icon: ShoppingCart, label: 'Pedidos' },
              { id: 'customers', icon: Users, label: 'Clientes' },
              { id: 'newsletter', icon: Mail, label: 'Newsletter' },
              { id: 'discounts', icon: Tag, label: 'Descuentos' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                  onTabChange(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all group ${
                  activeTab === item.id 
                    ? 'bg-primary text-white font-black italic border-l-4 border-white' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:text-primary'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-20 pt-10 border-t border-(--border-main)">
              <Link 
                to="/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`flex items-center gap-4 text-primary transition-colors group ${theme === 'dark' ? 'hover:text-white' : 'hover:text-primary-dark'}`}
              >
                 <ExternalLink className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-[0.4em]">Ir a la Tienda</span>
              </Link>
          </div>
        </div>

        <div className="p-10 border-t border-(--border-main)">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-gray-500 hover:text-red-500 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="relative z-10 flex-1 overflow-y-auto pt-24 min-[1350px]:pt-0 w-full min-w-0 transition-colors duration-300">
        <header className="h-auto min-[1350px]:h-24 py-6 min-[1350px]:py-0 border-b border-(--border-main) flex flex-col-reverse min-[1350px]:flex-row items-center justify-between px-6 min-[1350px]:px-16 bg-(--bg-main) gap-4 min-[1350px]:gap-0 transition-colors duration-300">
          <div className="hidden min-[1350px]:flex items-center gap-6 ml-auto">
            <ThemeToggle />
          </div>
        </header>
        
        <div className="relative p-6 md:p-8 min-[1780px]:p-16 w-full max-w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
};
