/**
 * Prueba local de emails tras pago (cliente + admin).
 * Uso: ADMIN_ORDER_EMAIL=albertosanzdev@gmail.com npx tsx scripts/test-order-paid-emails.ts
 */
import 'dotenv/config';
import { sendOrderPaidEmails } from '../src/lib/emails/adminNewOrderNotification';

const adminEmail = process.env.ADMIN_ORDER_EMAIL || 'albertosanzdev@gmail.com';
const customerEmail = process.env.TEST_CUSTOMER_EMAIL || adminEmail;

process.env.ADMIN_ORDER_EMAIL = adminEmail;

const mockOrder = {
  order_id: 'test-' + Date.now(),
  customer_id: '',
  order_date: new Date().toISOString(),
  subtotal: 49.9,
  total_amount: 54.9,
  tax_amount: 0,
  shipping_cost: 5,
  order_status: 'Paid' as const,
  payment_status: 'Paid' as const,
  payment_method: 'Redsys (Tarjeta) — PRUEBA',
  shipping_address_id: 0,
  customer_email: customerEmail,
  shipping_street: 'Calle de prueba, 1',
  shipping_city: 'Benalmádena',
  shipping_province: 'Málaga',
  shipping_zip: '29631',
  carrier: 'home',
  guest_name: 'Prueba',
  guest_surname: 'Email',
  guest_phone: '600000000',
  created_at: new Date().toISOString(),
  items: [],
};

const mockItems = [
  {
    name: 'Prenda de prueba',
    quantity: 1,
    price: 49.9,
    unit_price_original: 49.9,
    line_discount: 0,
    size: 'M',
    color: 'Neutro',
    image_url: '',
  },
];

async function main() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Faltan GMAIL_USER o GMAIL_APP_PASSWORD en .env');
    process.exit(1);
  }

  console.log('Enviando emails de prueba…');
  console.log('  Admin:', adminEmail);
  console.log('  Cliente:', customerEmail);

  const result = await sendOrderPaidEmails(mockOrder as never, mockItems as never);

  console.log('Resultado:', result);
  if (!result.admin && !result.customer) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
