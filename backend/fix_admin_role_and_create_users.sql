-- Query para corregir el rol del usuario admin y crear usuario de almacén
-- Ejecutar estos queries en pgAdmin4 o en la consola de PostgreSQL

-- 1. Corregir el rol del usuario admin
UPDATE users 
SET rol = 'admin' 
WHERE dni = '00000000' OR email = 'admin@sistema.com';

-- 2. Verificar que el rol se corrigió
SELECT id, nombre, apellido, dni, email, rol FROM users 
WHERE dni = '00000000' OR email = 'admin@sistema.com';

-- 3. Crear usuario de almacén
-- Primero verificar si ya existe
SELECT id, nombre, apellido, dni, email, rol FROM users 
WHERE dni = '96050823';

-- Si no existe, crear el usuario de almacén
INSERT INTO users (
    nombre, 
    apellido, 
    dni, 
    email, 
    puesto_laboral, 
    edad, 
    genero, 
    password, 
    rol, 
    permisos, 
    activo, 
    created_at, 
    updated_at
) VALUES (
    'Usuario',
    'Almacén',
    '96050823',
    'almacen@sistema.com',
    'Operario de Almacén',
    25,
    'No especificado',
    '$2a$10$3xc8hV9jTZJic8Dai6q6VuTYwaHGjJJ9xfiYIAPNKDBEsS0t2bNjK', -- Contraseña: 12345678
    'almacen',
    '{"entrega": false, "movimiento": false, "egreso": false}',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- 4. Verificar que el usuario de almacén se creó correctamente
SELECT id, nombre, apellido, dni, email, rol FROM users 
WHERE dni = '96050823';

-- 5. Mostrar todos los usuarios para verificar
SELECT id, nombre, apellido, dni, email, rol, activo FROM users 
ORDER BY id;
