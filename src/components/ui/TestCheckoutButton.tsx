import { useState, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FlaskConical, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';

/** Slug del producto de prueba Redsys/Nacex (0,01€). */
const TEST_PRODUCT_SLUG = 'prueba-pago-001';

/**
 * Botón flotante para ir al checkout con el producto de prueba.
 * Visible solo si `VITE_ENABLE_TEST_CHECKOUT=true`.
 * Para ocultarlo: quita la variable o ponla en `false` y reinicia Vite.
 */
export const TestCheckoutButton: FC = () => {
  const enabled = import.meta.env.VITE_ENABLE_TEST_CHECKOUT === 'true';
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, addItem, closeModal } = useCartStore();
  const [loading, setLoading] = useState(false);

  if (!enabled) return null;
  if (location.pathname.startsWith('/admin')) return null;

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const product = await api.products.getBySlug(TEST_PRODUCT_SLUG);
      const variant = product.variants?.[0];
      if (!variant) {
        throw new Error('El producto de prueba no tiene variantes.');
      }
      clearCart();
      addItem(product, variant);
      closeModal();
      navigate('/checkout');
    } catch (err) {
      console.error('[TestCheckoutButton]', err);
      useCartStore.getState().openModal({
        title: 'Prueba de pago',
        message:
          'No se pudo cargar el producto de prueba. Comprueba que existe /producto/prueba-pago-001.',
        type: 'warning',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Compra de prueba (0,01€) — ocultar con VITE_ENABLE_TEST_CHECKOUT"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-70"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <FlaskConical className="h-4 w-4" aria-hidden />
      )}
      Compra prueba
    </button>
  );
};
