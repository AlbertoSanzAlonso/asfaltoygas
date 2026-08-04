import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from "@/lib/api";
import { useScrollRestoration } from "@/lib/useScrollRestoration";

import { HeroSliderSection } from './components/home/HeroSliderSection';
import { CategoryGridSection } from './components/home/CategoryGridSection';
import { HeroWidgetSection } from './components/home/HeroWidgetSection';
import { TopSalesSection } from './components/home/TopSalesSection';
import { OutletSection } from './components/home/OutletSection';
import { StyleSelectorSection } from './components/home/StyleSelectorSection';
import { AccessoryHighlightsSection } from './components/home/AccessoryHighlightsSection';
import { ServicesStripSection } from './components/home/ServicesStripSection';
import { BrandLogosSection } from './components/home/BrandLogosSection';
import { SeoAboutSection } from './components/home/SeoAboutSection';

const HomePage = () => {
  const { hash } = useLocation();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const arrivals = await api.products.getNewArrivals(true);
      return arrivals.slice(0, 8);
    }
  });

  const { data: outletProducts, isLoading: isLoadingOutlet } = useQuery({
    queryKey: ['products', 'outlet'],
    queryFn: async () => {
      const outlet = await api.products.getOutlet(true);
      return outlet.slice(0, 8);
    }
  });

  useScrollRestoration('homepage', products);

  React.useEffect(() => {
    if (hash === '#novedades' || hash === '#marcas' || hash === '#outlet') {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [hash]);

  return (
    <div className="overflow-x-hidden">
      <HeroSliderSection />
      <CategoryGridSection />
      <HeroWidgetSection />
      <TopSalesSection products={products} isLoading={isLoading} />
      <OutletSection products={outletProducts} isLoading={isLoadingOutlet} />
      <StyleSelectorSection />
      <AccessoryHighlightsSection />
      <ServicesStripSection />
      <BrandLogosSection />
      <SeoAboutSection />
    </div>
  );
};

export default HomePage;
