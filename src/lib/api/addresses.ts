
import { supabase } from '../supabase';
import type { Address } from '@/types';

/** Mapea una fila de `shipping_addresses` al modelo de frontend. */
export function mapAddressFromDb(addr: {
  shipping_address_id?: number;
  address_type?: string;
  street?: string;
  floor?: string | null;
  door?: string | null;
  stair?: string | null;
  province?: string;
  city?: string;
  zip?: string;
  location_id?: number | null;
  is_default?: boolean;
}): Address {
  return {
    shipping_address_id: addr.shipping_address_id,
    type: addr.address_type || 'Principal',
    street: addr.street || '',
    floor: addr.floor || undefined,
    door: addr.door || undefined,
    stair: addr.stair || undefined,
    province: addr.province || '',
    city: addr.city || '',
    zip: addr.zip || '',
    location_id: addr.location_id ?? undefined,
    isDefault: Boolean(addr.is_default),
  };
}

function toDbAddress(address: Partial<Address>) {
  const row: Record<string, unknown> = {};
  if (address.type !== undefined) row.address_type = address.type;
  if (address.street !== undefined) row.street = address.street;
  if (address.floor !== undefined) row.floor = address.floor || null;
  if (address.door !== undefined) row.door = address.door || null;
  if (address.stair !== undefined) row.stair = address.stair || null;
  if (address.province !== undefined) row.province = address.province;
  if (address.city !== undefined) row.city = address.city;
  if (address.zip !== undefined) row.zip = address.zip;
  if (address.location_id !== undefined) row.location_id = address.location_id ?? null;
  if (address.isDefault !== undefined) row.is_default = address.isDefault;
  return row;
}

export const addresses = {
  getByCustomer: async (customer_id: string): Promise<Address[]> => {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('customer_id', customer_id);

    if (error) throw error;
    return (data || []).map(mapAddressFromDb);
  },

  create: async (customer_id: string, address: Omit<Address, 'shipping_address_id'>): Promise<Address> => {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert([{
        customer_id,
        ...toDbAddress(address),
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No se pudo crear la dirección');

    return mapAddressFromDb(data);
  },

  update: async (shipping_address_id: number, updates: Partial<Address>): Promise<Address> => {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .update(toDbAddress(updates))
      .eq('shipping_address_id', shipping_address_id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No se pudo actualizar la dirección');

    return mapAddressFromDb(data);
  },

  delete: async (shipping_address_id: number): Promise<void> => {
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .eq('shipping_address_id', shipping_address_id);

    if (error) throw error;
  },

  setDefault: async (customer_id: string, shipping_address_id: number): Promise<void> => {
    // Reset all others
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('customer_id', customer_id);

    // Set new default
    await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('shipping_address_id', shipping_address_id);
  }
};
