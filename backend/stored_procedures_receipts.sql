-- Stored Procedures para el módulo de Remitos
-- Ejecutar estos scripts en la base de datos controlInventario

-- 1. Función para obtener todos los remitos
CREATE OR REPLACE FUNCTION get_all_receipts()
RETURNS TABLE (
    receipt_id INTEGER,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP,
    verification_status BOOLEAN,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.receipt_id,
        r.warehouse_id,
        r.quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        r.product_id,
        r.status
    FROM receipts r
    WHERE r.status != 'deleted'
    ORDER BY r.entry_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para obtener remitos no verificados
CREATE OR REPLACE FUNCTION get_unverified_receipts()
RETURNS TABLE (
    receipt_id INTEGER,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP,
    verification_status BOOLEAN,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.receipt_id,
        r.warehouse_id,
        r.quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        r.product_id,
        r.status
    FROM receipts r
    WHERE r.verification_status = false 
    AND r.status != 'deleted'
    ORDER BY r.entry_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 3. Función para obtener remitos verificados
CREATE OR REPLACE FUNCTION get_verified_receipts()
RETURNS TABLE (
    receipt_id INTEGER,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP,
    verification_status BOOLEAN,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.receipt_id,
        r.warehouse_id,
        r.quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        r.product_id,
        r.status
    FROM receipts r
    WHERE r.verification_status = true 
    AND r.status != 'deleted'
    ORDER BY r.entry_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para verificar un remito
CREATE OR REPLACE FUNCTION verify_receipt(receipt_id_param INTEGER)
RETURNS TABLE (
    receipt_id INTEGER,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP,
    verification_status BOOLEAN,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
) AS $$
BEGIN
    -- Actualizar el estado de verificación
    UPDATE receipts 
    SET verification_status = true,
        status = 'verified'
    WHERE receipt_id = receipt_id_param;
    
    -- Retornar el remito actualizado
    RETURN QUERY
    SELECT 
        r.receipt_id,
        r.warehouse_id,
        r.quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        r.product_id,
        r.status
    FROM receipts r
    WHERE r.receipt_id = receipt_id_param;
END;
$$ LANGUAGE plpgsql;

-- 5. Función para obtener remitos por estado
CREATE OR REPLACE FUNCTION get_receipts_by_status(status_param VARCHAR(255))
RETURNS TABLE (
    receipt_id INTEGER,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP,
    verification_status BOOLEAN,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.receipt_id,
        r.warehouse_id,
        r.quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        r.product_id,
        r.status
    FROM receipts r
    WHERE r.status = status_param
    ORDER BY r.entry_date DESC;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para obtener estadísticas de remitos
CREATE OR REPLACE FUNCTION get_receipts_statistics()
RETURNS TABLE (
    total_receipts BIGINT,
    verified_receipts BIGINT,
    unverified_receipts BIGINT,
    pending_receipts BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_receipts,
        COUNT(CASE WHEN verification_status = true THEN 1 END) as verified_receipts,
        COUNT(CASE WHEN verification_status = false THEN 1 END) as unverified_receipts,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_receipts
    FROM receipts
    WHERE status != 'deleted';
END;
$$ LANGUAGE plpgsql;
