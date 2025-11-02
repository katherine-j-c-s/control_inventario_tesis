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

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE,
    descripcion TEXT,
    permisos JSON,
    es_sistema BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    dni VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    puesto_laboral VARCHAR(100),
    edad INTEGER,
    genero VARCHAR(20),
    foto VARCHAR(255),
    password VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'usuario',
    permisos JSON DEFAULT '{"entrega": false, "movimiento": false, "egreso": false}',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion, permisos, es_sistema) VALUES
('admin', 'Administrador del sistema con todos los permisos', 
 '{"entrega": true, "movimiento": true, "egreso": true, "admin_usuarios": true, "admin_roles": true, "admin_sistema": true}', 
 true),
('usuario', 'Usuario básico del sistema', 
 '{"entrega": false, "movimiento": false, "egreso": false}', 
 true);

-- Crear usuario administrador con contraseña "admin123" (hashed)
INSERT INTO users (nombre, apellido, dni, email, puesto_laboral, edad, genero, password, rol, permisos) VALUES
('Administrador', 'Sistema', '00000000', 'admin@sistema.com', 'Administrador del Sistema', 30, 'No especificado', 
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 
 '{"entrega": true, "movimiento": true, "egreso": true}');


-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para roles
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- Detalles de remitos
CREATE TABLE receipt_products (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL
);

-- Movimientos
CREATE TABLE movements (
  movement_id SERIAL PRIMARY KEY,
  movement_type VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE,
  quantity INTEGER,
  product_id INTEGER REFERENCES products(id),
  status TEXT,
  user_id INTEGER,
  ubicacion_actual VARCHAR(255),
  estanteria_actual VARCHAR(255)
);

-- QR Codes
CREATE TABLE qr_codes (
  sku_id SERIAL PRIMARY KEY,
  qr_image TEXT,
  creation_date DATE DEFAULT CURRENT_DATE,
  update_date DATE,
  product_id INTEGER REFERENCES products(id)
);

-- Pedidos de obra
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(project_id),
    descripcion TEXT,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL REFERENCES users(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado'))
);

-- Productos de pedidos de obra
CREATE TABLE work_order_items (
    id SERIAL PRIMARY KEY,
    work_order_id INT NOT NULL REFERENCES work_orders(id),
    nombre_producto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    cantidad INT NOT NULL,
    estado_item VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_item IN ('pendiente','entregado'))
);

-- Almacenes
INSERT INTO warehouses (warehouse_id, name, address_sector, user_id, capacity)
VALUES
(1, 'Almacén Principal', 'Sede Central', 1, 1000),
(2, 'Almacén Secundario', 'Sede Norte', 1, 500),
(3, 'Depósito Sur', 'Sede Sur', 1, 750);

-- Proyectos
INSERT INTO projects (project_id, admin_id, name, description, ubicacion,estado, created_at, updated_at)
VALUES
(1, 2, 'Armado de Pozo', 'armamos el entorno de maquinarias del pozo', 'Parque Industrial Simetra S.R.L','activo', NOW(), NOW());

-- Productos
INSERT INTO products (id, peso, stock, name, description, height , volume, qr, location, warehouse_id)
VALUES
(1,10,10,'Tornillo de acero 6mm','Tornillo galvanizado de 6mm x 50mm', 100, 350, 'QR001', 'Estante A1', 1),
(2,1,10,'Pintura Latex Blanca 4L', 'Pintura blanca para interiores 4L', 10, 25, 'QR002', 'Estante B2', 2),
(3,10,10,'Cemento Portland 50kg', 'Bolsa de cemento Portland 50kg', 5, 40, 'QR003', 'Depósito 1',1),
(4,10,10,'Cable eléctrico 2mm','Cable cobre 2mm - rollo 50m', 8, 15, 'QR004', 'Estante C3', 3),
(5,1,10,'Ladrillo hueco 18x18x33','Ladrillo cerámico hueco 18x18x33 cm', 500, 2500, 'QR005','Depósito 2', 2);

-- Órdenes
INSERT INTO orders (order_id, supplier, status, project_id)
VALUES
(1, 'Carlos Isla', FALSE, 1),
(2, 'María López', TRUE, 1),
(3, 'Juan Pérez', FALSE, 1);

-- Remitos
INSERT INTO receipts (receipt_id, warehouse_id, quantity_products, entry_date, verification_status, order_id, product_id, status)
VALUES
(1, 1, 10, NOW(), FALSE, 1, 2, 'Pending'),
(2, 2, 10,  NOW(), FALSE, 2, 4, 'Pending'),
(3, 1, 10,  NOW(), TRUE, 3, 1, 'Verified');

-- Detalles de remitos
INSERT INTO receipt_products (id, receipt_id, product_id, quantity)
VALUES
(1,1,2,50),
(2,2,3,200),
(3,2,1,100),
(4,3,4,20),
(5,3,1,50),
(6,1,5,20);

-- Remitos no verificados
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
  WHERE verification_status IS DISTINCT FROM TRUE;
$$;

-- Todos los remitos
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

-- Verificar remito
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


-- Actualizar datos de ejemplo para productos 1-5
UPDATE movements
SET 
  ubicacion_actual = CASE product_id
    WHEN 1 THEN 'Depósito Central'
    WHEN 2 THEN 'Obra 101'
    WHEN 3 THEN 'Obra 102'
    WHEN 4 THEN 'Depósito Norte'
    WHEN 5 THEN 'Obra 103'
  END,
  estanteria_actual = CASE product_id
    WHEN 1 THEN 'A1'
    WHEN 2 THEN 'A5'
    WHEN 3 THEN 'B2'
    WHEN 4 THEN 'B3'
    WHEN 5 THEN 'C1'
  END
WHERE product_id BETWEEN 1 AND 5;


INSERT INTO work_orders (project_id, descripcion, fecha_solicitud, usuario_id, estado)
VALUES 
(1, 'Solicitud de materiales para la obra 105 - mantenimiento de válvulas', NOW(), 1, 'pendiente'),
(1, 'Pedido de repuestos para bombas en la obra 204 - Comodoro Rivadavia', NOW(), 1, 'aprobado'),
(1, 'Requerimiento de EPP y herramientas para la obra 310 - Planta de tratamiento', NOW(), 1, 'pendiente'),
(1, 'Compra de cañerías y válvulas de alta presión para obra 105', NOW(), 1, 'pendiente'),
(1, 'Solicitud de materiales eléctricos - obra 450', NOW(), 1, 'pendiente');

INSERT INTO work_order_items (work_order_id, nombre_producto, descripcion, cantidad, estado_item)
VALUES
(1, 'Casco de seguridad', 'Casco de protección industrial para personal de planta', 20, 'pendiente'),
(2, 'Guantes resistentes al aceite', 'Guantes de seguridad para manipulación de maquinaria y productos químicos', 50, 'pendiente'),
(3, 'Bomba de combustible portátil', 'Bomba para trasiego de combustible y lubricantes', 5, 'pendiente'),
(4, 'Tubería de acero', 'Tubería para transporte de crudo y gas', 100, 'pendiente'),
(5, 'Válvula de seguridad', 'Válvula de control de presión para equipos de perforación', 30, 'pendiente');

DO $$ 
BEGIN
    -- nombre
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nombre') THEN
        ALTER TABLE products ADD COLUMN nombre VARCHAR(100);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name') THEN
            UPDATE products SET nombre = name WHERE nombre IS NULL;
        END IF;
    END IF;

    -- codigo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'codigo') THEN
        ALTER TABLE products ADD COLUMN codigo VARCHAR(50);
        UPDATE products SET codigo = 'PROD-' || id WHERE codigo IS NULL;
    END IF;

    -- categoria
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'categoria') THEN
        ALTER TABLE products ADD COLUMN categoria VARCHAR(100) DEFAULT 'General';
    END IF;

    -- descripcion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'descripcion') THEN
        ALTER TABLE products ADD COLUMN descripcion TEXT;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description') THEN
            UPDATE products SET descripcion = description WHERE descripcion IS NULL;
        END IF;
    END IF;

    -- unidad_medida
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unidad_medida') THEN
        ALTER TABLE products ADD COLUMN unidad_medida VARCHAR(50) DEFAULT 'unidad';
    END IF;

    -- precio_unitario
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'precio_unitario') THEN
        ALTER TABLE products ADD COLUMN precio_unitario DECIMAL(10,2) DEFAULT 0;
    END IF;

    -- stock_minimo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_minimo') THEN
        ALTER TABLE products ADD COLUMN stock_minimo INTEGER DEFAULT 0;
    END IF;

    -- stock_actual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_actual') THEN
        ALTER TABLE products ADD COLUMN stock_actual INTEGER DEFAULT 0;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock') THEN
            UPDATE products SET stock_actual = stock WHERE stock_actual = 0;
        END IF;
    END IF;

    -- ubicacion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ubicacion') THEN
        ALTER TABLE products ADD COLUMN ubicacion VARCHAR(255);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'location') THEN
            UPDATE products SET ubicacion = location WHERE ubicacion IS NULL;
        END IF;
    END IF;

    -- activo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'activo') THEN
        ALTER TABLE products ADD COLUMN activo BOOLEAN DEFAULT true;
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- qr_code
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'qr_code') THEN
        ALTER TABLE products ADD COLUMN qr_code TEXT;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'qr') THEN
            UPDATE products SET qr_code = qr WHERE qr_code IS NULL;
        END IF;
    END IF;
END $$;
