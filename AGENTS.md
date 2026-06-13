# Agentes — Asfalto y Gas

## Skills del proyecto

| Skill | Cuándo usarla |
|-------|----------------|
| [melomerezco](.cursor/skills/melomerezco/SKILL.md) | Contexto general del repo, stack, env, estructura, SEO |
| [melomerezco-inventario](.cursor/skills/melomerezco-inventario/SKILL.md) | Stock, tallas, colores, variantes, admin de piezas, pedidos |
| [supabase](.agents/skills/supabase/SKILL.md) | Supabase (Auth, cliente, migrations, RLS, Storage, Edge Functions, CLI/MCP) |
| [supabase-postgres-best-practices](.agents/skills/supabase-postgres-best-practices/SKILL.md) | Queries, índices, schema, RLS, pooling y rendimiento en Postgres |

## Reglas rápidas

- Inventario: una fila en `product_variants` = talla + color + stock; color por defecto **Neutro**.
- No commitear archivos `.env` con credenciales.
- SEO: el `alt` de imágenes de logo en links no debe ser `"Logo"` (Google lo toma como sitelink). Usar `"Asfalto y Gas"`.
- SEO: la canonical siempre es `https://www.asfaltoygas.es` (con www), sin query params.
- SEO: `public/logo.png` debe ser ≥500x500px (usado en datos estructurados `Store`).
