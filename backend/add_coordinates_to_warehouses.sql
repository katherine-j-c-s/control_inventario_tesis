-- Script para agregar campos de coordenadas a la tabla warehouses
-- Este script agrega latitud y longitud para poder visualizar los almacenes en Google Maps

ALTER TABLE warehouses
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address TEXT;

-- Actualizar almacenes existentes con coordenadas de ejemplo (Argentina)
-- Nota: Estos son valores de ejemplo y deben ser actualizados con las coordenadas reales

UPDATE warehouses
SET 
  latitude = CASE warehouse_id
    WHEN 1 THEN -34.603722  -- Buenos Aires (ejemplo)
    WHEN 2 THEN -34.584722  -- Norte (ejemplo)
    WHEN 3 THEN -34.622722  -- Sur (ejemplo)
    ELSE -34.603722
  END,
  longitude = CASE warehouse_id
    WHEN 1 THEN -58.381592  -- Buenos Aires (ejemplo)
    WHEN 2 THEN -58.404592  -- Norte (ejemplo)
    WHEN 3 THEN -58.458592  -- Sur (ejemplo)
    ELSE -58.381592
  END,
  address = CASE warehouse_id
    WHEN 1 THEN COALESCE(address_sector, 'Sede Central')
    WHEN 2 THEN COALESCE(address_sector, 'Sede Norte')
    WHEN 3 THEN COALESCE(address_sector, 'Sede Sur')
    ELSE COALESCE(address_sector, 'Ubicación desconocida')
  END
WHERE latitude IS NULL OR longitude IS NULL;


