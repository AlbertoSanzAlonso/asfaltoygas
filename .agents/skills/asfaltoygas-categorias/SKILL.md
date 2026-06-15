---
name: asfaltoygas-categorias
description: >-
  Taxonomía de categorías y subcategorías de productos de Asfalto y Gas.
  Usar como referencia al crear, editar o clasificar productos, filtros,
  navegación o menús de la tienda.
---

# Categorías y subcategorías — Asfalto y Gas

## Cascos (category_id = 1)

| subcategory_id | Subcategoría |
|----------------|--------------|
| — | Jet |
| — | Modular |
| — | Integral |

## Equipaje (category_id = 2)

| subcategory_id | Subcategoría |
|----------------|--------------|
| — | Alforjas |
| — | Bolsas sobredepósito |
| — | Maletas laterales |
| — | Maletas superiores |
| — | Fijaciones |
| — | Accesorios y recambios maletas |

## Aceites y lubricantes (category_id = 3)

| subcategory_id | Subcategoría |
|----------------|--------------|
| 68 | Aceites y lubricantes (general) |
| 69 | Aceite de motor |
| 70 | Motores 2T |
| 71 | Motores 4T |
| 72 | Aceite de horquilla |
| 73 | Aceite de transmisión |
| 74 | Aceite amortiguadores |
| 75 | Aceite de filtro de aire |
| 76 | Otros lubricantes |

## Mantenimiento (category_id = 4)

| subcategory_id | Subcategoría | Slug El Motorista |
|----------------|--------------|-------------------|
| 77 | Aditivos | `lubricantes-aditivos` |
| 78 | Líquido de freno | `hidraulicos` |
| 79 | Anticongelantes | `lubricantes-anticongelantes` |
| 86 | Líquido de embrague | *(pendiente de slug proveedor)* |

### Mapeo de slugs de El Motorista a Mantenimiento

Cuando se importen productos desde `https://www.elmotorista.es/shop-motos/lubricante-moto/categoria-...`:

- `lubricantes-aditivos` → **Aditivos**
- `hidraulicos` → **Líquido de freno**
- `lubricantes-anticongelantes` → **Anticongelantes**
- `lubricantes-de-embrague` / `liquido-de-embrague` → **Líquido de embrague**

## Merchandising

*(Sin subcategorías)*

## Equipación

| # | Subcategoría |
|---|--------------|
| 1 | Chaqueta hombre |
| 2 | Chaqueta mujer |
| 3 | Pantalón hombre |
| 4 | Pantalón mujer |
| 5 | Guantes |
| 6 | Botas |

---

### Notas

- **"Aceites y lubricantes"** funciona como categoría padre; la subcategoría homónima
  agrupa productos que no encajan en las subcategorías específicas.
- **"Accesorios y recambios maletas"** incluye herrajes, cierres, bases y recambios
  para alforjas y maletas.
- **"Mantenimiento"** puede ampliarse en el futuro con subcategorías como
  filtros, herramientas, limpieza, etc.