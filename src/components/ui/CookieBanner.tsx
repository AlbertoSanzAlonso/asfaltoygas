import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Settings, X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already accepted or rejected cookies
    const cookiePreference = localStorage.getItem('ayg_cookie_preference');
    if (!cookiePreference) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('ayg_cookie_preference', 'all');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('ayg_cookie_preference', 'essential');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-md text-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] border border-white/10">
              
              {/* Accento rojo estilo velocidad/motos */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" />
              
              <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center">
                
                {/* Isotipo y contenido */}
                <div className="flex-1 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="flex-shrink-0 relative">
                    <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl animate-pulse" />
                    <img 
                      src="/assets/logo/logo-asfaltoygas-icon.svg" 
                      alt="Asfalto y Gas" 
                      className="w-16 h-16 object-contain relative z-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold flex items-center gap-2">
                      <Cookie className="w-5 h-5 text-primary" />
                      Aviso de Cookies y Privacidad
                    </h3>
                    <p className="text-sm text-gray-300 max-w-3xl font-sans">
                      En <span className="text-primary font-semibold">Asfalto y Gas</span> utilizamos cookies propias y de terceros para asegurar que tu experiencia rodando por nuestra web sea óptima, además de analizar el tráfico y personalizar el contenido. 
                      Puedes aceptar todas para acelerar a fondo o configurar tus preferencias.
                      Lee nuestra <Link to="/cookies" className="text-primary hover:text-primary-light underline underline-offset-2 transition-colors">Política de Cookies</Link>.
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-3 rounded-lg font-display font-semibold border border-white/20 hover:bg-white/5 transition-colors text-white whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rechazar opcionales
                  </button>
                  <Link
                    to="/cookies"
                    onClick={() => setIsVisible(false)}
                    className="px-6 py-3 rounded-lg font-display font-semibold border border-white/20 hover:bg-white/5 transition-colors text-white whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar
                  </Link>
                  <button
                    onClick={handleAcceptAll}
                    className="px-8 py-3 rounded-lg font-display font-bold bg-primary hover:bg-primary-light transition-colors text-white whitespace-nowrap flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,0,0,0.4)]"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Aceptar y Acelerar
                  </button>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
