import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/Button";

interface NewsletterSectionProps {
  email: string;
  setEmail: (email: string) => void;
  isSubmitting: boolean;
  isSubscribed: boolean;
  onSubscribe: (e: React.FormEvent) => void;
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  email,
  setEmail,
  isSubmitting,
  isSubscribed,
  onSubscribe
}) => {
  return (
    <section className="py-16 md:py-24 bg-secondary text-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4">
            Newsletter
          </h2>
          <p className="font-sans text-white/65 text-sm md:text-base max-w-md leading-relaxed">
            Suscríbete para recibir ofertas exclusivas, novedades de cascos y promociones en equipamiento motero.
          </p>
        </div>
        <div>
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 border border-white/10 p-8 text-center"
            >
              <h3 className="font-display text-xl font-bold uppercase text-primary mb-3">¡Casi estás dentro!</h3>
              <p className="font-sans text-sm text-white/80">Revisa tu email y confirma la suscripción.</p>
            </motion.div>
          ) : (
            <form onSubmit={onSubscribe} className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="flex-1 bg-white/10 border border-white/20 px-4 py-3.5 font-sans text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary min-w-0"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  className="px-8 font-display font-bold tracking-[0.15em] uppercase whitespace-nowrap"
                  isLoading={isSubmitting}
                >
                  Suscribirse
                </Button>
              </div>
              <p className="font-sans text-[10px] text-white/40 uppercase tracking-widest">
                Al suscribirte aceptas nuestra política de privacidad.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
