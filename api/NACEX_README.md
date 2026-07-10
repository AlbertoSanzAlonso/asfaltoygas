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
| `GET ?method=debug_config` | Config activa (sin contraseña) |
| `GET ?method=debug_expedition&albaran=2924/10501771` | Datos del envío en Nacex + comprobaciones |

Sin `NACEX_PASSWORD` válida → respuestas **mock** (excepto `debug_config`).

### Parser puntos Shop

Nacex devuelve varios puntos en una sola cadena separada por `|`; cada punto usa campos `~`. Ver `parseNacexShopPoints()` en `api/nacex.ts`.

## Pruebas en producción

```bash
# 1. Config que usa Vercel (abonado, nombre recogida…)
curl -s "https://www.asfaltoygas.es/api/nacex?method=debug_config" | jq .

# 2. Datos reales de un envío en Nacex (sustituir albarán)
curl -s "https://www.asfaltoygas.es/api/nacex?method=debug_expedition&albaran=2924/10501771" | jq .

# 3. Credenciales
curl -s "https://www.asfaltoygas.es/api/nacex?method=test_connection"

# 4. Puntos Shop (debe devolver ~10 para CP 29631)
curl -s "https://www.asfaltoygas.es/api/nacex?method=get_puntos_shop&cp=29631"

# 5. Etiqueta (sustituir codExp)
curl -sI "https://www.asfaltoygas.es/api/nacex?method=get_etiqueta&codExp=488361849"
```

En `debug_expedition`, revisar `coincidencias`:
- `abonadoIgualQueEnv: true` → Vercel y Nacex usan el mismo abonado
- `remitenteContieneSL: false` → el remitente no contiene S.L. / Modas

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

## Nombre incorrecto en etiqueta (S.L. / otra empresa)

El **remitente impreso** en la etiqueta lo toma Nacex de la **ficha del abonado** (`NACEX_CLIENTE`, ej. `00485`), no de las páginas legales de la web. Aunque la API envíe `nom_rec=Asfalto y Gas`, si en Nacex sigue la razón social antigua (p. ej. una S.L. de otro proyecto), la etiqueta saldrá con ese nombre.

**Solución:** pedir a la agencia **2924** (952 560 161) que actualicen la ficha del abonado `00485`:

- Titular: Asfalto y Gas (autónomo / persona física)
- DNI: `77238951Y`
- Quitar cualquier S.L. o CIF ajeno (`B26691014` era Modas Me lo Merezco)
- Confirmar dirección y teléfono de recogida

Usuario WS: `ASFALTOYGASATCLIENTE@GMAIL.COM`
