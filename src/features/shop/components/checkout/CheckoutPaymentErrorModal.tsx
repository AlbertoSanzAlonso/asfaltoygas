import React from 'react';
import { Button } from "@/components/ui/Button";
import { BRAND } from '@/lib/brand';
import { BRAND_LOGO_ICON } from '@/lib/constants';

interface CheckoutPaymentErrorModalProps {
  show: boolean;
  onGoToCart: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const CheckoutPaymentErrorModal: React.FC<CheckoutPaymentErrorModalProps> = ({
  show,
  onGoToCart,
  onRetry,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="mb-4 flex justify-center">
          <img
            src={BRAND_LOGO_ICON}
            alt={BRAND.name}
            className="w-20 h-20 object-contain"
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-display font-black uppercase tracking-tighter italic">
            Pago <span className="text-primary italic font-serif lowercase">no completado</span>
          </h2>
          <p className="text-sm text-secondary/60 font-medium leading-relaxed">
            No hemos podido confirmar el pago. No se ha cobrado nada (o el banco ha denegado la operación).
            Puedes volver a intentarlo o revisar tu cesta.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <Button
            onClick={onGoToCart}
            className="w-full bg-primary hover:bg-secondary text-white py-6 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-primary/20"
          >
            Volver a la cesta
          </Button>
          <Button
            variant="outline"
            onClick={onRetry}
            className="w-full py-5 text-xs font-black uppercase tracking-[0.2em] rounded-2xl border-secondary/20"
          >
            Reintentar pago
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 hover:text-secondary transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
