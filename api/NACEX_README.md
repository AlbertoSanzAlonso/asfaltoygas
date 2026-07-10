# Integración NACEX - Guía rápida

## Configuración

- Credenciales de referencia en `src/constants/nacex.ts` (sin contraseña).
- La clave MD5 va en `NACEX_PASSWORD` (Vercel / `.env` local, **no commitear**).
- Documentación oficial: https://pda.nacex.com/nacex_ws

## Variables de entorno (Vercel)

| Variable | Valor |
|----------|-------|
| `NACEX_USER` | `ASFALTOYGASATCLIENTE@GMAIL.COM` |
| `NACEX_PASSWORD` | Clave MD5 de Nacex |
| `NACEX_AGENCIA` | `2924` |
| `NACEX_CLIENTE` | `00485` |
| `NACEX_CP_RECOGIDA` | CP de recogida tienda |
| `NACEX_NOMBRE_RECOGIDA` | Nombre remitente |
| `NACEX_DIR_RECOGIDA` | Dirección recogida |
| `NACEX_POBLACION_RECOGIDA` | Población recogida |
| `NACEX_TEL_RECOGIDA` | Teléfono recogida |

Usuario de pruebas (opcional): `ASFALTOYGASATCLIENTE@GMAIL._T`

## Endpoints (`api/nacex.ts`)

- `GET /api/nacex?method=test_connection` — comprueba credenciales
- `GET /api/nacex?method=get_puntos_shop&cp=29631` — puntos Nacex Shop
- `POST /api/nacex?method=crear_envio` — crea expedición (`putExpedicion`)
- `GET /api/nacex?method=get_etiqueta&codExp=XXXX` — etiqueta PNG
- `GET /api/nacex?method=estado_envio&tracking=XXXX` — estado

Sin `NACEX_PASSWORD` válida, los endpoints devuelven datos mock.

## Notas

- Servicios, embalajes y extras (prealerta, seguro…) se configuran con la agencia 2924.
- Tras cambiar variables en Vercel, redeploy obligatorio.
