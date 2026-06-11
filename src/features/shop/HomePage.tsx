import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useScrollRestoration } from "@/lib/useScrollRestoration";

import { HeroSliderSection } from './components/home/HeroSliderSection';
import { CategoryGridSection } from './components/home/CategoryGridSection';
import { BrandsCarouselSection } from './components/home/BrandsCarouselSection';
import { TopSalesSection } from './components/home/TopSalesSection';
import { CtaBannerSection } from './components/home/CtaBannerSection';
import { TestimonialsSection } from './components/home/TestimonialsSection';
import { AboutStripSection } from './components/home/AboutStripSection';
import { NewsletterSection } from './components/NewsletterSection';

const HomePage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { hash } = useLocation();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const arrivals = await api.products.getNewArrivals(true);
      return arrivals.slice(0, 8);
    }
  });

  useScrollRestoration('homepage', products);

  React.useEffect(() => {
    if (hash === '#novedades' || hash === '#marcas') {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [hash]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await api.subscriptions.create(email, 'pending', token);
      await api.mail.sendConfirmationEmail(email, token, window.location.origin);
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      useCartStore.getState().openModal({
        title: 'Error de Suscripción',
        message: error instanceof Error ? error.message : 'No se pudo procesar tu suscripción. Por favor, inténtalo más tarde.',
        type: 'info'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white overflow-x-hidden">
      <HeroSliderSection />
      <CategoryGridSection />
      <BrandsCarouselSection />
      <TopSalesSection products={products} isLoading={isLoading} />
      <CtaBannerSection />
      <TestimonialsSection />
      <AboutStripSection />
      <NewsletterSection
        email={email}
        setEmail={setEmail}
        isSubmitting={isSubmitting}
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
};

export default HomePage;
