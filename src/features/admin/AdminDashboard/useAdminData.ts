
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from "@/lib/api";
import type { Product, Order, Customer } from "@/types";

export type ProductHighlightFilter = 'novedad' | 'outlet' | 'none' | undefined;

function highlightToApiFilters(highlight?: ProductHighlightFilter): {
  isNewOnly?: boolean;
  isOutletOnly?: boolean;
} {
  if (highlight === 'novedad') return { isNewOnly: true };
  if (highlight === 'outlet') return { isOutletOnly: true };
  if (highlight === 'none') return { isNewOnly: false, isOutletOnly: false };
  return {};
}

export const useAdminData = (
  productPage: number,
  orderPage: number,
  customerPage: number,
  pageSize: number,
  searchTerm?: string,
  statusFilter?: boolean,
  highlightFilter?: ProductHighlightFilter,
  customerSearch?: string,
  categoryFilter?: string,
  subcategoryFilter?: string,
  brandFilter?: string,
) => {
  const queryClient = useQueryClient();
  const { isNewOnly, isOutletOnly } = highlightToApiFilters(highlightFilter);

  const { data: productsData, isLoading: loadingProducts } = useQuery<{ products: Product[], total: number }>({
    queryKey: ['admin-products', productPage, searchTerm, statusFilter, highlightFilter, categoryFilter, subcategoryFilter, brandFilter],
    queryFn: () => api.products.getAll(
      categoryFilter,
      subcategoryFilter,
      productPage,
      pageSize,
      statusFilter,
      searchTerm,
      isNewOnly,
      undefined,
      brandFilter ? parseInt(brandFilter) : undefined,
      undefined,
      undefined,
      null,
      isOutletOnly,
    )
  });
  
  const products = productsData?.products;
  const totalProducts = productsData?.total || 0;
  
  const { data: customersData, isLoading: loadingCustomers } = useQuery<{ customers: (Customer & { is_subscribed?: boolean })[], total: number }>({
    queryKey: ['admin-customers', customerPage, customerSearch],
    queryFn: async () => {
      const res = await api.customers.getAll(customerPage, pageSize, customerSearch);
      
      // Inject subscription status
      const subsRes = await api.subscriptions.getAll(1, 1000);
      const activeEmails = new Set(subsRes.subscriptions.filter(s => s.status === 'active').map(s => s.email.toLowerCase()));
      
      const customersWithStatus = res.customers.map(c => ({
        ...c,
        is_subscribed: activeEmails.has(c.email.toLowerCase())
      }));
      
      return { customers: customersWithStatus, total: res.total };
    }
  });

  const customers = customersData?.customers;
  const totalCustomers = customersData?.total || 0;

  const { data: ordersData, isLoading: loadingOrders } = useQuery<{ orders: Order[], total: number }>({
    queryKey: ['admin-orders', orderPage],
    queryFn: () => api.orders.getAll(orderPage, pageSize)
  });

  const orders = ordersData?.orders;
  const totalOrders = ordersData?.total || 0;

  const { data: subscriptionsData } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => api.subscriptions.getAll(1, 1000)
  });
  const subscriptions = subscriptionsData?.subscriptions;

  return {
    products,
    totalProducts,
    loadingProducts,
    customers,
    totalCustomers,
    loadingCustomers,
    orders,
    totalOrders,
    loadingOrders,
    subscriptions,
    queryClient
  };
};
