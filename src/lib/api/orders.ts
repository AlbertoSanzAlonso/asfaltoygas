
import { supabase } from '../supabase';
import type { Order } from '@/types';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const orders = {
  getAll: async (page = 1, pageSize = 20): Promise<{ orders: Order[], total: number }> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('orders')
      .select('*, customer:customers(name, surname, email, phone)', { count: 'exact' })
      .order('order_date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return {
      orders: data || [],
      total: count || 0
    };
  },

  getByCustomer: async (idOrEmail: string, page = 1, pageSize = 20): Promise<Order[]> => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const isEmail = idOrEmail.includes('@');

    let query = supabase
      .from('orders')
      .select('*, customer:customers(name, surname, email, phone)');

    if (isEmail) {
      const email = normalizeEmail(idOrEmail);
      query = query.ilike('customer_email', email);
    } else {
      query = query.eq('customer_id', idOrEmail);
    }

    const { data, error } = await query
      .order('order_date', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data || [];
  },

  create: async (order: Omit<Order, 'order_id'>): Promise<Order> => {
    const payload = {
      ...order,
      customer_email: order.customer_email
        ? normalizeEmail(order.customer_email)
        : order.customer_email,
    };
    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  update: async (order_id: string, updates: Partial<Order>): Promise<Order> => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('order_id', order_id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Vincula pedidos hechos como invitado (mismo email, sin customer_id)
   * a la cuenta recién creada/logueada. También importa dirección y
   * datos de contacto guest si el perfil/direcciones están vacíos.
   */
  claimGuestOrdersByEmail: async (
    customerId: string,
    email: string
  ): Promise<{ claimed: number }> => {
    const cleanEmail = normalizeEmail(email);
    if (!customerId || !cleanEmail) return { claimed: 0 };

    const { data: guestOrders, error: fetchError } = await supabase
      .from('orders')
      .select(
        'order_id, guest_name, guest_surname, guest_phone, shipping_street, shipping_floor, shipping_door, shipping_stair, shipping_province, shipping_city, shipping_zip, order_date'
      )
      .is('customer_id', null)
      .ilike('customer_email', cleanEmail)
      .order('order_date', { ascending: false });

    if (fetchError) {
      console.error('[claimGuestOrdersByEmail] fetch', fetchError);
      return { claimed: 0 };
    }

    if (!guestOrders?.length) {
      return { claimed: 0 };
    }

    const orderIds = guestOrders.map((o) => o.order_id);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ customer_id: customerId, customer_email: cleanEmail })
      .in('order_id', orderIds);

    if (updateError) {
      console.error('[claimGuestOrdersByEmail] update', updateError);
      return { claimed: 0 };
    }

    const latest = guestOrders[0];

    const { data: customer } = await supabase
      .from('customers')
      .select('name, surname, phone')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (customer) {
      const profilePatch: Record<string, string> = {};
      if (!customer.name?.trim() && latest.guest_name?.trim()) {
        profilePatch.name = latest.guest_name.trim();
      }
      if (!customer.surname?.trim() && latest.guest_surname?.trim()) {
        profilePatch.surname = latest.guest_surname.trim();
      }
      if (!customer.phone?.trim() && latest.guest_phone?.trim()) {
        profilePatch.phone = String(latest.guest_phone).replace(/\D/g, '');
      }
      if (Object.keys(profilePatch).length > 0) {
        await supabase.from('customers').update(profilePatch).eq('customer_id', customerId);
      }
    }

    const { count: addressCount } = await supabase
      .from('shipping_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId);

    if ((addressCount ?? 0) === 0 && latest.shipping_street?.trim()) {
      await supabase.from('shipping_addresses').insert([
        {
          customer_id: customerId,
          address_type: 'Envío',
          street: latest.shipping_street,
          floor: latest.shipping_floor || '',
          door: latest.shipping_door || '',
          stair: latest.shipping_stair || '',
          province: latest.shipping_province || '',
          city: latest.shipping_city || '',
          zip: latest.shipping_zip || '',
          is_default: true,
        },
      ]);
    }

    return { claimed: orderIds.length };
  },
};
