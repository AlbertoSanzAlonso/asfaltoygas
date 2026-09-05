import type { Order } from '../types/index.js';

type OrderPaymentFields = Pick<Order, 'order_status' | 'payment_status'>;

/** Pago confirmado (webhook Redsys u otro). */
export function isOrderPaid(order: OrderPaymentFields): boolean {
  const paymentStatus = String(order.payment_status ?? '').toLowerCase();
  if (paymentStatus === 'paid') return true;
  const status = order.order_status ?? '';
  return status === 'Paid' || status === 'Shipped' || status === 'Delivered';
}

/** Listo para preparar envío (etiqueta Nacex, etc.). */
export function canFulfillOrder(order: OrderPaymentFields): boolean {
  if (order.order_status === 'Cancelled') return false;
  return isOrderPaid(order);
}

/** Estados de flujo en el backoffice (lista de pedidos). */
export type AdminOrderListStatus =
  | 'pending_payment'
  | 'paid'
  | 'label_generated'
  | 'completed'
  | 'cancelled';

type OrderListStatusFields = OrderPaymentFields &
  Pick<Order, 'tracking_number'>;

export function getAdminOrderListStatus(order: OrderListStatusFields): AdminOrderListStatus {
  if (order.order_status === 'Cancelled') return 'cancelled';
  if (order.order_status === 'Delivered') return 'completed';
  if (order.tracking_number?.trim() || order.order_status === 'Shipped') {
    return 'label_generated';
  }
  if (isOrderPaid(order)) return 'paid';
  return 'pending_payment';
}

export const ADMIN_ORDER_LIST_STATUS_UI: Record<
  AdminOrderListStatus,
  { label: string; className: string }
> = {
  pending_payment: {
    label: 'Pendiente de pago',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-600',
  },
  paid: {
    label: 'Pagado',
    className: 'border-sky-500/40 bg-sky-500/10 text-sky-600',
  },
  label_generated: {
    label: 'Etiqueta generada',
    className: 'border-violet-500/40 bg-violet-500/10 text-violet-600',
  },
  completed: {
    label: 'Finalizado',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'border-rose-500/40 bg-rose-500/10 text-rose-600',
  },
};
