-- Imágenes por color (galería cambia al seleccionar color en ficha)
alter table product_images
  add column if not exists color_id integer references colors(id) on delete set null;

create index if not exists idx_product_images_color on product_images(product_id, color_id);
