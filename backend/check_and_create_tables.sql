-- Verificar si las tablas existen y crearlas si no
-- Tabla users
CREATE TABLE IF NOT EXISTS users (
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

-- Tabla roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE,
    descripcion TEXT,
    permisos JSON,
    es_sistema BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles por defecto si no existen
INSERT INTO roles (nombre, descripcion, permisos, es_sistema) 
VALUES 
('admin', 'Administrador del sistema con todos los permisos', 
 '{"entrega": true, "movimiento": true, "egreso": true, "admin_usuarios": true, "admin_roles": true, "admin_sistema": true}', 
 true),
('usuario', 'Usuario básico del sistema', 
 '{"entrega": false, "movimiento": false, "egreso": false}', 
 true)
ON CONFLICT (nombre) DO NOTHING;

-- Verificar que las tablas existen
SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'roles' as tabla, COUNT(*) as registros FROM roles;
