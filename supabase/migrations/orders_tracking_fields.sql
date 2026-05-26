-- Seguimiento de envíos (Nacex u otros transportistas)
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists carrier text;
alter table orders add column if not exists shipped_date timestamptz;
