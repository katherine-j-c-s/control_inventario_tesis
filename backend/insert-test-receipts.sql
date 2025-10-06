-- Script para insertar datos de prueba en la tabla receipts
-- Ejecutar este script después de crear los stored procedures

-- Insertar datos de prueba
INSERT INTO receipts (warehouse_id, quantity_products, entry_date, verification_status, order_id, product_id, status) VALUES
(1, 100, '2024-01-15 10:30:00', false, 1001, 201, 'pending'),
(2, 50, '2024-01-16 14:20:00', true, 1002, 202, 'verified'),
(1, 75, '2024-01-17 09:15:00', false, 1003, 203, 'pending'),
(3, 200, '2024-01-18 16:45:00', true, 1004, 204, 'verified'),
(2, 30, '2024-01-19 11:30:00', false, 1005, 205, 'pending'),
(1, 150, '2024-01-20 13:20:00', true, 1006, 206, 'verified'),
(3, 80, '2024-01-21 08:45:00', false, 1007, 207, 'pending'),
(2, 120, '2024-01-22 15:10:00', true, 1008, 208, 'verified'),
(1, 90, '2024-01-23 12:00:00', false, 1009, 209, 'pending'),
(3, 60, '2024-01-24 17:30:00', true, 1010, 210, 'verified');

-- Verificar que los datos se insertaron correctamente
SELECT 
    receipt_id,
    warehouse_id,
    quantity_products,
    entry_date,
    verification_status,
    order_id,
    product_id,
    status
FROM receipts
ORDER BY entry_date DESC;

-- Mostrar estadísticas
SELECT * FROM get_receipts_statistics();
