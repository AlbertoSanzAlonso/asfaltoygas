import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { useCartStore } from '@/store/useCartStore';

// Hooks
import { useCheckoutForm } from './hooks/useCheckoutForm';

// Components
import { CheckoutSummary } from './components/CheckoutSummary';
import { ShippingMethodSelector } from './components/ShippingMethodSelector';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { CheckoutAddressForm } from './components/CheckoutAddressForm';
import { CheckoutAddressSelector } from './components/checkout/CheckoutAddressSelector';
import { CheckoutSuccessModal } from './components/checkout/CheckoutSuccessModal';
import { CheckoutPaymentErrorModal } from './components/checkout/CheckoutPaymentErrorModal';
import { CheckoutLoginPrompt } from './components/checkout/CheckoutLoginPrompt';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const clearCart = useCartStore((s) => s.clearCart);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const {
    items,
    cartTotal,
    cartSubtotal,
    discountAmount,
    user,
    isAuthenticated,
    formData,
    setFormData,
    selectedAddressId,
    setSelectedAddressId,
    isChangingAddress,
    setIsChangingAddress,
    shippingOption,
    setShippingOption,
    selectedPoint,
    selectedNacexPoint,
    setSelectedNacexPoint,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    isLocating,
    zipMunicipalities,
    saveToAccount,
    setSaveToAccount,
    showSuccessModal,
    setShowSuccessModal,
    shippingCost,
    finalTotal,
    handleProvinceChange,
    handleCityChange,
    handleSubmit,
  } = useCheckoutForm();

  // Retorno desde Redsys (URLOK / URLKO)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'error') {
      setShowPaymentErrorModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'success') {
      clearCart();
      setShowSuccessModal(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [clearCart, setShowSuccessModal]);

  const handleGoToCart = () => {
    setShowPaymentErrorModal(false);
    navigate('/');
    setIsCartOpen(true);
  };

  const handleRetryPayment = () => {
    setShowPaymentErrorModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-accent min-h-screen pt-12 pb-32 text-secondary">
      <CheckoutSuccessModal show={showSuccessModal} onNavigate={navigate} />
      <CheckoutPaymentErrorModal
        show={showPaymentErrorModal}
        onGoToCart={handleGoToCart}
        onRetry={handleRetryPayment}
        onClose={() => setShowPaymentErrorModal(false)}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-16">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-7">
            {!isAuthenticated && <CheckoutLoginPrompt />}

            {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
              <CheckoutAddressSelector 
                addresses={user.addresses}
                selectedAddressId={selectedAddressId}
                onSelect={setSelectedAddressId}
                isChanging={isChangingAddress}
                setIsChanging={setIsChangingAddress}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
              <ShippingMethodSelector 
                selectedOption={shippingOption} 
                onSelect={setShippingOption} 
                selectedPoint={selectedPoint}
                onPointSelect={setSelectedNacexPoint}
                zipCode={formData.zip}
              />

              {(selectedAddressId === 'new' || !user?.addresses?.length) && (
                <CheckoutAddressForm 
                  formData={formData}
                  setFormData={setFormData}
                  isLocating={isLocating}
                  zipMunicipalities={zipMunicipalities}
                  onProvinceChange={handleProvinceChange}
                  onCityChange={handleCityChange}
                  isAuthenticated={isAuthenticated}
                  saveToAccount={saveToAccount}
                  setSaveToAccount={setSaveToAccount}
                  hasAddresses={!!user?.addresses?.length}
                  requireGuestContact={!isAuthenticated}
                />
              )}

              <PaymentMethodSelector 
                selectedMethod={paymentMethod} 
                onSelect={setPaymentMethod} 
              />

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full py-6 text-base font-black tracking-[0.2em] uppercase italic">
                {isSubmitting ? 'Procesando...' : `PAGAR ${finalTotal.toFixed(2)}€`}
              </Button>
            </form>
          </div>

          <div className="lg:col-span-5">
            <CheckoutSummary 
              items={items}
              cartSubtotal={cartSubtotal}
              discountAmount={discountAmount}
              cartTotal={cartTotal}
              shippingCost={shippingCost}
              finalTotal={finalTotal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
