-- Script para crear la base de datos controlInventario en PostgreSQL
-- Ejecutar este script en pgAdmin4 o desde la línea de comandos

-- Crear la base de datos
CREATE DATABASE controlInventario
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Comentario sobre la base de datos
COMMENT ON DATABASE controlInventario IS 'Base de datos para el sistema de control de inventario de productos petroleros';

-- Conectar a la base de datos recién creada
\c controlInventario;

-- Crear extensiones útiles si no existen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Verificar que la base de datos se creó correctamente
SELECT current_database();
