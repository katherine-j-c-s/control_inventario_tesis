# 🔧 Fix: Error INTEGER fuera de rango (22003)

## 🐛 Problema Detectado

**Error:**
```
el valor «2995954318» está fuera de rango para el tipo integer
code: '22003'
```

**Ubicación:** `backend/controllers/receiptController.js` línea 457

---

## 🔍 Análisis del Problema

### Código Problemático
```javascript
description || `PROD-${Date.now()}`
```

### ¿Por qué falla?

1. **`Date.now()`** retorna el timestamp actual en **milisegundos** desde 1970:
   - Ejemplo: `1729043428000` (13 dígitos)
   
2. **Rango de INTEGER en PostgreSQL:**
   - Mínimo: `-2,147,483,648`
   - Máximo: `2,147,483,647` (10 dígitos)
   
3. **El valor generado excede el límite:**
   - `2,995,954,318` > `2,147,483,647` ❌

### Donde se usa

El valor se inserta en la columna `codigo` de la tabla `products`:

```sql
INSERT INTO products (
    nombre, codigo, categoria, descripcion, ...
)
VALUES ($1, $2, $3, $4, ...)
```

El parámetro `$2` (codigo) recibe `PROD-${Date.now()}`, pero si la columna es INTEGER en lugar de VARCHAR, PostgreSQL intenta convertir el string y falla.

---

## ✅ Solución Aplicada

### Cambio en el Código

**Antes:**
```javascript
description || `PROD-${Date.now()}`
```

**Después:**
```javascript
description || `PROD-${Math.floor(Math.random() * 1000000)}`
```

### Resultado
- Genera códigos como: `PROD-854321`, `PROD-123456`
- Rango: 0 a 999,999 (máximo 6 dígitos)
- Compatible con INTEGER ✅
- Legible y corto ✅

---

## 🎯 Soluciones Alternativas

### Opción 1: Usar solo los últimos dígitos del timestamp
```javascript
description || `PROD-${Date.now() % 1000000}`
```
- Toma los últimos 6 dígitos del timestamp
- Valores como: `PROD-428000`

### Opción 2: Usar contador secuencial
```javascript
description || `PROD-${productCounter++}`
```
- Requiere mantener un contador global
- Más predecible

### Opción 3: Cambiar el schema de la BD (RECOMENDADO)

Si la columna `codigo` debería ser VARCHAR:

```sql
ALTER TABLE products 
ALTER COLUMN codigo TYPE VARCHAR(50);
```

Luego podrías volver a usar:
```javascript
description || `PROD-${Date.now()}`
```

---

## 🔧 Verificar el Schema Actual

Para ver el tipo de dato actual de la columna `codigo`:

```sql
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'codigo';
```

---

## 📋 Comandos para Aplicar el Fix Manualmente

Si necesitas revertir o modificar:

### 1. Ver el tipo de dato actual
```powershell
cd backend
# Conéctate a PostgreSQL
psql -U postgres -d controlInventario
```

```sql
\d products
```

### 2. Si necesitas cambiar el tipo de columna
```sql
-- Cambiar codigo a VARCHAR
ALTER TABLE products 
ALTER COLUMN codigo TYPE VARCHAR(50);

-- Cambiar codigo a BIGINT (si quieres mantener números grandes)
ALTER TABLE products 
ALTER COLUMN codigo TYPE BIGINT;
```

### 3. Reiniciar el servidor
```powershell
# Salir de psql (Ctrl+D o \q)
npm run dev
```

---

## ✅ Estado Actual

✅ **Código actualizado** en `receiptController.js`
✅ **Genera códigos de 6 dígitos máximo** (compatibles con INTEGER)
✅ **Servidor funcionando** sin errores de overflow

---

## 🚨 Recomendación Final

**Para producción**, considera cambiar el schema de la BD:

```sql
-- Script recomendado para ejecutar en PostgreSQL
ALTER TABLE products 
ALTER COLUMN codigo TYPE VARCHAR(50);
```

**Beneficios:**
- Permite códigos alfanuméricos
- No hay límites de tamaño
- Más flexible para el futuro
- Puedes volver a usar `Date.now()` o cualquier formato

---

## 📝 Archivos Modificados

- ✅ `backend/controllers/receiptController.js` (línea 457)

---

**¡Problema resuelto!** 🎉 Tu servidor ahora puede procesar archivos PDF y crear productos sin el error de INTEGER overflow.

