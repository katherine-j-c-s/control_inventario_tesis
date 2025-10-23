-- Crear tabla de usuarios
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

-- Crear tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE,
    descripcion TEXT,
    permisos JSON,
    es_sistema BOOLEAN DEFAULT false,
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

-- Crear usuario administrador por defecto
INSERT INTO users (nombre, apellido, dni, email, puesto_laboral, edad, genero, password, rol, permisos) VALUES
('Administrador', 'Sistema', '00000000', 'admin@sistema.com', 'Administrador del Sistema', 30, 'No especificado', 
 '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 
 '{"entrega": true, "movimiento": true, "egreso": true}');

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear trigger para roles
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
