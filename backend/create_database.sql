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
  description TEXT
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

Insert into projects (project_id ,admin_id , name , description)
VALUES
(1 ,2 , 'Armado de Pozo', 'armamos el entorno de maquinarias del pozo ' )



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