# Integración NACEX - Guía rápida

Tienda **a medida** (React/Vite) integrada con **Nacex Web Service** vía HTTP/GET en `https://pda.nacex.com/nacex_ws/ws`. No usa módulos PrestaShop/WooCommerce.

## Configuración

- Credenciales de referencia en `src/constants/nacex.ts` (sin contraseña).
- Clave MD5 en `NACEX_PASSWORD` (Vercel / `.env` local, **no commitear**).
- Documentación oficial: https://pda.nacex.com/nacex_ws

## Variables de entorno (Vercel)

| Variable | Valor |
|----------|-------|
| `NACEX_USER` | `ASFALTOYGASATCLIENTE@GMAIL.COM` |
| `NACEX_USER_TEST` | `ASFALTOYGASATCLIENTE@GMAIL._T` (solo pruebas) |
| `NACEX_PASSWORD` | Clave MD5 de Nacex |
| `NACEX_AGENCIA` | `2924` |
| `NACEX_CLIENTE` | `00485` |
| `NACEX_CP_RECOGIDA` | CP recogida tienda (ej. `29631`) |
| `NACEX_NOMBRE_RECOGIDA` | Nombre remitente |
| `NACEX_DIR_RECOGIDA` | Dirección recogida |
| `NACEX_POBLACION_RECOGIDA` | Población recogida |
| `NACEX_TEL_RECOGIDA` | Teléfono recogida |

Tras cambiar variables en Vercel → **redeploy obligatorio**.

## Endpoints (`api/nacex.ts`)

| Método | Uso |
|--------|-----|
| `GET ?method=test_connection` | Comprueba credenciales (`mode: real` / `mock`) |
| `GET ?method=get_puntos_shop&cp=XXXXX` | Puntos Nacex Shop por CP |
| `POST ?method=crear_envio` | Crea expedición (`putExpedicion`) |
| `GET ?method=get_etiqueta&codExp=XXXX` | Etiqueta PNG |
| `GET ?method=estado_envio&tracking=XXXX` | Estado conexión |

Sin `NACEX_PASSWORD` válida → respuestas **mock**.

### Parser puntos Shop

Nacex devuelve varios puntos en una sola cadena separada por `|`; cada punto usa campos `~`. Ver `parseNacexShopPoints()` en `api/nacex.ts`.

## Pruebas en producción

```bash
# Credenciales
curl -s "https://www.asfaltoygas.es/api/nacex?method=test_connection"

# Puntos Shop (debe devolver ~10 para CP 29631)
curl -s "https://www.asfaltoygas.es/api/nacex?method=get_puntos_shop&cp=29631"

# Etiqueta (sustituir codExp)
curl -sI "https://www.asfaltoygas.es/api/nacex?method=get_etiqueta&codExp=NUM_EXPEDICION"
```

**⚠️ `crear_envio` sin `isTest` crea envío REAL** (Nacex puede programar recogida en tienda). Para pruebas:

- Usar `NACEX_USER_TEST` temporalmente en Vercel, o
- Enviar `"isTest": true` en el JSON (modo mock), o
- Pedir anulación a agencia 2924 (952 560 161) si se creó por error.

## Flujo desde el admin

1. Pedido pagado en Supabase (`payment_status: paid` o `order_status: Paid`).
2. Admin → Pedidos → **Generar etiqueta Nacex**.
3. Se guarda `tracking_number`, `carrier: NACEX`, estado `Shipped` y se envía email al cliente.

## Estado (10 Jul 2026)

Integración **operativa en producción**. Verificado: conexión, puntos Shop, expedición y etiqueta PNG.

Expedición de prueba generada en validación: `488361849` — anular con agencia si procede.

## Notas

- Servicios, embalajes y extras (prealerta, seguro…) → agencia Nacex 2924.
- Seguimiento cliente: `https://www.nacex.es/seguimientoPedido.do?numExp={tracking}`
