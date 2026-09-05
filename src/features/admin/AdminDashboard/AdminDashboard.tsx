
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AdminLayout } from "@/features/admin/AdminLayout";
import { ProductModal } from "@/features/admin/ProductModal/ProductModal";
import { OverviewTab } from "@/features/admin/AdminDashboard/components/OverviewTab";
import { ProductsTab } from "@/features/admin/AdminDashboard/components/ProductsTab";
import { OrdersTab } from "@/features/admin/AdminDashboard/components/OrdersTab";
import { NewsletterTab } from "@/features/admin/AdminDashboard/components/NewsletterTab";
import { CustomersTab } from "@/features/admin/AdminDashboard/components/CustomersTab";
import { DiscountCodesTab } from "@/features/admin/AdminDashboard/components/DiscountCodesTab";
import { OrderDetailsModal } from "@/features/admin/AdminDashboard/components/OrderDetailsModal";
import { useAdminData, type ProductHighlightFilter } from './useAdminData';
import { getOrderContact } from '@/lib/orderContact';
import type { Category, Brand as BrandType } from '@/types';
import { canFulfillOrder } from '@/lib/orderPayment';
import { useCartStore } from "@/store/useCartStore";
import { api } from "@/lib/api";
import type { ProductHighlightFlag } from "@/lib/api/products";
import type { Product, Order } from "@/types";

export const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const generateLabelStarted = useRef(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'newsletter' | 'discounts'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState({ number: '', carrier: 'NACEX' });
  
  // Pagination and Selection
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [highlightFilter, setHighlightFilter] = useState<ProductHighlightFilter>(undefined);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const pageSize = 10;

  // Reset page when filters or search change
  useEffect(() => {
    setProductPage(1);
  }, [productSearch, statusFilter, highlightFilter, categoryFilter, subcategoryFilter, brandFilter]);

  // Newsletter state
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [isSendingNewsletter, setIsSendingNewsletter] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });

  const {
    products,
    totalProducts,
    loadingProducts,
    customers,
    totalCustomers,
    orders,
    totalOrders,
    subscriptions,
    queryClient
  } = useAdminData(productPage, orderPage, customerPage, pageSize, productSearch, statusFilter, highlightFilter, customerSearch, categoryFilter, subcategoryFilter, brandFilter);

  const { data: allCategories } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => api.categories.getAll(),
  });

  const { data: allBrands } = useQuery<BrandType[]>({
    queryKey: ['admin-brands'],
    queryFn: () => api.brands.getAll(),
  });

  const { data: filteredSubcategories } = useQuery({
    queryKey: ['admin-subcategories', categoryFilter],
    queryFn: () => {
      if (!categoryFilter) return [];
      return api.categories.getSubcategories(parseInt(categoryFilter));
    },
    enabled: !!categoryFilter,
  });

  const openModal = useCartStore((state) => state.openModal);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: Partial<Product>) => {
      if (editingProduct) return api.products.update(editingProduct.product_id, data);
      return api.products.create(data as Omit<Product, 'product_id'>);
    },
    onSuccess: (product: Product, variables: Partial<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'new-arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'outlet'] });
      queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
      setIsModalOpen(false);
      
      const isNew = !editingProduct;
      const isPublishedInForm = variables.is_published === true;
      setEditingProduct(null);

      // Only show the "Publish?" prompt if it's NOT already published in the form
      if (!isPublishedInForm) {
        openModal({
          title: isNew ? '¡Producto Creado!' : '¡Cambios Guardados!',
          message: isNew 
            ? `El producto "${product.name}" se ha creado como borrador. ¿Quieres publicarlo ahora para que sea visible?`
            : `El producto "${product.name}" sigue en modo borrador (oculto). ¿Quieres publicarlo ya?`,
          type: 'product_created',
          actionLabel: 'Publicar y Ver',
          onAction: async () => {
            await api.products.update(product.product_id, { is_published: true });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
            window.open(`/producto/${product.slug}`, '_blank');
          },
          secondaryActionLabel: 'Dejar en Borrador',
          onSecondaryAction: async () => {
            // Keep as draft (already is)
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
          }
        });
      } else {
        openModal({
          title: isNew ? '¡Producto Publicado!' : '¡Producto Actualizado!',
          message: isNew
            ? `El producto "${product.name}" ya está disponible en la tienda.`
            : `Los cambios en "${product.name}" se han guardado correctamente.`,
          type: 'success',
          actionLabel: 'Ver el producto',
          onAction: () => {
            window.open(`/producto/${product.slug}`, '_blank');
          }
        });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (product.images?.length) {
        await Promise.allSettled(product.images.map((url) => api.storage.delete(url)));
      }
      return api.products.delete(product.product_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
      openModal({ title: 'Éxito', message: 'Producto eliminado correctamente.', type: 'info' });
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: (product: Product) => api.products.update(product.product_id, { is_published: !product.is_published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
    }
  });

  // Handlers
  const handleBulkStatusChange = async (is_published: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map(id => api.products.update(id, { is_published })));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
      setSelectedIds([]);
      openModal({ title: 'Éxito', message: 'Estado actualizado correctamente.', type: 'info' });
    } catch (err) {
      openModal({ title: 'Error', message: 'Error al actualizar el estado.', type: 'warning' });
    }
  };

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['products', 'new-arrivals'] });
    queryClient.invalidateQueries({ queryKey: ['products', 'outlet'] });
    queryClient.invalidateQueries({ queryKey: ['new-arrivals'] });
    queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
  };

  const flagLabel = (flag: ProductHighlightFlag) =>
    flag === 'novedad' ? 'Novedad' : flag === 'outlet' ? 'Outlet' : 'sin etiqueta';

  const handleBulkHighlightChange = async (flag: ProductHighlightFlag) => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    try {
      await api.products.bulkUpdateFlags(selectedIds, flag);
      invalidateProductQueries();
      setSelectedIds([]);
      openModal({
        title: 'Éxito',
        message: `${count} producto(s) marcados como ${flagLabel(flag)}.`,
        type: 'info',
      });
    } catch (err) {
      openModal({ title: 'Error', message: 'No se pudo actualizar la etiqueta.', type: 'warning' });
    }
  };

  const buildCurrentListFilters = () => {
    const filters: {
      category?: string;
      subcategory?: string;
      publishedOnly?: boolean;
      search?: string;
      isNewOnly?: boolean;
      isOutletOnly?: boolean;
      brandId?: number;
    } = {};
    if (categoryFilter) filters.category = categoryFilter;
    if (subcategoryFilter) filters.subcategory = subcategoryFilter;
    if (statusFilter !== undefined) filters.publishedOnly = statusFilter;
    if (productSearch) filters.search = productSearch;
    if (brandFilter) filters.brandId = parseInt(brandFilter);
    if (highlightFilter === 'novedad') filters.isNewOnly = true;
    if (highlightFilter === 'outlet') filters.isOutletOnly = true;
    if (highlightFilter === 'none') {
      filters.isNewOnly = false;
      filters.isOutletOnly = false;
    }
    return filters;
  };

  const handleBulkHighlightAllFiltered = (flag: ProductHighlightFlag) => {
    if (totalProducts === 0) return;
    openModal({
      title: 'Aplicar a todos los filtrados',
      message: `¿Marcar ${totalProducts} producto(s) filtrado(s) como ${flagLabel(flag)}?`,
      type: 'confirm',
      onConfirm: async () => {
        try {
          const updated = await api.products.updateFlagsByFilter(buildCurrentListFilters(), flag);
          invalidateProductQueries();
          setSelectedIds([]);
          openModal({
            title: 'Éxito',
            message: `${updated} producto(s) actualizados como ${flagLabel(flag)}.`,
            type: 'info',
          });
        } catch (err) {
          openModal({ title: 'Error', message: 'No se pudo actualizar los productos filtrados.', type: 'warning' });
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    openModal({
      title: 'Eliminar Selección',
      message: `¿Estás seguro de que quieres eliminar ${selectedIds.length} productos?`,
      type: 'confirm',
      onConfirm: async () => {
        const productsToDelete = products?.filter(p => selectedIds.includes(p.product_id)) || [];
        await Promise.all(productsToDelete.map(async (p) => {
          if (p.images?.length) await Promise.allSettled(p.images.map(u => api.storage.delete(u)));
          return api.products.delete(p.product_id);
        }));
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products-all-chat'] });
        setSelectedIds([]);
        openModal({ title: 'Éxito', message: 'Productos eliminados.', type: 'info' });
      }
    });
  };

  const handleMarkPaid = async (orderId: string) => {
    if (import.meta.env.VITE_ENABLE_TEST_CHECKOUT !== 'true') {
      openModal({
        title: 'No disponible',
        message: 'Solo se puede marcar como pagado manualmente con VITE_ENABLE_TEST_CHECKOUT=true.',
        type: 'warning',
      });
      return;
    }
    try {
      const updated = await api.orders.update(orderId, {
        order_status: 'Paid',
        payment_status: 'Paid',
      });
      setSelectedOrder(updated);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

      // En modo test, reenviar confirmaciones (el webhook a veces no dispara emails).
      let emailNote = '';
      try {
        const emailRes = await fetch('/api/mail?op=resend-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const emailData = await emailRes.json().catch(() => ({}));
        emailNote = emailData.success
          ? ' Correos de confirmación reenviados.'
          : ' No se pudieron enviar los correos (revisa SMTP en Vercel).';
      } catch {
        emailNote = ' No se pudieron enviar los correos.';
      }

      openModal({
        title: 'Pedido marcado como pagado',
        message: `Ya puedes generar la etiqueta Nacex de prueba.${emailNote}`,
        type: 'info',
      });
    } catch (err) {
      console.error(err);
      openModal({
        title: 'Error',
        message: 'No se pudo marcar el pedido como pagado.',
        type: 'warning',
      });
    }
  };

  const handleGenerateLabel = async (
    orderId: string,
    options?: { isTest?: boolean; order?: Order | null },
  ) => {
    let order = options?.order ?? orders?.find((o) => o.order_id === orderId) ?? null;
    if (!order) {
      try {
        order = await api.orders.getById(orderId);
      } catch (err) {
        console.error('Error cargando pedido para etiqueta:', err);
      }
    }

    if (!order) {
      openModal({
        title: 'Pedido no encontrado',
        message: 'No se pudo cargar el pedido para generar la etiqueta.',
        type: 'warning',
      });
      return;
    }

    if (!canFulfillOrder(order)) {
      openModal({
        title: 'Pago pendiente',
        message:
          'Este pedido aún no está pagado. El envío y la etiqueta Nacex solo están disponibles cuando Redsys confirme el pago.',
        type: 'warning',
      });
      return;
    }

    if (order.tracking_number?.trim()) {
      const tracking = order.tracking_number.trim();
      setSelectedOrder(order);
      setTrackingInfo({ number: tracking, carrier: order.carrier || 'NACEX' });
      openModal({
        title: 'Etiqueta ya generada',
        message: `Este pedido ya tiene tracking ${tracking}.`,
        type: 'info',
        actionLabel: 'Ver Etiqueta',
        onAction: () => api.shipping.openNacexLabel(undefined, tracking),
      });
      return;
    }

    const forceTest =
      options?.isTest === true ||
      import.meta.env.VITE_ENABLE_TEST_CHECKOUT === 'true' ||
      order.payment_method === 'TEST_MODE';

    try {
      const contact = getOrderContact(order);
      const orderDetails = {
        nombre: contact.name || 'Cliente',
        direccion: order.shipping_street,
        poblacion: order.shipping_city,
        cp: order.shipping_zip,
        telefono: contact.phone,
        orderId: order.order_id,
        isTest: forceTest,
        isNacexShop: order.carrier?.includes('Nacex Point'),
        payment_method: order.payment_method,
      };

      const res = await api.shipping.createNacexExpedition(orderId, orderDetails);

      // La API /api/nacex guarda el tracking con service role; refrescamos también en cliente
      let updatedOrder: typeof order | undefined;
      try {
        updatedOrder = await api.orders.update(orderId, {
          tracking_number: res.trackingNumber,
          carrier: 'NACEX',
          order_status: 'Shipped',
          shipped_date: new Date().toISOString(),
        });
      } catch (updateErr) {
        console.warn('Update cliente de pedido falló (tracking ya guardado en servidor):', updateErr);
      }

      const orderWithTracking = {
        ...(updatedOrder || order),
        tracking_number: res.trackingNumber,
        carrier: 'NACEX',
        order_status: 'Shipped' as const,
        shipped_date: new Date().toISOString(),
      };

      setSelectedOrder(orderWithTracking);
      setTrackingInfo({ number: res.trackingNumber, carrier: 'NACEX' });

      // Enviar notificación por email al cliente (cuenta o invitado)
      const shipEmail = getOrderContact(orderWithTracking).email || order.customer?.email;
      if (shipEmail) {
        try {
          await api.mail.sendStatusUpdate(
            { ...orderWithTracking, customer: order.customer },
            shipEmail,
            'Shipped'
          );
        } catch (emailErr) {
          console.error('Error al enviar email de notificación de envío:', emailErr);
        }
      }

      const isTestStub =
        forceTest ||
        res.trackingNumber === '9999999' ||
        res.trackingNumber?.toUpperCase().startsWith('TEST');
      openModal({
        title: forceTest ? 'Expedición NACEX (prueba)' : 'Expedición NACEX',
        message: isTestStub
          ? `Expedición TEST creada (${res.trackingNumber}). Nacex TEST no genera etiqueta ni recogida real; al abrir verás una etiqueta de prueba.`
          : `Expedición generada y pedido actualizado: ${res.trackingNumber}`,
        type: 'success',
        actionLabel: 'Ver Etiqueta',
        onAction: () => {
          if (res.trackingNumber) {
            api.shipping.openNacexLabel(res.labelUrl, res.trackingNumber);
          } else {
            alert('URL de etiqueta no disponible en este momento.');
          }
        }
      });

      // Refrescar los datos del admin para ver los cambios
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
    } catch (err) {
      console.error('Error generando etiqueta:', err);
      openModal({ 
        title: 'Error de Nacex', 
        message: err instanceof Error ? err.message : 'No se pudo generar la etiqueta. Revisa las credenciales o los datos del cliente.', 
        type: 'warning' 
      });
    }
  };

  // Deep link desde email: /admin?tab=orders&generateLabel=<orderId>
  useEffect(() => {
    const tab = searchParams.get('tab');
    const generateLabel = searchParams.get('generateLabel')?.trim();
    if (tab === 'orders' || generateLabel) {
      setActiveTab('orders');
    }
    if (!generateLabel || generateLabelStarted.current) return;
    generateLabelStarted.current = true;
    setSearchParams({}, { replace: true });
    openModal({
      title: 'Generando etiqueta Nacex',
      message: 'Creando la expedición a partir del enlace del correo…',
      type: 'info',
    });
    void handleGenerateLabel(generateLabel);
    // Solo al montar / al llegar con query del email
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveTracking = async (orderId: string, number: string, carrier: string) => {
    try {
      const updatedOrder = await api.orders.update(orderId, {
        tracking_number: number,
        carrier: carrier,
        order_status: 'Shipped',
        shipped_date: new Date().toISOString()
      });

      setSelectedOrder(updatedOrder);
      setTrackingInfo({ number, carrier });

      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      openModal({
        title: 'Estado Actualizado',
        message: `Número de seguimiento (${carrier}: ${number}) guardado con éxito.`,
        type: 'info',
        actionLabel: 'Aceptar'
      });
    } catch (err) {
      console.error('Error al guardar seguimiento:', err);
      openModal({
        title: 'Error',
        message: 'No se pudo actualizar el estado de seguimiento del pedido.',
        type: 'warning'
      });
    }
  };

  const handleSendNewsletter = async () => {
    const activeSubs = subscriptions?.filter(s => s.status === 'active') || [];
    if (activeSubs.length === 0) return;

    openModal({
      title: 'Confirmar Envío',
      message: `¿Enviar a ${activeSubs.length} suscriptores?`,
      type: 'action',
      onAction: async () => {
        setIsSendingNewsletter(true);
        setSendingProgress({ current: 0, total: activeSubs.length });
        for (const sub of activeSubs) {
          try {
            await api.mail.sendNewsletter(sub.email, newsletterSubject, newsletterContent, window.location.origin);
          } catch (err) {
            console.error(err);
          }
          setSendingProgress(prev => ({ ...prev, current: prev.current + 1 }));
        }
        setIsSendingNewsletter(false);
        openModal({ title: 'Éxito', message: 'Newsletter enviada.', type: 'info' });
        setNewsletterContent('');
        setNewsletterSubject('');
      }
    });
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="animate-fade-in">
        {activeTab === 'dashboard' && (
          <OverviewTab 
            orders={orders} 
            products={products} 
            onViewAllOrders={() => setActiveTab('orders')} 
            onOrderClick={(order) => { 
              setSelectedOrder(order); 
              setTrackingInfo({ number: order.tracking_number || '', carrier: order.carrier || 'NACEX' });
              setShowOrderDetails(true); 
            }}
            onEditProduct={(product) => { setEditingProduct(product); setIsModalOpen(true); }}
          />
        )}
        
        {activeTab === 'products' && (
          <ProductsTab 
            products={products}
            totalProducts={totalProducts}
            isLoading={loadingProducts}
            selectedIds={selectedIds}
            productPage={productPage}
            pageSize={pageSize}
            searchTerm={productSearch}
            onSearchChange={setProductSearch}
            onPageChange={setProductPage}
            statusFilter={statusFilter}
            highlightFilter={highlightFilter}
            onStatusFilterChange={setStatusFilter}
            onHighlightFilterChange={setHighlightFilter}
            onToggleSelectAll={() => setSelectedIds(selectedIds.length === products?.length ? [] : products?.map(p => p.product_id) || [])}
            onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkHighlightChange={handleBulkHighlightChange}
            onBulkHighlightAllFiltered={handleBulkHighlightAllFiltered}
            onBulkDelete={handleBulkDelete}
            onTogglePublish={(p) => togglePublishMutation.mutate(p)}
            onEdit={(p) => { setEditingProduct(p); setIsModalOpen(true); }}
            onDelete={(p) => {
              openModal({
                title: 'Eliminar Producto',
                message: `¿Borrar "${p.name}"?`,
                type: 'confirm',
                onConfirm: () => deleteMutation.mutate(p)
              });
            }}
            onCreate={() => { setEditingProduct(null); setIsModalOpen(true); }}
            categories={allCategories}
            brands={allBrands}
            categoryFilter={categoryFilter}
            subcategoryFilter={subcategoryFilter}
            brandFilter={brandFilter}
            filteredSubcategories={filteredSubcategories}
            onCategoryFilterChange={setCategoryFilter}
            onSubcategoryFilterChange={setSubcategoryFilter}
            onBrandFilterChange={setBrandFilter}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders}
            totalOrders={totalOrders}
            orderPage={orderPage}
            pageSize={pageSize}
            onPageChange={setOrderPage}
            onOrderClick={(order) => { 
              setSelectedOrder(order); 
              setTrackingInfo({ number: order.tracking_number || '', carrier: order.carrier || 'NACEX' });
              setShowOrderDetails(true); 
            }}
            onGenerateLabel={handleGenerateLabel}
          />
        )}

        {activeTab === 'newsletter' && (
          <NewsletterTab 
            subscriptions={subscriptions}
            newsletterSubject={newsletterSubject}
            newsletterContent={newsletterContent}
            isSendingNewsletter={isSendingNewsletter}
            sendingProgress={sendingProgress}
            onSubjectChange={setNewsletterSubject}
            onContentChange={setNewsletterContent}
            onSend={handleSendNewsletter}
          />
        )}

        {activeTab === 'discounts' && <DiscountCodesTab />}

        {activeTab === 'customers' && (
          <CustomersTab 
            customers={customers}
            totalCustomers={totalCustomers}
            customerPage={customerPage}
            pageSize={pageSize}
            searchTerm={customerSearch}
            onSearchChange={setCustomerSearch}
            onPageChange={setCustomerPage}
            onCreate={() => {
              const name = prompt('Nombre:');
              const surname = prompt('Apellidos:');
              const email = prompt('Email:');
              const password = prompt('Password:');
              if (name && surname && email && password) {
                api.customers.create({ name, surname, email, password }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
                });
              }
            }}
          />
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={(data) => saveMutation.mutate(data)} 
        />
      )}

      {showOrderDetails && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          trackingInfo={trackingInfo}
          onClose={() => setShowOrderDetails(false)}
          onGenerateLabel={handleGenerateLabel}
          onMarkPaid={handleMarkPaid}
        />
      )}
    </AdminLayout>
  );
};
