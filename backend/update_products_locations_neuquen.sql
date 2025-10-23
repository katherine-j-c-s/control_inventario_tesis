-- Actualizar ubicaciones de productos con direcciones reales de Neuquén, Argentina
-- Estas ubicaciones son reales y pueden ser encontradas por Google Maps API

-- Producto 1: Almacén Central de Neuquén
UPDATE products 
SET ubicacion = 'Av. Argentina 1400, Neuquén, Neuquén, Argentina'
WHERE id = 1;

-- Producto 2: Zona Industrial de Neuquén
UPDATE products 
SET ubicacion = 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina'
WHERE id = 2;

-- Producto 3: Centro de Neuquén
UPDATE products 
SET ubicacion = 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina'
WHERE id = 3;

-- Producto 4: Zona Norte de Neuquén
UPDATE products 
SET ubicacion = 'Av. del Trabajador 800, Neuquén, Neuquén, Argentina'
WHERE id = 4;

-- Producto 5: Zona Sur de Neuquén
UPDATE products 
SET ubicacion = 'Av. San Martín 2000, Neuquén, Neuquén, Argentina'
WHERE id = 5;

-- Producto 6: Zona Este de Neuquén
UPDATE products 
SET ubicacion = 'Av. Roca 1500, Neuquén, Neuquén, Argentina'
WHERE id = 6;

-- Producto 7: Zona Oeste de Neuquén
UPDATE products 
SET ubicacion = 'Av. Colón 1800, Neuquén, Neuquén, Argentina'
WHERE id = 7;

-- Producto 8: Parque Industrial Neuquén
UPDATE products 
SET ubicacion = 'Ruta 22 Km 12, Neuquén, Neuquén, Argentina'
WHERE id = 8;

-- Producto 9: Zona Comercial de Neuquén
UPDATE products 
SET ubicacion = 'Av. Argentina 800, Neuquén, Neuquén, Argentina'
WHERE id = 9;

-- Producto 10: Zona Residencial de Neuquén
UPDATE products 
SET ubicacion = 'Av. del Trabajador 1200, Neuquén, Neuquén, Argentina'
WHERE id = 10;

-- Verificar las actualizaciones
SELECT id, nombre, codigo, ubicacion 
FROM products 
ORDER BY id;
