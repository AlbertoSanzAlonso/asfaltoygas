# Tareas pendientes — Asfalto y Gas

## Completado: Integración Nacex Web Service (envíos)

- **Tipo:** tienda a medida vía Web Service WS (`api/nacex.ts`) — no módulo PrestaShop/WooCommerce.
- **Agencia:** 2924 (Benalmádena) · **Abonado:** 00485 · **Usuario WS:** `ASFALTOYGASATCLIENTE@GMAIL.COM`
- **Usuario test Nacex:** `ASFALTOYGASATCLIENTE@GMAIL._T` (usar solo para pruebas; no genera recogidas reales).
- **Documentación:** `api/NACEX_README.md` · credenciales sin secretos en `src/constants/nacex.ts` · clave MD5 en `.env` / Vercel (`NACEX_PASSWORD`).

### Verificado en producción (10 Jul 2026)

| Prueba | Resultado |
|--------|-----------|
| `test_connection` | `mode: real` |
| Puntos Nacex Shop (`get_puntos_shop&cp=29631`) | 10 puntos (parser corregido: separador `\|`) |
| Crear expedición (`putExpedicion`) | Tracking `488361849`, albarán `2924/10501771` |
| Etiqueta PNG (`get_etiqueta`) | OK |

### Flujo operativo

1. Cliente paga (Redsys) → pedido `paid` / `Paid`.
2. Admin → Pedidos → **Generar etiqueta Nacex** (`AdminDashboard` → `api.shipping.createNacexExpedition`).
3. API guarda tracking en `orders`, envía email al cliente con enlace de seguimiento.
4. Checkout: opción **Punto Nacex Shop** carga puntos reales por CP (`NacexPointSelector`).

### Acción manual pendiente (una vez)

- **Anular expedición de prueba** `488361849` con agencia 2924 (952 560 161) si aún no se hizo — se creó al validar la API; no hay paquete real.

### Notas para agentes

- **No llamar `crear_envio` en producción** salvo pedido real o petición explícita del usuario.
- Pedidos con `isTest`, `TEST` en ID o `payment_method` test → modo mock (sin Nacex real).
- Servicios/embalajes/extras se configuran con la agencia Nacex.

---


- URL: `https://www.elmotorista.es/shop-motos/casco-moto/categoria-cascos-moto/familia-cascos-jet.cascos-integrales.cascos-modulares`
- **565 cascos** actualizados:
  - 344 **Integral** (subcategory_id=61)
  - 127 **Jet** (subcategory_id=59)
  - 94 **Modular** (subcategory_id=60)
- **559 descripciones** reemplazadas (las originales eran "Comprar... en el Motorista")
- **565 imágenes** en alta resolución subidas a Storage:
  - `products/cascos/{integral|jet|modular}/{marca}/{slug}.webp`
- **76 cascos eliminados** de la BD por no pertenecer a Jet/Integral/Modular
- Subcategorías corregidas donde estaban mal asignadas

---

## Completado: Importar productos de Mantenimiento desde El Motorista

- URL scrapeada: `https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-lubricantes-anticongelantes.hidraulicos.lubricantes-aditivos`
- **24 productos** importados en la categoría **Mantenimiento** (ID=4):
  - 15 en **Aditivos** (subcategory_id=77)
  - 8 en **Líquido de freno** (subcategory_id=78)
  - 1 en **Anticongelantes** (subcategory_id=79)
- Precios con **+20%** sobre el PVP de El Motorista.
- Imágenes descargadas (interceptando responses de CloudFront o vía screenshot cuando fue necesario), convertidas a `.webp` y subidas a Supabase Storage con rutas SEO-friendly:
  - `products/mantenimiento/aditivos/{marca}/{slug}.webp`
  - `products/mantenimiento/liquido-de-freno/{marca}/{slug}.webp`
  - `products/mantenimiento/anticongelantes/{marca}/{slug}.webp`
- Descripciones capturadas de la ficha de producto y guardadas en `products.description`.

### Cambios en taxonomía

- Se separó la subcategoría "Anticongelantes y líquido de embrague" en dos:
  - `79` → **Anticongelantes**
  - `86` → **Líquido de embrague**
- Se actualizó `.agents/skills/asfaltoygas-categorias/SKILL.md` con los IDs reales y el mapeo de slugs de El Motorista.

---

## Pendiente: Subir 31 imágenes de lubricantes a Supabase Storage

### Contexto
- Se importaron **143 productos** de lubricantes desde el proveedor [elmotorista.es](https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-moto-4-tiempos.moto-2-tiempos.transmisiones)
- **112 productos** tienen imágenes en Supabase Storage (bucket `products`) con carpetas SEO-friendly
- **31 productos** usan hotlinks a `estaticos.elmotorista.es` porque el CDN (CloudFront) bloqueó descargas automáticas tras ~150 requests

### Las 31 imágenes faltantes

Estas imágenes están en Storage con **placeholder vacíos** (se eliminaron) y en la base de datos apuntan a URLs externas:

1. Motorex Aceite Scooter 4t 5w/40 1l
2. Motul Aceite 300v Factory Line 15w50 4L
3. Motul Aceite 7100 10w60 4t 1l
4. Motul Aceite 7100 10w30 4t 1l
5. Motul Aceite Multi Atf 1l
6. Motul Aceite 7100 20w50 4t 1l
7. Repsol Aceite Smarter Commuter 0w30 60l
8. Motul Aceite 5100 10w50 4t 1l
9. Motul Aceite 7100 10w60 4t 4l
10. Motorex Aceite Scooter Forza 4t 0w/30 1l
11. Motul Aceite Scooter Power 2t 1l
12. Motul Aceite 7100 20w50 4t 4l
13. Motul Aceite Transoil Expert 10w40 1l
14. Motul Aceite 5100 10w30 4t 1l
15. Motul Aceite 7100 10w40 4t 1l
16. Motul Aceite 5100 15w50 4t 1l
17. Motul Aceite Scooter Expert 2t 1l
18. Motul Aceite Transoil 10w30 1l
19. Motul Aceite 5000 10w40 4t 1l
20. Motul Aceite 7100 5w40 4t 1l
21. Motul Aceite 7100 5w40 4t 4l
22. Motul Aceite 510 2t 1l
23. Motul Aceite Scooter Power 4t 5w40 Ma 1l
24. Motul Aceite 7100 15w50 4t 4l
25. Motul Aceite Scooter Power 4t 10w30 Mb 1l
26. Motul Aceite Scooter Expert 4t 10w40 Ma 1l
27. Motul Aceite 5100 10w30 4t 4l
28. Motul Aceite 5100 10w40 4t 1l
29. Motul Aceite 5100 10w40 4t 4l
30. Motul Aceite 7100 10w50 4t 1l
31. Motorex Aceite Cambio Gear Oil Hypoid 80w90 1l

### Cómo completar la tarea

#### Opción A: Descargar manualmente y subir (más rápido)

1. Acceder al panel de Supabase Storage → bucket `products`
2. Para cada producto, buscar la URL en `product_images` o abrir el producto en elmotorista.es
3. Descargar la imagen desde el navegador (botón derecho → Guardar imagen)
4. Subir a la carpeta correspondiente en Storage:
   - `aceites-y-lubricantes/motores-4t/{marca}/nombre-seo.webp`
   - `aceites-y-lubricantes/motores-2t/{marca}/nombre-seo.webp`
   - `aceites-y-lubricantes/aceite-de-transmision/{marca}/nombre-seo.webp`
5. Actualizar la URL en la base de datos (tablas `products` y `product_images`)

#### Opción B: Script con Playwright (recomendado)

Usar el mismo enfoque que para Mantenimiento: interceptar responses de imágenes en la página de producto de El Motorista o hacer screenshot del `<img>` principal cuando CloudFront bloquee. Ver scripts de referencia en `/tmp/opencode/import_lubricantes_aditivos.js`.

#### Opción C: Esperar y reintentar con script

El bloqueo de CloudFront suele levantarse en 1-2 horas. Después se puede ejecutar el script:

```bash
# Ubicación del script
/tmp/opencode/download_and_upload_wget.py
```

O generar uno nuevo con las URLs actualizadas.

### Estructura actual en Storage

```
products/
├── aceites-y-lubricantes/
│   ├── motores-4t/
│   │   ├── repsol/          (20 imágenes)
│   │   ├── motul/           (26 imágenes - 16 faltan)
│   │   ├── motorex/         (42 imágenes - 2 faltan)
│   │   ├── castrol/          (8 imágenes)
│   │   └── brp-bombardier-atv/ (2 imágenes)
│   ├── motores-2t/
│   │   ├── repsol/           (5 imágenes)
│   │   ├── motul/            (4 imágenes - 6 faltan)
│   │   ├── motorex/          (2 imágenes)
│   │   └── castrol/          (2 imágenes)
│   └── aceite-de-transmision/
│       └── repsol/           (2 imágenes)
```

### Nombres SEO-friendly

Los archivos usan slugs limpios:
- `aceite-repsol-moto-racing-4t-15w50-1l.webp`
- `motul-7100-10w50-4t-4l.webp`
- `motorex-cross-power-4t-10w60-1l.webp`

### Estado de la base de datos

```sql
-- 112 productos con Storage
-- 31 productos con hotlinks externas
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE images->>0 LIKE '%supabase.co%') as storage,
       COUNT(*) FILTER (WHERE images->>0 LIKE '%elmotorista.es%') as external
FROM products WHERE category_id = 3;
```

### Archivos generados (para referencia)

| Archivo | Ubicación |
|---------|-----------|
| Datos de productos | `/tmp/opencode/lubricantes_products.json` |
| URLs de Storage | `/tmp/opencode/upload_results_v2.json` |
| SQL de importación | `supabase/migrations/018_import_lubricantes_elmotorista.sql` |
| SQL de actualización Storage | `/tmp/opencode/update_112_storage.sql` |
| SQL de restauración URLs | `/tmp/opencode/restore_31_urls.sql` |

---

*Creado: 14 Jun 2026*
*Última actualización: 10 Jul 2026*

---

## Completado: Re-scraping de cascos — descripciones e imágenes en alta

### Contexto
- Se ejecutó refresco desde:
  - `https://www.elmotorista.es/shop-motos/maletas-equipaje/categoria-maleta-equipaje-moto`
- Resultado del refresco:
  - **Actualizados:** 305
  - **No encontrados en BD:** 11 (se dejaron sin tocar, por decisión)
  - **Fallidos:** 1 (bloqueo de imagen por 403)
- Descripciones de Equipaje:
  - **303/303** productos con descripción estructurada (`INFORMACION DEL PRODUCTO` + características)

### Qué revisar en próxima sesión
1. Auditar productos de Equipaje que aún se vean con imagen de baja resolución en frontend.
2. Identificar cuáles están limitados por CDN del proveedor (403) y decidir fuente alternativa.
3. Reintentar sustitución de imágenes en alta solo para esos casos pendientes.

### Notas técnicas
- Se añadió mejora al downloader para priorizar resoluciones altas (`_1080`, `_800`, `_640`, etc.).
- En algunos artículos el proveedor devuelve 403 incluso con referer/user-agent, por lo que puede requerir alternativa manual o nueva fuente.

### Estado actualizado (28 Jun 2026)
- Refresco ejecutado sobre:
  - `https://www.elmotorista.es/shop-motos/maletas-equipaje/categoria-maleta-equipaje-moto`
- Última ejecución:
  - **Actualizados:** 305
  - **No encontrados en BD:** 11 (se dejaron sin tocar)
  - **Fallidos:** 1
- Descripciones en Equipaje:
  - Total productos: 303
  - Con descripción estructurada/no vacía: 303
  - Descripciones tipo `Comprar ...`: 0
  - Aún con plantilla genérica (`INFORMACION DEL PRODUCTO`): ~207 (pendiente de mejorar con texto real cuando el proveedor no expone bloque largo)

### Pendiente próxima sesión (prioridad alta)
1. Reducir descripciones en plantilla de Equipaje:
   - Intentar extraer más campos del payload proveedor (`shortDescription`, `meta_dsp`, bloques alternativos) antes de usar plantilla.
2. Auditoría de imágenes de Equipaje con baja resolución real en frontend:
   - Listar productos afectados y rehacer imagen principal caso por caso.
3. Resolver casos bloqueados por CDN/proveedor (403):
   - Definir fuente alternativa o flujo manual para esos productos.
