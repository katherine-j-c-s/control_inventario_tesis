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

-- Conectar a la base de datos recién creada
\c controlInventario;

-- Crear extensiones útiles si no existen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Almacenes

CREATE TABLE warehouses (
  warehouse_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address_sector VARCHAR(150),
  user_id INTEGER,
  capacity INTEGER
);



-- Proyectos

CREATE TABLE projects (
  project_id SERIAL PRIMARY KEY,
  admin_id INTEGER,
  name VARCHAR(100),
  description TEXT,
  ubicacion VARCHAR(255),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'pausado', 'cancelado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Productos

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
  peso INTEGER,
  stock INTEGER,
  name VARCHAR(100),
  description TEXT,
  height INTEGER,
  volume INTEGER,
  qr TEXT,
  location VARCHAR(100),
  warehouse_id INTEGER REFERENCES warehouses(warehouse_id)
);

-- Órdenes
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  supplier VARCHAR(100),
  status BOOLEAN DEFAULT FALSE,
  project_id INTEGER REFERENCES projects(project_id)
);
-- // actualizas orders 
ALTER TABLE orders
ADD COLUMN issue_date DATE,
ADD COLUMN delivery_date DATE,
ADD COLUMN amount DECIMAL(10,2),
ADD COLUMN total DECIMAL(10,2),
ADD COLUMN responsible_person VARCHAR(100),
ADD COLUMN delivery_status VARCHAR(50),
ADD COLUMN contact VARCHAR(100),
ADD COLUMN item_quantity INT,
ADD COLUMN company_name VARCHAR(150),
ADD COLUMN company_address VARCHAR(200),
ADD COLUMN notes TEXT;

-- //eliminas date en orders
ALTER TABLE orders DROP COLUMN date;

-- // actualizas las ordenes existentes 
UPDATE orders
SET
  supplier = 'Carlos Isla',
  status = false,
  project_id = 1,
  issue_date = '2025-10-20',
  delivery_date = '2025-10-24',
  amount = 100000,
  total = 120000,
  responsible_person = 'Gustavo Mercado',
  delivery_status = 'Pending',
  contact = '2995965326',
  item_quantity = 10,
  company_name = 'Simetra S.R.L',
  company_address = 'Contador Rodriguez Mza 532',
  notes = 'Notas del envío QCY'
WHERE order_id = 1;


UPDATE orders
SET
  supplier = 'María López',
  status = true,
  project_id = 1,
  issue_date = '2025-10-22',
  delivery_date = '2025-10-26',
  amount = 75000,
  total = 90000,
  responsible_person = 'Gustavo Mercado',
  delivery_status = 'Delivered',
  contact = '2995123456',
  item_quantity = 7,
  company_name = 'Simetra S.R.L',
  company_address = 'Av. San Martín 1245',
  notes = 'Entrega realizada sin inconvenientes'
WHERE order_id = 2;

UPDATE orders
SET
  supplier = 'Juan Pérez',
  status = false,
  project_id = 1,
  issue_date = '2025-10-25',
  delivery_date = '2025-10-30',
  amount = 50000,
  total = 60000,
  responsible_person = 'Gustavo Mercado',
  delivery_status = 'Pending',
  contact = '2995987654',
  item_quantity = 5,
  company_name = ' Simetra S.R.L',
  company_address = 'Calle Falsa 742',
  notes = 'Pendiente de envío'
WHERE order_id = 3;








-- Detalles de órdenes
CREATE TABLE order_details (
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (order_id, product_id)
);


-- Código QR
CREATE TABLE qr_codes (
  sku_id SERIAL PRIMARY KEY,
  qr_image TEXT,
  creation_date DATE DEFAULT CURRENT_DATE,
  update_date DATE,
  product_id INTEGER REFERENCES products(id)
);

-- Remitos
CREATE TABLE receipts (
  receipt_id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
  quantity_products INTEGER,
  entry_date DATE DEFAULT CURRENT_DATE,
  verification_status BOOLEAN DEFAULT FALSE,
  order_id INTEGER REFERENCES orders(order_id),
  product_id INTEGER REFERENCES products(id),
  status TEXT
);

-- Movimientos
CREATE TABLE movements (
  movement_id SERIAL PRIMARY KEY,
  movement_type VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE,
  quantity INTEGER,
  product_id INTEGER REFERENCES products(id),
  status TEXT,
  user_id INTEGER
);

-- Detalles de remitos
CREATE TABLE receipt_products (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL
);



-- Datos de prueba 

-- Insertar almacenes de prueba
INSERT INTO warehouses (warehouse_id, name, address_sector, user_id, capacity)
VALUES
(1, 'Almacén Principal', 'Sede Central', 1, 1000),
(2, 'Almacén Secundario', 'Sede Norte', 1, 500),
(3, 'Depósito Sur', 'Sede Sur', 1, 750);

Insert into projects (project_id ,admin_id , name , description)
VALUES
(1 ,2 , 'Armado de Pozo', 'armamos el entorno de maquinarias del pozo ' )



INSERT INTO orders (order_id, date, supplier, status, project_id)
VALUES
(1, '2025-09-25', 'Proveedor A', FALSE, 1),
(2, '2025-09-28', 'Proveedor B', TRUE,  1),
(3, '2025-10-01', 'Proveedor C', FALSE, 1);


INSERT INTO receipts (warehouse_id, entry_date, verification_status, order_id, status)
VALUES
(1, '2025-10-01', FALSE, 1,  'Pending'),
(2,   '2025-10-02', FALSE, 2,  'Pending'),
(1, '2025-10-03', TRUE,  3,  'Verified'),





INSERT INTO products (
  id,nombre, codigo, categoria, descripcion, unidad_medida, 
  precio_unitario, stock_minimo, stock_actual, ubicacion, 
  qr_code, activo, created_at, updated_at
)
VALUES
(1 ,'Tornillo de acero 6mm', 'TOR-001', 'Ferretería', 'Tornillo galvanizado de 6mm x 50mm', 'unidad', 50.00, 100, 350, 'Estante A1', 'QR001', true, NOW(), NOW()),
(2,'Pintura Latex Blanca 4L', 'PIN-004', 'Pinturas', 'Pintura blanca para interiores 4L', 'litro', 3200.00, 10, 25, 'Estante B2', 'QR002', true, NOW(), NOW()),
(3 , 'Cemento Portland 50kg', 'CEM-050', 'Construcción', 'Bolsa de cemento Portland 50kg', 'bolsa', 4500.00, 5, 40, 'Depósito 1', 'QR003', true, NOW(), NOW()),
(4,'Cable eléctrico 2mm', 'CAB-002', 'Electricidad', 'Cable cobre 2mm - rollo 50m', 'rollo', 3800.00, 8, 15, 'Estante C3', 'QR004', true, NOW(), NOW()),
(5,'Ladrillo hueco 18x18x33', 'LAD-018', 'Construcción', 'Ladrillo cerámico hueco 18x18x33 cm', 'unidad', 300.00, 500, 2500, 'Depósito 2', 'QR005', true, NOW(), NOW());




INSERT INTO receipt_products (id,receipt_id, product_id,quantity)
Values
(4,41,2,50),
(5,41,3,200),
(6,42,1,100),
(7,42,4,20),
(8,43,1,50),
(9,43,5,20);



-- Funciones para remitos


-- 1) Traer los remitos NO verificados
CREATE OR REPLACE FUNCTION get_unverified_receipts()
RETURNS TABLE(
  receipt_id integer,
  warehouse_id integer,
  quantity_products integer,
  entry_date date,
  verification_status boolean,
  order_id integer,
  product_id integer,
  status text
)
LANGUAGE sql
AS $$
  SELECT receipt_id, warehouse_id, quantity_products, entry_date,
         verification_status, order_id, product_id, status
  FROM receipts
  WHERE verification_status IS DISTINCT FROM TRUE;  -- incluye NULL o FALSE
$$;


-- 2) Traer TODOS los remitos
CREATE OR REPLACE FUNCTION get_all_receipts()
RETURNS TABLE(
  receipt_id integer,
  warehouse_id integer,
  quantity_products integer,
  entry_date date,
  verification_status boolean,
  order_id integer,
  product_id integer,
  status text
)
LANGUAGE sql
AS $$
  SELECT receipt_id, warehouse_id, quantity_products, entry_date,
         verification_status, order_id, product_id, status
  FROM receipts
  ORDER BY entry_date DESC, receipt_id;
$$;


-- 3) Verificar un remito (marca verification_status = TRUE) y retorna la fila actualizada
CREATE OR REPLACE FUNCTION verify_receipt(p_receipt_id integer)
RETURNS TABLE(
  receipt_id integer,
  warehouse_id integer,
  quantity_products integer,
  entry_date date,
  verification_status boolean,
  order_id integer,
  product_id integer,
  status text
)
LANGUAGE sql
AS $$
  UPDATE receipts
  SET verification_status = TRUE
  WHERE receipt_id = p_receipt_id
  RETURNING receipt_id, warehouse_id, quantity_products, entry_date,
            verification_status, order_id, product_id, status;
$$;


-- Verificar funciones
-- Todos los no verificados
SELECT * FROM get_unverified_receipts();

-- Todos los remitos
SELECT * FROM get_all_receipts();

-- Verificar el remito id = 42 y ver la fila actualizada
SELECT * FROM verify_receipt(42);



-- Tabla principal de pedidos de obra
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id),
    descripcion TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL REFERENCES users(id),
    estado VARCHAR(20) DEFAULT 'pendiente' 
           CHECK (estado IN ('pendiente','aprobado','rechazado'))
);

-- Tabla de productos del pedido
CREATE TABLE work_order_items (
    id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(id),
    nombre_producto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad INT NOT NULL,
    estado_item VARCHAR(20) DEFAULT 'pendiente' 
                CHECK (estado_item IN ('pendiente','entregado'))
);




-- // actualizas movements creamos la columna ubicacion_actual y estanteria_actual
ALTER TABLE movements
ADD COLUMN ubicacion_actual VARCHAR(255);


ALTER TABLE movements
ADD COLUMN estanteria_actual VARCHAR(255);

-- insertamos datos en la columna ubicacion_actual y estanteria_actual
UPDATE movements
SET 
  ubicacion_actual = CASE product_id
    WHEN 1 THEN 'Depósito Central'
    WHEN 2 THEN 'Obra 101'
    WHEN 3 THEN 'Obra  102'
    WHEN 4 THEN 'Depósito Norte'
    WHEN 5 THEN 'Obra  103'
  END,
  estanteria_actual = CASE product_id
    WHEN 1 THEN 'A1'
    WHEN 2 THEN 'A5'
    WHEN 3 THEN 'B2'
    WHEN 4 THEN 'B3'
    WHEN 5 THEN 'C1'
  END
WHERE product_id BETWEEN 1 AND 5;


ALTER TABLE projects
ADD COLUMN ubicacion VARCHAR(255);

-- insertamos datos en la columna ubicacion

UPDATE projects
SET ubicacion = 'Parque Industrial Simetra S.R.L'
WHERE project_id = 1;

-- Insertar pedidos de obra de prueba
INSERT INTO work_orders (project_id, descripcion, fecha_solicitud, usuario_id, estado)
VALUES 
(1, 'Solicitud de materiales para la obra 105 - mantenimiento de válvulas', NOW(), 2, 'Pendiente'),
(2, 'Pedido de repuestos para bombas en la obra 204 - Comodoro Rivadavia', NOW(), 2, 'Aprobado'),
(3, 'Requerimiento de EPP y herramientas para la obra 310 - Planta de tratamiento', NOW(), 3, 'En proceso'),
(4, 'Compra de cañerías y válvulas de alta presión para obra 105', NOW(), 3, 'Pendiente'),
(5, 'Solicitud de materiales eléctricos - obra 450', NOW(), 2, 'Completado');


-- Insertar items de prueba
INSERT INTO work_order_items (work_order_id, nombre_producto, descripcion, cantidad, estado_item)
VALUES
(1, 'Casco de seguridad', 'Casco de protección industrial para personal de planta', 20, 'Pendiente'),
(2, 'Guantes resistentes al aceite', 'Guantes de seguridad para manipulación de maquinaria y productos químicos', 50, 'Pendiente'),
(3, 'Bomba de combustible portátil', 'Bomba para trasiego de combustible y lubricantes', 5, 'Pendiente'),
(4, 'Tubería de acero', 'Tubería para transporte de crudo y gas', 100, 'Pendiente'),
(5, 'Válvula de seguridad', 'Válvula de control de presión para equipos de perforación', 30, 'Pendiente');






-- Script para corregir la estructura de la tabla products
-- Este script actualiza la tabla products para que coincida con la estructura esperada

-- Primero verificamos si las columnas existen y las agregamos si es necesario
DO $$ 
BEGIN
    -- Agregar columna 'nombre' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nombre') THEN
        ALTER TABLE products ADD COLUMN nombre VARCHAR(100);
        -- Copiar datos de 'name' a 'nombre' si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name') THEN
            UPDATE products SET nombre = name WHERE nombre IS NULL;
        END IF;
    END IF;

    -- Agregar columna 'codigo' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'codigo') THEN
        ALTER TABLE products ADD COLUMN codigo VARCHAR(50);
        UPDATE products SET codigo = 'PROD-' || id WHERE codigo IS NULL;
    END IF;

    -- Agregar columna 'categoria' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'categoria') THEN
        ALTER TABLE products ADD COLUMN categoria VARCHAR(100) DEFAULT 'General';
    END IF;

    -- Agregar columna 'descripcion' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'descripcion') THEN
        ALTER TABLE products ADD COLUMN descripcion TEXT;
        -- Copiar datos de 'description' a 'descripcion' si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
            UPDATE products SET descripcion = description WHERE descripcion IS NULL;
        END IF;
    END IF;

    -- Agregar columna 'unidad_medida' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unidad_medida') THEN
        ALTER TABLE products ADD COLUMN unidad_medida VARCHAR(50) DEFAULT 'unidad';
    END IF;

    -- Agregar columna 'precio_unitario' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'precio_unitario') THEN
        ALTER TABLE products ADD COLUMN precio_unitario DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- Agregar columna 'stock_minimo' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_minimo') THEN
        ALTER TABLE products ADD COLUMN stock_minimo INTEGER DEFAULT 0;
    END IF;

    -- Agregar columna 'stock_actual' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_actual') THEN
        ALTER TABLE products ADD COLUMN stock_actual INTEGER DEFAULT 0;
        -- Copiar datos de 'stock' a 'stock_actual' si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
            UPDATE products SET stock_actual = stock WHERE stock_actual = 0;
        END IF;
    END IF;

    -- Agregar columna 'ubicacion' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ubicacion') THEN
        ALTER TABLE products ADD COLUMN ubicacion VARCHAR(255);
        -- Copiar datos de 'location' a 'ubicacion' si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'location') THEN
            UPDATE products SET ubicacion = location WHERE ubicacion IS NULL;
        END IF;
    END IF;

    -- Agregar columna 'activo' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'activo') THEN
        ALTER TABLE products ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;

    -- Agregar columna 'created_at' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Agregar columna 'updated_at' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Agregar columna 'qr_code' si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'qr_code') THEN
        ALTER TABLE products ADD COLUMN qr_code TEXT;
        -- Copiar datos de 'qr' a 'qr_code' si existe
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'qr') THEN
            UPDATE products SET qr_code = qr WHERE qr_code IS NULL;
        END IF;
    END IF;

END $$;

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Mostrar algunos registros de ejemplo
SELECT id, nombre, codigo, categoria, descripcion, stock_actual, ubicacion, activo 
FROM products 
LIMIT 5;
