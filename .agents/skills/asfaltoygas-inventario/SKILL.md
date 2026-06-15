---
name: asfaltoygas-inventario
description: >-
  Inventario y variantes de producto en Asfalto y Gas (stock por variante,
  admin ProductInventory, Supabase product_variants). Usar al editar stock,
  colores, admin de piezas, carrito, checkout, pedidos o stock en tienda.
---

# Inventario — Asfalto y Gas

## Fuente de verdad

- **Stock:** tabla `product_variants` → `size`, `color_id` (FK nullable), `stock`, `variant_id`.
- **`color_id` null:** solo talla; en tienda **no** hay selector de color.
- **`color_id` con valor:** variante de color; selector visible si el producto tiene alguna variante con color.
- **Colores en ficha web:** tabla `product_colors` (derivada al guardar desde variantes con `color_id`).
- **Helpers:** `src/lib/productVariants.ts` (reutilizar, no duplicar).

## Admin (`ProductInventory.tsx`)

- UI agrupada **por talla**, listas **plegadas por defecto**.
- Sin colores: un campo de stock por talla (`color_id` null).
- Con colores: tabla Color | Unidades; añadir con desplegable del catálogo.
- Al añadir el primer color a una talla, se elimina la fila `color_id` null y el stock pasa a la nueva línea.
- Formulario: `useProductForm.ts` → `consolidateVariantsForSave()` + `deriveProductColors()`.

## Tienda y carrito

- Buscar variante: `findVariant(variants, size, { colorId })` o sin `colorId` si solo talla.
- Mostrar colores: `hasColorVariants(variants)` o `product.colors.length > 0`.
- Carrito: clave por `getCartItemKey()` (`variant_id` o `color_id`).
- Pedidos: `order_items` guardan `color` como **texto** (snapshot), no FK.

## Categorías y variantes

- Cascos: variantes por talla (XS–XXL) y, opcionalmente, color.
- Equipaje y accesorios: generalmente sin talla, solo stock unitario (`color_id` null, talla única).
- Aceites y lubricantes: sin talla, stock unitario.
- Ver skill `asfaltoygas-categorias` para la taxonomía completa.

## Al cambiar inventario

1. Admin: `ProductInventory` + `useProductForm` + `productVariants.ts` + `products.ts` API.
2. No mezclar filas `color_id` null y con color en la misma talla al guardar (`consolidateVariantsForSave`).
3. Validar duplicados talla + `color_id` antes de guardar.

## Imágenes de producto

- **Bucket**: `products` en Supabase Storage
- **Estructura**: `products/{categoria}/{subcategoria}/{marca}/{nombre-seo}.webp`
- **Ejemplo**: `products/aceites-y-lubricantes/motores-4t/repsol/aceite-repsol-moto-racing-4t-15w50-1l.webp`
- **Categoría**: `aceites-y-lubricantes` (ID 3 en DB)
- **Subcategorías**: `motores-4t`, `motores-2t`, `aceite-de-transmision`
- **Tamaño**: `_320.webp` es el tamaño recomendado (balance entre calidad y peso)
- **Pendiente**: 31 imágenes de lubricantes usan hotlinks a `elmotorista.es` (ver TASKS.md). El resto (112) están en Storage.

## Archivos clave

| Área | Archivo |
|------|---------|
| Helpers | `src/lib/productVariants.ts` |
| Admin UI | `src/features/admin/ProductModal/ProductInventory.tsx` |
| Form | `src/features/admin/ProductModal/useProductForm.ts` |
| API | `src/lib/api/products.ts`, `src/lib/api/colors.ts` |
| Tienda | `src/features/shop/ProductPage.tsx` |
| Carrito | `src/store/useCartStore.ts` |
| Checkout | `src/features/shop/hooks/useCheckoutForm.ts` |