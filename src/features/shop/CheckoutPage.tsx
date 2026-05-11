import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { User, LogIn } from 'lucide-react';
import { CITIES_BY_PROVINCE } from "@/constants/locations";
import { api } from "@/lib/api";
import type { Address } from '@/types';

import { fetchRedsysParameters, REDSYS_URL_TEST, REDSYS_URL_PROD } from "@/lib/redsys";

// Sub-components
import { CheckoutSummary } from './components/CheckoutSummary';
import { ShippingMethodSelector } from './components/ShippingMethodSelector';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { CheckoutAddressForm } from './components/CheckoutAddressForm';
import { CheckoutAddressSelector } from './components/checkout/CheckoutAddressSelector';
import { CheckoutSuccessModal } from './components/checkout/CheckoutSuccessModal';

const CheckoutPage = () => {
  const { items, total: cartTotal, clearCart, setIsCartOpen, openModal } = useCartStore();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new'>(
    user?.addresses?.find(a => a.isDefault)?.shipping_address_id || (user?.addresses?.length ? user.addresses[0].shipping_address_id! : 'new')
  );
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bizum'>('card');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [shippingOption, setShippingOption] = useState<'home' | 'local' | 'nacex_point'>('home');
  const [selectedPoint, setSelectedPoint] = useState<string>('');
  const [isChangingAddress, setIsChangingAddress] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    surname: '',
    address: '',
    floor: '',
    door: '',
    stair: '',
    province: '',
    city: '',
    zip: '',
    location_id: undefined as number | undefined
  });

  const [isLocating, setIsLocating] = useState(false);

  // Zip Code Autocomplete Logic
  useEffect(() => {
    const fetchLocation = async () => {
      if (formData.zip.length === 5) {
        setIsLocating(true);
        try {
          const result = await api.locations.getByZip(formData.zip);
          if (result) {
            setFormData(prev => ({
              ...prev,
              city: result.city,
              province: result.province,
              location_id: (result as any).id
            }));
          }
        } catch (error) {
          console.error('Location fetch error:', error);
        } finally {
          setIsLocating(false);
        }
      }
    };
    fetchLocation();
  }, [formData.zip]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({ ...prev, email: user.email, name: user.name, surname: user.surname || '' }));
      
      if (selectedAddressId !== 'new' && user.addresses) {
        const addr = user.addresses.find(a => a.shipping_address_id === selectedAddressId);
        if (addr) {
          setFormData({
            email: user.email,
            name: user.name,
            surname: user.surname || '',
            address: addr.street,
            floor: addr.floor || '',
            door: addr.door || '',
            stair: addr.stair || '',
            province: addr.province || '',
            city: addr.city,
            zip: addr.zip,
            location_id: addr.location_id
          });
        }
      }
    }
  }, [isAuthenticated, user, selectedAddressId]);

  useEffect(() => {
    if (showSuccessModal) {
      clearCart();
      setIsCartOpen(false);
    }
  }, [showSuccessModal, clearCart, setIsCartOpen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'error') {
      openModal({
        title: 'Error en el pago',
        message: 'No se pudo completar la transacción. Por favor, inténtalo de nuevo con otro método o revisa los datos.',
        type: 'warning'
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const getShippingCost = () => {
    if (shippingOption === 'local') return 0;
    if (shippingOption === 'home') return 5.50;
    if (shippingOption === 'nacex_point') return 0;
    return 0;
  };

  const shippingCost = getShippingCost();
  const finalTotal = cartTotal + shippingCost;

  const handleProvinceChange = (newProv: string) => {
    setFormData({
      ...formData,
      province: newProv,
      city: '',
      zip: '',
      location_id: undefined
    });
  };

  const handleCityChange = (newCity: string) => {
    if (newCity === 'otra') {
      setFormData({ ...formData, city: '' });
      return;
    }

    let detectedProv = formData.province;
    if (!detectedProv) {
      for (const [prov, cities] of Object.entries(CITIES_BY_PROVINCE)) {
        if ((cities as string[]).includes(newCity)) {
          detectedProv = prov;
          break;
        }
      }
    }

    setFormData({
      ...formData,
      city: newCity,
      province: detectedProv
    });
  };

  const handleTestOrder = async () => {
    setIsSubmitting(true);
    const orderData: any = {
      customer_id: user?.customer_id,
      subtotal: cartTotal,
      total_amount: finalTotal,
      order_status: 'Paid',
      payment_method: 'Test (Sin pago)',
      shipping_city: formData.city,
      shipping_province: formData.province,
      shipping_zip: formData.zip,
      shipping_street: formData.address,
      shipping_floor: formData.floor,
      shipping_door: formData.door,
      shipping_stair: formData.stair,
      customer_email: user?.email || formData.email,
      tax_amount: 0,
      shipping_cost: 0,
      items: items.map(item => ({ 
        product_id: item.product_id, 
        name: item.name, 
        quantity: item.quantity, 
        price: item.price,
        size: item.selectedVariant.size,
        color: item.selectedVariant.color,
        image_url: item.images?.[0] || ''
      })),
      payment_status: 'Paid',
      carrier: shippingOption === 'nacex_point' ? `Nacex Point: ${selectedPoint}` : shippingOption
    };

    try {
      const createdOrder = await api.orders.create(orderData);
      
      try {
        const targetEmail = user?.email || formData.email;
        if (!targetEmail) throw new Error('No se ha podido determinar el email del cliente.');
        // Aseguramos que pasamos los items del pedido para que el email se genere correctamente
        await api.mail.sendOrderConfirmation({ ...createdOrder, items: orderData.items }, targetEmail);
      } catch (mailError) {
        console.error('Failed to send confirmation email:', mailError);
      }
      
      for (const item of items) {
        if (item.selectedVariant.variant_id) {
          await api.products.decrementStock(item.selectedVariant.variant_id.toString(), item.quantity);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['orders', user?.email] });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating test order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (shippingOption === 'nacex_point' && !selectedPoint) {
      alert('Por favor, selecciona un Punto Nacex Shop para continuar.');
      setIsSubmitting(false);
      return;
    }

    const selectedAddress = user?.addresses?.find(a => a.shipping_address_id === selectedAddressId);
    let shippingAddressId = selectedAddress?.shipping_address_id || null;

    if (isAuthenticated && user && selectedAddressId === 'new' && saveToAccount) {
      const newAddress: Address = {
        type: `Dirección ${(user.addresses?.length || 0) + 1}`,
        street: formData.address,
        floor: formData.floor,
        door: formData.door,
        stair: formData.stair,
        province: formData.province,
        city: formData.city,
        zip: formData.zip,
        location_id: formData.location_id,
        isDefault: !user.addresses?.length
      };
      
      try {
        const updatedUser = await api.customers.update(user.customer_id, { 
          addresses: [...(user.addresses || []), newAddress], 
          surname: formData.surname 
        });
        updateUser(updatedUser);
        const savedAddr = updatedUser.addresses?.find(a => a.street === newAddress.street && a.zip === newAddress.zip);
        shippingAddressId = savedAddr?.shipping_address_id || null;
      } catch (error) {
        console.error('Error saving address:', error);
      }
    }

    const orderData: any = {
      customer_id: user?.customer_id,
      subtotal: cartTotal,
      total_amount: finalTotal,
      order_status: 'Pending',
      payment_method: paymentMethod === 'card' ? 'Redsys (Tarjeta)' : 'Redsys (Bizum)',
      carrier: shippingOption === 'nacex_point' ? `Nacex Point: ${selectedPoint}` : shippingOption,
      shipping_address_id: shippingAddressId,
      shipping_city: formData.city,
      shipping_province: formData.province,
      shipping_zip: formData.zip,
      shipping_street: formData.address,
      shipping_floor: formData.floor,
      shipping_door: formData.door,
      shipping_stair: formData.stair,
      customer_email: user?.email || formData.email,
      tax_amount: 0,
      shipping_cost: shippingCost,
      items: items.map(item => ({ 
        product_id: item.product_id, 
        name: item.name, 
        quantity: item.quantity, 
        price: item.price,
        size: item.selectedVariant.size,
        color: item.selectedVariant.color,
        image_url: item.images?.[0] || ''
      })),
      payment_status: 'pending'
    };

    try {
      const createdOrder = await api.orders.create(orderData);
      
      queryClient.invalidateQueries({ queryKey: ['orders', user?.email] });
      
      const redsysParams = await fetchRedsysParameters(
        createdOrder.order_id,
        finalTotal,
        {
          urlOk: `${window.location.origin}/cuenta/pedidos?payment=success`,
          urlKo: `${window.location.origin}/checkout?payment=error`,
          urlNotification: `${window.location.origin}/api/webhooks/redsys`, 
          productDescription: `Pedido #${createdOrder.order_id.split('-')[0].toUpperCase()}`,
          paymentMethod: paymentMethod
        }
      );

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = import.meta.env.PROD ? REDSYS_URL_PROD : REDSYS_URL_TEST;
      
      Object.entries(redsysParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error('Error creating order or redirecting to payment:', error);
      alert('Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-accent min-h-screen pt-12 pb-32 text-secondary">
      {/* Success Modal */}
      <CheckoutSuccessModal show={showSuccessModal} onNavigate={navigate} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic mb-16">Finalizar Pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-7">
            {!isAuthenticated && (
              <div className="mb-12 p-8 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest italic">¿Ya eres cliente?</h4>
                    <p className="text-[10px] text-secondary/60 uppercase tracking-widest font-medium">Inicia sesión para usar tus datos guardados.</p>
                  </div>
                </div>
                <Link to="/login" state={{ from: '/checkout' }}>
                  <Button variant="outline" size="sm" className="px-8 border-primary/30 text-primary hover:bg-primary hover:text-white flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> INICIAR SESIÓN
                  </Button>
                </Link>
              </div>
            )}

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
                onPointSelect={setSelectedPoint}
                zipCode={formData.zip}
              />

              {(selectedAddressId === 'new' || !user?.addresses?.length) && (
                <CheckoutAddressForm 
                  formData={formData}
                  setFormData={setFormData}
                  isLocating={isLocating}
                  onProvinceChange={handleProvinceChange}
                  onCityChange={handleCityChange}
                  isAuthenticated={isAuthenticated}
                  saveToAccount={saveToAccount}
                  setSaveToAccount={setSaveToAccount}
                  hasAddresses={!!user?.addresses?.length}
                />
              )}

              <PaymentMethodSelector 
                selectedMethod={paymentMethod} 
                onSelect={setPaymentMethod} 
              />

              <div className="space-y-4">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full py-6 text-base font-black tracking-[0.2em] uppercase italic">
                  {isSubmitting ? 'Procesando...' : `PAGAR ${finalTotal.toFixed(2)}€`}
                </Button>
                <button type="button" onClick={handleTestOrder} disabled={isSubmitting} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border border-dashed border-gray-300 rounded-2xl">
                  TEST: FINALIZAR PEDIDO (SIN PAGO)
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5">
            <CheckoutSummary 
              items={items}
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
