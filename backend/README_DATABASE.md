# Configuración de Base de Datos - Control de Inventario

## 📋 Pasos para configurar la base de datos PostgreSQL

### 1. Crear la base de datos en pgAdmin4

1. **Abrir pgAdmin4** y conectarte a tu servidor PostgreSQL
2. **Hacer clic derecho** en "Databases" → "Create" → "Database..."
3. **Configurar la base de datos:**
   - **Name:** `controlInventario`
   - **Owner:** `postgres` (o tu usuario preferido)
   - **Encoding:** `UTF8`
   - **Collation:** `Spanish_Spain.1252` (opcional)
   - **Character type:** `Spanish_Spain.1252` (opcional)

**Alternativamente**, puedes ejecutar el script SQL:
```sql
-- Ejecutar en pgAdmin4 Query Tool
CREATE DATABASE controlInventario
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```

### 2. Configurar variables de entorno

1. **Crear archivo `.env`** en la carpeta `backend/`:
```bash
# Configuración del servidor
PORT=5001

# Configuración de JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui_cambiar_en_produccion

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password_de_postgres
DB_NAME=controlInventario

# Configuración de CORS (opcional)
CORS_ORIGIN=http://localhost:3000
```

2. **Reemplazar los valores** con tu configuración real:
   - `DB_PASSWORD`: Tu contraseña de PostgreSQL
   - `JWT_SECRET`: Un secreto seguro para JWT (cambiar en producción)

### 3. Verificar la conexión

Ejecutar el script de prueba:
```bash
cd backend
node test-connection.js
```

**Si la conexión es exitosa**, verás:
```
✅ ¡Conexión exitosa a la base de datos!
📊 Información de la base de datos:
   - Base de datos actual: controlInventario
   - Versión de PostgreSQL: 15.x
```

### 4. Iniciar el servidor

```bash
cd backend
npm run dev
```

El servidor creará automáticamente las tablas necesarias y un usuario administrador por defecto.

## 🔧 Solución de problemas

### Error: "database 'controlInventario' does not exist"
- **Solución:** Crear la base de datos usando pgAdmin4 o el script SQL

### Error: "ECONNREFUSED"
- **Solución:** Verificar que PostgreSQL esté ejecutándose
- **Comando:** `sudo service postgresql start` (Linux) o iniciar desde servicios (Windows)

### Error: "password authentication failed"
- **Solución:** Verificar usuario y contraseña en el archivo `.env`

### Error: "relation does not exist"
- **Solución:** El servidor creará las tablas automáticamente en el primer inicio

## 📊 Estructura de la base de datos

El sistema creará automáticamente las siguientes tablas:
- `users` - Usuarios del sistema
- `products` - Productos del inventario
- `roles` - Roles y permisos
- `user_roles` - Relación usuarios-roles

## 👤 Usuario administrador por defecto

Al iniciar por primera vez, se crea un usuario administrador:
- **DNI:** 00000000
- **Contraseña:** admin123
- **Email:** admin@sistema.com

**⚠️ IMPORTANTE:** Cambiar la contraseña después del primer inicio.
