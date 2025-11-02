-- Actualizar ubicaciones de productos con direcciones reales de Neuquén, Argentina
-- Estas ubicaciones son reales y pueden ser encontradas por Google Maps API

-- Actualizar productos con ubicaciones reales de Neuquén
UPDATE products 
SET ubicacion = 'Av. Argentina 1400, Neuquén, Neuquén, Argentina'
WHERE id = 1;

UPDATE products 
SET ubicacion = 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina'
WHERE id = 2;

UPDATE products 
SET ubicacion = 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina'
WHERE id = 3;

UPDATE products 
SET ubicacion = 'Av. del Trabajador 800, Neuquén, Neuquén, Argentina'
WHERE id = 4;

UPDATE products 
SET ubicacion = 'Av. San Martín 2000, Neuquén, Neuquén, Argentina'
WHERE id = 5;

-- Actualizar almacenes con direcciones reales de Neuquén
UPDATE warehouses 
SET address_sector = 'Av. Argentina 1400, Neuquén, Neuquén, Argentina'
WHERE warehouse_id = 1 AND name = 'Almacén Principal';

UPDATE warehouses 
SET address_sector = 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina'
WHERE warehouse_id = 2 AND name = 'Almacén Secundario';

UPDATE warehouses 
SET address_sector = 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina'
WHERE warehouse_id = 3 AND name = 'Depósito Sur';

-- Verificar las actualizaciones
SELECT 'Products' as tabla, id, nombre as item, ubicacion 
FROM products 
ORDER BY id;

SELECT 'Warehouses' as tabla, warehouse_id, name as item, address_sector as ubicacion
FROM warehouses 
ORDER BY warehouse_id;

