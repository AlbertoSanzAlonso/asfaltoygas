---
name: asfaltoygas
description: >-
  Contexto general del repo Asfalto y Gas: stack, env, estructura, convenciones y SEO.
  Usar para entender la arquitectura, rutas de features, despliegue y configuración del proyecto.
---

# Asfalto y Gas

## Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS v4 + Zustand + TanStack Query + Framer Motion
- **Backend datos:** Supabase (`src/lib/supabase.ts`, `src/lib/api/*`)
- **Deploy:** Vercel (API en `api/`)
- **Pagos:** Redsys (Tarjeta + Bizum); **envío:** Nacex Web Service (`api/nacex.ts`, doc en `api/NACEX_README.md`)
- **Storage:** Supabase Storage (bucket `products` para imágenes de producto)

## Tareas pendientes

Ver [TASKS.md](../../../../TASKS.md) para tareas pendientes y contexto de trabajo incompleto.

## Estructura

- `src/features/shop` — tienda pública
- `src/features/admin` — panel admin (`AdminDashboard`, `ProductModal`)
- `src/features/customer` — área cliente
- `src/features/auth` — login/registro
- Ver `src/features/STRUCTURE.md` para mapa de componentes

## Identidad de marca

- **Nombre:** Asfalto y Gas
- **Tagline:** Equipamiento para motorista
- **Descripción:** Tienda online especializada en cascos de moto, equipación y accesorios.
- **URL:** `https://www.asfaltoygas.es`
- **Email:** `info@asfaltoygas.es`
- **Config:** `src/lib/brand.ts` (fuente de verdad para nombre, teléfono, dirección, redes, categorías, marcas de casco)

## Variables de entorno

- Plantilla: `.env.example` (commitear)
- **No commitear:** `.env`, `.env.preview`, `.env.production`
- Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Redsys: `VITE_REDSYS_SECRET_KEY`, `VITE_REDSYS_COMMERCE_NUMBER`, `VITE_REDSYS_TERMINAL_NUMBER`
- Nacex (Web Service WS, tienda a medida — no módulo PrestaShop/WooCommerce):
  - `NACEX_USER` — producción: `ASFALTOYGASATCLIENTE@GMAIL.COM`
  - `NACEX_USER_TEST` — pruebas: `ASFALTOYGASATCLIENTE@GMAIL._T`
  - `NACEX_PASSWORD` — clave MD5 (solo en `.env` / Vercel, **no commitear**)
  - `NACEX_AGENCIA=2924`, `NACEX_CLIENTE=00485`
  - Recogida tienda: `NACEX_CP_RECOGIDA`, `NACEX_NOMBRE_RECOGIDA`, `NACEX_DIR_RECOGIDA`, `NACEX_POBLACION_RECOGIDA`, `NACEX_TEL_RECOGIDA`
  - Referencia sin secretos: `src/constants/nacex.ts`
  - Manual API: https://pda.nacex.com/nacex_ws
- IA: `VITE_OPENAI_API_KEY`, `VITE_GROQ_API_KEY`

## Convenciones

- Responder al usuario en **español** si no indica otro idioma.
- Commits/PRs: mensajes claros; no incluir secretos en git.
- Inventario productos: leer skill `asfaltoygas-inventario` antes de tocar stock/variantes.
- Categorías: leer skill `asfaltoygas-categorias` para la taxonomía de productos.

## SEO

### Middleware de inyección (`middleware.ts`)
- Intercepta peticiones de crawlers (Googlebot, Bingbot, redes sociales) y sirve HTML con meta tags inyectados vía `api/_injectSeoHtml.ts`.
- Los datos SEO se resuelven desde `api/_seoMeta.ts` (productos: consulta Supabase; categorías/páginas estáticas: diccionario local).
- Para productos no encontrados/no publicados → 404 a crawlers.

### Meta tags dinámicos (SPA)
- `src/components/seo/RouteSeo.tsx` — SEO por ruta para páginas estáticas.
- `src/components/seo/SeoHelmet.tsx` — componente genérico (`react-helmet-async`) usado por páginas de producto y categoría.
- `src/lib/seo/constants.ts` — constantes (`SITE_URL`, `SITE_NAME`, `SITE_LOGO`, `DEFAULT_OG_IMAGE`, helpers).
- Siempre usar `absoluteUrl()` para URLs canónicas; los query params se eliminan al generar la canonical.

### Datos estructurados (JSON-LD)
| Página | Schema | Ubicación |
|--------|--------|-----------|
| Homepage | `Store` (logo, dirección, redes) | `RouteSeo.tsx` |
| Producto | `BreadcrumbList` + `Product` + `Offer` (envío, devolución) | `ProductPage.tsx` |
| Categoría | `BreadcrumbList` | `CategoryPage.tsx` |

### Sitemap
- Generado dinámicamente en `api/sitemap.ts` (páginas estáticas + productos publicados desde Supabase).
- Expuesto en `/sitemap.xml` vía rewrite en `vercel.json`.

### Imágenes y logo
- `public/assets/logo/logo-asfaltoygas-main.png` — usado en datos estructurados (`Store.logo`). Mínimo 500x500, formato PNG.
- `public/og-image.png` — Open Graph (1200x630). Meta tags en `index.html` + `SeoHelmet`.
- **Storage de productos:** Supabase Storage bucket `products` con carpetas SEO-friendly:
  - `products/{categoria}/{subcategoria}/{marca}/{nombre-seo}.webp`
  - Ejemplo: `products/aceites-y-lubricantes/motores-4t/repsol/aceite-repsol-moto-racing-4t-15w50-1l.webp`
  - Ver TASKS.md para imágenes pendientes de subir.
- `index.html` tiene los meta tags estáticos de fallback (OG, Twitter, favicon, canonical, google-site-verification).

### Redirecciones y DNS
- **Canonical siempre con www:** `https://www.asfaltoygas.es`.
- Redirecciones en `vercel.json`: HTTP→HTTPS, apex→www.
- `robots.txt`: bloquea `/admin/`, `/cuenta/`.

### Buenas prácticas SEO
- **Alt de imágenes:** nunca `alt="Logo"` en enlaces de navegación; usar `"Asfalto y Gas"` para evitar que Google lo convierta en sitelink.
- **Canonical:** siempre sin query params.
- **Productos no publicados:** middleware devuelve 404 a crawlers; SPA muestra página con `noindex`.
- **No duplicar:** no incluir URLs con filtros (`?sub=`, `?color=`) en sitemap ni en navegación principal.

## MCP Supabase (opcional)

Para conectar Cursor/opencode a Supabase vía MCP, configurar en `.cursor/mcp.json` el servidor oficial `@supabase/mcp-server-supabase` con PAT en variable de entorno (no commitear token).