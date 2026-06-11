import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsletterSection } from './components/NewsletterSection';
import { api } from "@/lib/api";
import { BRAND } from '@/lib/brand';

const ConocenosPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      await api.subscriptions.create({
        email,
        status: 'pending',
        confirmation_token: token
      });
      await api.mail.sendConfirmationEmail(email, token);
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error al suscribirse. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent/20">
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558981403-c5f9899a28dc?q=80&w=2070&auto=format&fit=crop"
            alt={`${BRAND.name} — Sobre nosotros`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-secondary/60 z-10" />
        </div>

        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto flex flex-col items-center space-y-4 md:space-y-6">
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            src="/assets/logo/logo-asfaltoygas-blanco.svg"
            alt={BRAND.name}
            className="w-64 md:w-80 mb-4 drop-shadow-lg"
          />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-[0.15em]"
          >
            Conócenos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-base text-white/90 uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed"
          >
            Pasión por las dos ruedas, protección y equipación de primer nivel.
          </motion.p>
        </div>
      </section>

      <section className="py-20 md:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-secondary mb-12">
                Nuestra <span className="text-primary">historia</span>
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg font-light">
                {BRAND.name} nació de la pasión por el motociclismo. Somos especialistas en cascos y equipación motera,
                con un catálogo cuidadosamente seleccionado de las mejores marcas del sector.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg font-light">
                Cada casco, cada chaqueta y cada accesorio que ofrecemos ha sido elegido pensando en tu seguridad y confort.
                Porque en la carretera, la protección no es negociable.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-4/5 overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=2070&auto=format&fit=crop"
                  alt="Cascos de moto en tienda"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-white p-6 shadow-xl">
                <Shield className="w-8 h-8" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-white text-center px-4">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight max-w-4xl mx-auto"
          >
            Protección, estilo y las mejores marcas.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm uppercase tracking-[0.3em] text-white/80 mt-12"
          >
            Descubre nuestro catálogo de cascos y equipación para cada tipo de conducción.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <Link
              to="/categoria/cascos"
              className="inline-flex items-center justify-center font-black tracking-[0.2em] uppercase bg-transparent border border-white text-white hover:bg-white hover:text-primary px-12 py-4 text-sm transition-all"
            >
              Ver cascos
            </Link>
          </motion.div>
        </div>
      </section>

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

export default ConocenosPage;
