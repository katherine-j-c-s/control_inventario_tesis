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

-- correr en la base de datos controlInventario para eliminar y resetear el esquema public
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;


-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE,
    descripcion TEXT,
    permisos JSON,
    activo BOOLEAN DEFAULT true,
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

-- Insertar roles por defecto
INSERT INTO roles (nombre, descripcion, permisos, activo, es_sistema) VALUES
('admin', 'Administrador del sistema con todos los permisos', '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": true,"generateReports": false,"maps": false,"workOrder": true}', true, true),
('usuario', 'Usuario básico del sistema', '{"dashboard": true,"inventory": true,"purchaseOrders": false,"verifyRemito": false,"productEntry": false,"productExit": false,"generateQR": true,"scanQR": true,"projects": false,"adminUsers": false,"generateReports": false,"maps": false,"workOrder": false}', true, true),
('almacen', 'Encargado del almacen', '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": false,"generateReports": false,"maps": false,"workOrder": true}', true, true),
('Lider de Proyecto', 'Lider de algun proyecto', '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": false,"generateReports": false,"maps": false,"workOrder": false}', true, true);

-- Crear usuarios
INSERT INTO users (nombre, apellido, dni, email, puesto_laboral, edad, genero, password, rol, permisos) VALUES
-- Contraseña: admin123
('Administrador', 'Sistema', '00000000', 'admin@sistema.com', 'Administrador del Sistema', 30, 'No especificado', 
 '$2b$10$7pU5GqLkWhUseWJp5aDkYOdaLJPsaI6yAARwppcD5v6h3WJ6S8aJS', 'admin', 
 '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": true,"generateReports": false,"weather": false,"maps": false,"workOrder": true}'),
-- Contraseña: admin123
('Gabriela', 'Contreras', '96050822', 'user@sistema.com', 'Usuario comun', 22, 'Femenino', 
 '$2b$10$7pU5GqLkWhUseWJp5aDkYOdaLJPsaI6yAARwppcD5v6h3WJ6S8aJS', 'usuario', 
 '{"dashboard": true,"inventory": true,"purchaseOrders": false,"verifyRemito": false,"productEntry": false,"productExit": false,"generateQR": true,"scanQR": true,"projects": false,"adminUsers": false,"generateReports": false,"weather": false,"maps": false,"workOrder": false}'),
 -- Contraseña: admin123
('Katherine', 'Contreras', '96050823', 'Almacen@sistema.com', 'almacen', 21, 'Femenino', 
 '$2b$10$7pU5GqLkWhUseWJp5aDkYOdaLJPsaI6yAARwppcD5v6h3WJ6S8aJS', 'almacen', 
 '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": false,"generateReports": false,"weather": false,"maps": false,"workOrder": true}'),
-- Contraseña: admin123
('Javier', 'Contreras', '96019711', 'liderProyecto@sistema.com', 'Lider de Proyecto', 56, 'Masculino', 
 '$2b$10$7pU5GqLkWhUseWJp5aDkYOdaLJPsaI6yAARwppcD5v6h3WJ6S8aJS', 'Lider de Proyecto', 
 '{"dashboard": true,"inventory": true,"purchaseOrders": true,"verifyRemito": true,"productEntry": true,"productExit": true,"generateQR": true,"scanQR": true,"projects": true,"adminUsers": false,"generateReports": false,"weather": false,"maps": false,"workOrder": false}');

-- Almacenes
CREATE TABLE warehouses (
  warehouse_id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  latitude DECIMAL(19,8),
  longitude DECIMAL(11,8),
  address TEXT,
  capacity INTEGER
);

INSERT INTO warehouses (user_id, name, location, latitude, longitude, address, capacity)
VALUES
-- Coordenadas de Neuquén Capital, Argentina
-- Av. Argentina 1400 (aproximada en centro de Neuquén)
(1, 'Almacén Principal', 'Sede Central', -38.9516, -68.0591, 'Av. Argentina 1400, Neuquén, Neuquén, Argentina', 1000),
-- Ruta 7 Km 8 (hacia el norte de Neuquén, aproximadamente)
(2, 'Almacén Secundario', 'Sede Norte', -38.9300, -68.0500, 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina', 500),
-- Av. Olascoaga 1200 (zona sur/centro de Neuquén, aproximadamente)
(3, 'Depósito Sur', 'Depósito de Sur', -38.9650, -68.0650, 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina', 750);


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

INSERT INTO projects (admin_id, name, description, ubicacion,estado, created_at, updated_at)
VALUES
(2, 'Armado de Pozo', 'armamos el entorno de maquinarias del pozo', 'Parque Industrial Simetra S.R.L','activo', NOW(), NOW());


-- Productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(100),
    categoria VARCHAR(100),
    descripcion TEXT,
    unidad_medida VARCHAR(50) DEFAULT 'unidad',
    precio_unitario DECIMAL(10,2) DEFAULT 0,
    stock_minimo INT DEFAULT 0,
    stock_actual INT DEFAULT 0,
    ubicacion VARCHAR(100),
    qr_code TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (nombre, codigo, categoria, descripcion, unidad_medida, precio_unitario, stock_minimo, stock_actual, ubicacion, qr_code, activo, created_at, updated_at)
VALUES
('Tornillo de acero 6mm', 'TOR-001', 'Ferretería', 'Tornillo galvanizado de 6mm x 50mm', 'unidad', 50.00, 100, 350, 'Av. Argentina 1400, Neuquén, Neuquén, Argentina', 'QR001', true, NOW(), NOW()),
('Pintura Latex Blanca 4L', 'PIN-004', 'Pinturas', 'Pintura blanca para interiores 4L', 'litro', 3200.00, 10, 25, 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina', 'QR002', true, NOW(), NOW()),
('Cemento Portland 50kg', 'CEM-050', 'Construcción', 'Bolsa de cemento Portland 50kg', 'bolsa', 4500.00, 5, 40, 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina', 'QR003', true, NOW(), NOW()),
('Cable eléctrico 2mm', 'CAB-002', 'Electricidad', 'Cable cobre 2mm - rollo 50m', 'rollo', 3800.00, 8, 15, 'Av. del Trabajador 800, Neuquén, Neuquén, Argentina', 'QR004', true, NOW(), NOW()),
('Ladrillo hueco 18x18x33', 'LAD-018', 'Construcción', 'Ladrillo cerámico hueco 18x18x33 cm', 'unidad', 300.00, 500, 2500, 'Av. San Martín 2000, Neuquén, Neuquén, Argentina', 'QR005', true, NOW(), NOW());


-- Órdenes
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    supplier VARCHAR(100) NOT NULL,
    status BOOLEAN DEFAULT FALSE,
    project_id INTEGER REFERENCES projects(project_id),
    issue_date DATE,
    delivery_date DATE,
    amount DECIMAL(10,2),
    total DECIMAL(10,2),
    responsible_person VARCHAR(100),
    delivery_status VARCHAR(50),
    contact VARCHAR(100),
    item_quantity INT,
    company_name VARCHAR(150),
    company_address VARCHAR(200),
    notes TEXT
);

INSERT INTO orders (supplier, status, project_id, issue_date, delivery_date,amount, total, responsible_person, delivery_status, contact,item_quantity, company_name, company_address, notes)
VALUES
('Carlos Isla', FALSE, 1, '2025-10-20', '2025-10-24', 100000, 120000, 'Katherine Contreras', 'Pending', '2995965326', 10, 'Simetra S.R.L', 'Simetra Service S.A Neuquen', 'Notas del envío QCY'),
('María López', TRUE, 1, '2025-10-22', '2025-10-26', 75000, 90000, 'Katherine Contreras', 'Delivered', '2995123456', 7, 'Simetra S.R.L', 'Simetra Service S.A Neuquen', 'Entrega realizada sin inconvenientes'),
('Juan Pérez', FALSE, 1, '2025-10-25', '2025-10-30', 50000, 60000, 'Katherine Contreras', 'Pending', '2995987654', 5, 'Simetra S.R.L', 'Simetra Service S.A Neuquen', 'Pendiente de envío');


-- Detalles de órdenes
CREATE TABLE order_details (
  id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id, product_id)
);

INSERT INTO order_details (id, product_id, quantity, unit_price, total)
VALUES
(1, 2, 50, 3200.00, 160000.00),
(1, 3, 100, 4500.00, 450000.00),
(2, 1, 200, 50.00, 10000.00),
(2, 4, 15, 3800.00, 57000.00),
(3, 5, 500, 300.00, 150000.00);


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

INSERT INTO receipts ( warehouse_id, quantity_products, entry_date, verification_status, order_id, product_id, status)
VALUES
(3, 10, NOW(), FALSE, 1, 2, 'Pending'),
(2, 10,  NOW(), FALSE, 2, 4, 'Pending'),
(1, 10,  NOW(), TRUE, 3, 1, 'Verified');


-- Detalles de remitos
CREATE TABLE receipt_products (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES receipts(receipt_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL
);

INSERT INTO receipt_products (receipt_id, product_id, quantity)
VALUES
(1,2,50),
(2,3,200),
(2,1,100),
(3,4,20),
(3,1,50),
(1,5,20);


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

-- Remitos verificados
CREATE OR REPLACE FUNCTION get_verified_receipts()
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
  SELECT r.receipt_id, r.warehouse_id, r.quantity_products, r.entry_date,
         r.verification_status, r.order_id, r.product_id, r.status
  FROM receipts r
  WHERE r.verification_status = TRUE
  ORDER BY r.entry_date DESC;
$$;

-- Remitos por estado
CREATE OR REPLACE FUNCTION get_receipts_by_status(p_status text)
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
  SELECT r.receipt_id, r.warehouse_id, r.quantity_products, r.entry_date,
         r.verification_status, r.order_id, r.product_id, r.status
  FROM receipts r
  WHERE r.status = p_status
  ORDER BY r.entry_date DESC;
$$;

-- Estadísticas de remitos
CREATE OR REPLACE FUNCTION get_receipts_statistics()
RETURNS TABLE(
  total_receipts integer,
  verified_receipts integer,
  unverified_receipts integer,
  pending_receipts integer
)
LANGUAGE sql
AS $$
  SELECT 
    COUNT(*)::integer AS total_receipts,
    COUNT(CASE WHEN verification_status = TRUE THEN 1 END)::integer AS verified_receipts,
    COUNT(CASE WHEN verification_status = FALSE THEN 1 END)::integer AS unverified_receipts,
    COUNT(CASE WHEN status = 'Pending' THEN 1 END)::integer AS pending_receipts
  FROM receipts
  WHERE status IS DISTINCT FROM 'deleted';
$$;



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


INSERT INTO movements (movement_type, date, quantity, product_id, status, user_id, ubicacion_actual, estanteria_actual)
VALUES
-- Movimientos de entrada
('entrada', '2025-11-01', 50, 1, 'completado', 1, 'Almacén Principal', 'A1'),
('entrada', '2025-11-02', 100, 2, 'completado', 1, 'Almacén Principal', 'B2'),
('entrada', '2025-11-03', 25, 3, 'completado', 1, 'Depósito Sur', 'C3'),

-- Movimientos de egreso
('egreso', '2025-11-04', 20, 1, 'completado', 1, 'Almacén Secundario', 'A5'),
('egreso', '2025-11-05', 30, 2, 'completado', 1, 'Almacén Secundario', 'B4'),
('egreso', '2025-11-06', 10, 3, 'completado', 2, 'Depósito Sur', 'C2'),

-- Movimientos de transferencia
('transferencia', '2025-11-07', 15, 4, 'completado', 1, 'Almacén Secundario', 'D1'),
('transferencia', '2025-11-08', 20, 5, 'completado', 1, 'Almacén Principal', 'E2'),

-- Movimientos de ajuste
('ajuste', '2025-11-09', 5, 1, 'completado', 1, 'Almacén Principal', 'A1'),
('ajuste', '2025-11-10', -3, 2, 'completado', 1, 'Almacén Principal', 'B2'),

-- Más movimientos recientes para tener variedad
('entrada', '2025-11-11', 75, 1, 'completado', 1, 'Almacén Principal', 'A2'),
('egreso', '2025-11-12', 40, 2, 'completado', 1, 'Almacén Secundario', 'A6'),
('transferencia', '2025-11-13', 25, 3, 'completado', 2, 'Almacén Secundario', 'D3'),
('entrada', '2025-11-14', 60, 4, 'completado', 1, 'Depósito Sur', 'E1'),
('egreso', '2025-11-15', 35, 5, 'completado', 1, 'Almacén Secundario', 'B5'),

-- Movimientos de hoy y días anteriores cercanos
('entrada', CURRENT_DATE, 30, 1, 'completado', 1, 'Almacén Principal', 'A3'),
('egreso', CURRENT_DATE, 15, 2, 'completado', 1, 'Depósito Sur', 'C4'),
('transferencia', CURRENT_DATE - INTERVAL '1 day', 20, 3, 'completado', 2, 'Almacén Principal', 'B3'),
('entrada', CURRENT_DATE - INTERVAL '2 days', 45, 4, 'completado', 1, 'Depósito Sur', 'C5'),
('ajuste', CURRENT_DATE - INTERVAL '3 days', 2, 5, 'completado', 1, 'Almacén Principal', 'A4');


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


-- ============================================================================
-- RESETEAR SECUENCIAS PARA AUTOINCREMENT (MEDIDA DE SEGURIDAD)
-- ============================================================================
-- Como ahora los INSERTs no especifican IDs explícitos, las secuencias deberían
-- estar sincronizadas automáticamente. Este bloque es una medida de seguridad
-- adicional por si acaso se modifican los INSERTs en el futuro para incluir IDs.
-- ============================================================================

-- Resetear secuencia de roles
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM roles), 0) + 1, false);

-- Resetear secuencia de users
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);

-- Resetear secuencia de warehouses
SELECT setval('warehouses_warehouse_id_seq', COALESCE((SELECT MAX(warehouse_id) FROM warehouses), 0) + 1, false);

-- Resetear secuencia de projects
SELECT setval('projects_project_id_seq', COALESCE((SELECT MAX(project_id) FROM projects), 0) + 1, false);

-- Resetear secuencia de products
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 0) + 1, false);

-- Resetear secuencia de orders
SELECT setval('orders_order_id_seq', COALESCE((SELECT MAX(order_id) FROM orders), 0) + 1, false);

-- Resetear secuencia de receipts
SELECT setval('receipts_receipt_id_seq', COALESCE((SELECT MAX(receipt_id) FROM receipts), 0) + 1, false);

-- Resetear secuencia de receipt_products
SELECT setval('receipt_products_id_seq', COALESCE((SELECT MAX(id) FROM receipt_products), 0) + 1, false);

-- Resetear secuencia de movements
SELECT setval('movements_movement_id_seq', COALESCE((SELECT MAX(movement_id) FROM movements), 0) + 1, false);

-- Resetear secuencia de qr_codes
SELECT setval('qr_codes_sku_id_seq', COALESCE((SELECT MAX(sku_id) FROM qr_codes), 0) + 1, false);

-- Resetear secuencia de work_orders
SELECT setval('work_orders_id_seq', COALESCE((SELECT MAX(id) FROM work_orders), 0) + 1, false);

-- Resetear secuencia de work_order_items
SELECT setval('work_order_items_id_seq', COALESCE((SELECT MAX(id) FROM work_order_items), 0) + 1, false);

-- //Actualizar coordenadas de warehouses
UPDATE warehouses
SET 
    latitud = -38.9108072,
    longitud = -68.0762809
WHERE warehouse_id = 1;

UPDATE warehouses
SET 
    latitude = -38.3533503,
    longitude = -68.7738514
WHERE warehouse_id = 2;

UPDATE warehouses
SET 

    latitude = -38.9391457,
    longitude = -68.0150651
WHERE warehouse_id = 3;

-- //Actualizar address de warehouses

  UPDATE warehouses
  SET address = 'Cdor. Rodriguez 1020 M32 Lota 14 PIN Este, Neuquén, Argentina, Q8300 Neuquén'
  WHERE warehouse_id = 1;

  UPDATE warehouses
  SET address = 'Q8305 Añelo, Neuquén'
  WHERE warehouse_id = 2;

  UPDATE warehouses
  SET address = 'Rogelio Segovia 1150, R8324 Cipolletti, Río Negro'
  WHERE warehouse_id = 3;

-- //Actualizar ubicacion de productos
UPDATE products
SET ubicacion = 'Q8305 Añelo, Neuquén'
WHERE ubicacion = 'Av. Argentina 1400, Neuquén, Neuquén, Argentina';

 UPDATE products
SET ubicacion = 'Cdor. Rodriguez 1020 M32 Lota 14 PIN Este, Neuquén, Argentina, Q8300 Neuquén'
WHERE ubicacion = 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina';

UPDATE products
SET ubicacion = 'Rogelio Segovia 1150, R8324 Cipolletti, Río Negro'
WHERE ubicacion = 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina';

-- Acrualizo movimientos
UPDATE movements
SET ubicacion_actual = 'Deposito Sur'
WHERE ubicacion_actual = 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina';

-- //Actualizar tipo de fecha de movimientos , para que salga horrio del movimiento 
ALTER TABLE movements
ALTER COLUMN "date" TYPE TIMESTAMP
USING "date"::timestamp;
