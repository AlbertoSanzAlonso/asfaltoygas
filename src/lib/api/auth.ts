
import { supabase } from '../supabase';
import type { Customer, Admin } from '@/types';
import { orders } from './orders';

async function loadCustomerAddresses(customerId: string) {
  const { data: addrData } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('customer_id', customerId);

  return (addrData || []).map((addr: any) => ({
    shipping_address_id: addr.shipping_address_id,
    type: addr.address_type,
    street: addr.street,
    floor: addr.floor,
    door: addr.door,
    stair: addr.stair,
    province: addr.province,
    city: addr.city,
    zip: addr.zip,
    isDefault: addr.is_default,
  }));
}

async function loadCustomerFavorites(customerId: string): Promise<string[]> {
  const { data: favoritesData } = await supabase
    .from('customer_favorites')
    .select('product_id')
    .eq('customer_id', customerId);

  return (favoritesData || []).map((f: any) => f.product_id);
}

/** Tras login/registro: reclama pedidos guest y refresca perfil/direcciones. */
async function attachGuestHistory(customer: Customer): Promise<Customer> {
  try {
    await orders.claimGuestOrdersByEmail(customer.customer_id, customer.email);
  } catch (err) {
    console.error('[auth] claimGuestOrdersByEmail', err);
  }

  const { data: refreshed } = await supabase
    .from('customers')
    .select('*')
    .eq('customer_id', customer.customer_id)
    .maybeSingle();

  const addresses = await loadCustomerAddresses(customer.customer_id);
  const favorites = await loadCustomerFavorites(customer.customer_id);

  return {
    ...(refreshed || customer),
    addresses,
    favorites,
  };
}

export const auth = {
  login: async (email: string, password: string): Promise<{ user: Customer, token: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo recuperar el usuario');

    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('*')
      .eq('auth_id', authData.user.id)
      .maybeSingle();

    if (custError || !customer) throw new Error('Perfil de usuario no encontrado.');

    const user = await attachGuestHistory(customer as Customer);

    return {
      user,
      token: authData.session?.access_token || '',
    };
  },

  signup: async (customer: Omit<Customer, 'customer_id'> & { password: string }): Promise<{ user: Customer, token: string }> => {
    const cleanEmail = customer.email.toLowerCase().trim();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: customer.password,
    });

    if (authError) {
      console.error('Supabase Auth Signup Error:', authError);
      throw authError;
    }
    if (!authData.user) throw new Error('Error al crear la cuenta de autenticación');

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    let finalCustomer;

    if (existingCustomer) {
      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update({
          auth_id: authData.user.id,
          name: customer.name.trim(),
          surname: customer.surname?.trim() || '',
          phone: customer.phone?.trim() || '',
        })
        .eq('email', cleanEmail)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      finalCustomer = updatedCustomer;
    } else {
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert([
          {
            customer_id: crypto.randomUUID(),
            auth_id: authData.user.id,
            email: cleanEmail,
            name: customer.name.trim(),
            surname: customer.surname?.trim() || '',
            phone: customer.phone?.trim() || '',
          },
        ])
        .select()
        .maybeSingle();

      if (insertError) throw insertError;
      finalCustomer = newCustomer;
    }

    if (!finalCustomer) throw new Error('Error al gestionar el perfil de cliente');

    if (customer.addresses && customer.addresses.length > 0) {
      await supabase.from('shipping_addresses').insert(
        customer.addresses.map((addr) => ({
          customer_id: finalCustomer.customer_id,
          address_type: addr.type,
          street: addr.street,
          floor: addr.floor,
          door: addr.door,
          stair: addr.stair,
          province: addr.province,
          city: addr.city,
          zip: addr.zip,
          is_default: addr.isDefault,
        }))
      );
    }

    const user = await attachGuestHistory(finalCustomer as Customer);

    return {
      user,
      token: authData.session?.access_token || '',
    };
  },

  adminLogin: async (email: string, password: string): Promise<{ admin: Admin, token: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    const { user, session } = data;
    if (!user || !session) throw new Error('No se pudo iniciar sesión');

    const admin: Admin = {
      admin_id: user.id,
      username: user.email?.split('@')[0] || 'admin',
      email: user.email || '',
      role: 'admin',
      created_at: user.created_at,
    };

    return {
      admin,
      token: session.access_token,
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  },

  resetPassword: async (email: string, redirectTo: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
    return true;
  },
};
