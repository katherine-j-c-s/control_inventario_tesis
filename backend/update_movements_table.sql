-- Script para actualizar la tabla movements con los campos adicionales
-- Este script agrega las columnas necesarias para el egreso de productos

-- Conectar a la base de datos
\c controlInventario;

-- Agregar las nuevas columnas a la tabla movements
DO $$ 
BEGIN
    -- Agregar columna 'motivo' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'motivo') THEN
        ALTER TABLE movements ADD COLUMN motivo VARCHAR(255);
    END IF;

    -- Agregar columna 'destinatario' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'destinatario') THEN
        ALTER TABLE movements ADD COLUMN destinatario VARCHAR(255);
    END IF;

    -- Agregar columna 'observaciones' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'observaciones') THEN
        ALTER TABLE movements ADD COLUMN observaciones TEXT;
    END IF;

    -- Agregar columna 'created_at' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'created_at') THEN
        ALTER TABLE movements ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Agregar columna 'updated_at' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'updated_at') THEN
        ALTER TABLE movements ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Cambiar el tipo de la columna 'date' de DATE a TIMESTAMP si es necesario
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'date' AND data_type = 'date') THEN
        ALTER TABLE movements ALTER COLUMN date TYPE TIMESTAMP USING date::timestamp;
    END IF;

END $$;

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'movements' 
ORDER BY ordinal_position;

-- Mostrar mensaje de confirmación
SELECT 'Tabla movements actualizada correctamente' AS resultado;
