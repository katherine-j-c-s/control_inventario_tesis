# Módulo de Remitos - Stored Procedures

Este módulo implementa la funcionalidad completa de gestión de remitos utilizando stored procedures de PostgreSQL.

## Stored Procedures Creados

### 1. `get_all_receipts()`
- **Descripción**: Obtiene todos los remitos del sistema
- **Retorna**: Lista completa de remitos ordenados por fecha de entrada (más recientes primero)

### 2. `get_unverified_receipts()`
- **Descripción**: Obtiene solo los remitos que no han sido verificados
- **Retorna**: Lista de remitos con `verification_status = false`

### 3. `get_verified_receipts()`
- **Descripción**: Obtiene solo los remitos que han sido verificados
- **Retorna**: Lista de remitos con `verification_status = true`

### 4. `verify_receipt(receipt_id_param INTEGER)`
- **Descripción**: Marca un remito como verificado
- **Parámetros**: `receipt_id_param` - ID del remito a verificar
- **Retorna**: El remito actualizado después de la verificación

### 5. `get_receipts_by_status(status_param VARCHAR(255))`
- **Descripción**: Obtiene remitos filtrados por estado específico
- **Parámetros**: `status_param` - Estado a filtrar (ej: 'pending', 'verified', etc.)
- **Retorna**: Lista de remitos con el estado especificado

### 6. `get_receipts_statistics()`
- **Descripción**: Obtiene estadísticas generales de los remitos
- **Retorna**: Objeto con conteos de total, verificados, no verificados y pendientes

## Instalación

### 1. Ejecutar los Stored Procedures
```sql
-- Ejecutar el archivo stored_procedures_receipts.sql en pgAdmin4
-- o desde la línea de comandos de PostgreSQL
\i backend/stored_procedures_receipts.sql
```

### 2. Verificar la Instalación
```sql
-- Verificar que las funciones se crearon correctamente
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%receipt%';
```

## Endpoints de la API

### GET `/api/receipts`
- Obtiene todos los remitos
- **Respuesta**: Array de objetos remito

### GET `/api/receipts/unverified`
- Obtiene remitos no verificados
- **Respuesta**: Array de objetos remito no verificados

### GET `/api/receipts/verified`
- Obtiene remitos verificados
- **Respuesta**: Array de objetos remito verificados

### GET `/api/receipts/status/:status`
- Obtiene remitos por estado
- **Parámetros**: `status` - Estado a filtrar
- **Respuesta**: Array de objetos remito con el estado especificado

### GET `/api/receipts/statistics`
- Obtiene estadísticas de remitos
- **Respuesta**: Objeto con estadísticas

### PUT `/api/receipts/verify/:id`
- Verifica un remito
- **Parámetros**: `id` - ID del remito a verificar
- **Respuesta**: Remito actualizado

## Estructura de la Tabla Receipts

```sql
CREATE TABLE receipts (
    receipt_id SERIAL PRIMARY KEY,
    warehouse_id INTEGER,
    quantity_products INTEGER,
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status BOOLEAN DEFAULT FALSE,
    order_id INTEGER,
    product_id INTEGER,
    status VARCHAR(255)
);
```

## Uso en el Frontend

El frontend incluye componentes React para interactuar con estos endpoints:

- **ReceiptActions**: Botones para ejecutar diferentes consultas
- **ReceiptsTable**: Tabla para mostrar los resultados
- **ReceiptStatistics**: Componente para mostrar estadísticas

### Ejemplo de Uso
```javascript
import { receiptAPI } from '@/lib/api';

// Obtener todos los remitos
const receipts = await receiptAPI.getAllReceipts();

// Obtener remitos no verificados
const unverified = await receiptAPI.getUnverifiedReceipts();

// Verificar un remito
await receiptAPI.verifyReceipt(receiptId);
```

## Notas Importantes

1. **Seguridad**: Los stored procedures incluyen validaciones básicas, pero se recomienda agregar autenticación y autorización adicional.

2. **Rendimiento**: Los stored procedures están optimizados para consultas frecuentes, pero considera agregar índices en columnas de búsqueda frecuente.

3. **Mantenimiento**: Los stored procedures se pueden modificar sin afectar el código de la aplicación, lo que facilita el mantenimiento.

4. **Logging**: Considera agregar logging en los stored procedures para auditoría.

## Troubleshooting

### Error: "function does not exist"
- Verificar que los stored procedures se ejecutaron correctamente
- Verificar que estás conectado a la base de datos correcta

### Error: "permission denied"
- Verificar que el usuario de la base de datos tiene permisos para ejecutar las funciones
- Verificar que el usuario tiene permisos en la tabla `receipts`

### Error: "relation does not exist"
- Verificar que la tabla `receipts` existe
- Verificar que el esquema es correcto
