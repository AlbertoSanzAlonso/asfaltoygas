// Configuración pública de NACEX (sin contraseña — ver NACEX_PASSWORD en .env / Vercel)
// Dirección de recogida: alinear con src/lib/brand.ts

import { BRAND } from '@/lib/brand';

export const NACEX_CONFIG = {
  usuario: "ASFALTOYGASATCLIENTE@GMAIL.COM",
  usuarioTest: "ASFALTOYGASATCLIENTE@GMAIL._T",
  agencia: "2924",
  cliente: "00485",
  codigoPostalRecogida: BRAND.address.postalCode,
  nombreRecogida: BRAND.name,
  direccionRecogida: BRAND.address.street,
  poblacionRecogida: BRAND.address.city,
  entorno: "produccion",
};
