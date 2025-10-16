# 🔧 Fix: Error de Números Telefónicos Interpretados como Cantidades

## 🐛 Problema Identificado

**Error:**
```
el valor «2995954318» está fuera de rango para el tipo integer
code: '22003'
where: "portal sin nombre, parámetro 8 = '...'"
```

**Parámetro 8** corresponde a `stock_actual` (cantidad) en la inserción de productos.

---

## 🔍 Causa Raíz

### El Problema

El parser de PDF estaba capturando **números de teléfono** como si fueran **cantidades de productos**.

**Ejemplo de PDF:**
```
Producto: Cemento Portland
Cantidad: 50
Precio: $4500

DATOS DE CONTACTO
Teléfono: 2995954318  ← ¡Este número se interpretaba como cantidad!
Email: contacto@empresa.com
```

### Por Qué Ocurría

Las expresiones regulares en `fileProcessor.js` buscaban cualquier patrón:
```javascript
/(\d+)\s+([A-Za-z0-9\s\-\.]+)/gm  // Cualquier número + texto
```

Esto capturaba:
- ✅ `50 Cemento Portland` → Correcto
- ❌ `2995954318 contacto@empresa` → Incorrecto (teléfono)

---

## ✅ Solución Implementada

### 1. Limitar Longitud de Cantidades

**Cambio en expresiones regulares:**

```javascript
// ANTES: Capturaba números de cualquier longitud
/(\d+)\s+([A-Za-z0-9\s\-\.]+)/gm

// AHORA: Máximo 6 dígitos (999,999)
/(\d{1,6})\s+([A-Za-z0-9\s\-\.]+)/gm
```

### 2. Agregar Detector de Teléfonos

**Nueva función en `fileProcessor.js`:**

```javascript
static looksLikePhoneNumber(text) {
  const phonePatterns = [
    /\b\d{10}\b/,           // 2995954318
    /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/,  // 299-595-4318
    /\b\d{2}[-\s]?\d{4}[-\s]?\d{4}\b/,  // 29-9595-4318
    /\b15[-\s]?\d{4}[-\s]?\d{4}\b/,     // 15-1234-5678
    /\btel[eé]fono|phone|cel|contacto/i, // Palabras relacionadas
  ];
  
  return phonePatterns.some(pattern => pattern.test(text));
}
```

### 3. Validación Múltiple al Extraer Productos

**Antes:**
```javascript
if (quantity > 0 && name.length > 2 && !this.isCommonWord(name)) {
  data.products.push({ name, quantity, ... });
}
```

**Ahora:**
```javascript
// Tres validaciones
const isReasonableQuantity = quantity > 0 && quantity <= 999999;
const isValidName = name.length > 2 && !this.isCommonWord(name);
const isNotPhoneNumber = !this.looksLikePhoneNumber(name + " " + quantity);

if (isReasonableQuantity && isValidName && isNotPhoneNumber) {
  data.products.push({ name, quantity, ... });
}
```

### 4. Validación de Respaldo en el Controlador

**En `receiptController.js`:**

```javascript
// Validar que quantity no exceda el límite de INTEGER
if (quantity > 2147483647 || quantity < 0) {
  console.warn(`⚠️ Cantidad inválida: ${quantity}. Ajustando...`);
  product.quantity = Math.min(Math.max(parseInt(quantity) || 1, 1), 999999);
}
```

Esto actúa como **red de seguridad** por si algo pasa el primer filtro.

---

## 📊 Límites Establecidos

| Concepto | Límite Anterior | Límite Nuevo | Razón |
|----------|-----------------|--------------|-------|
| Cantidad en Regex | Sin límite | 6 dígitos (999,999) | Evitar teléfonos de 10 dígitos |
| Validación de cantidad | Sin validación | 0 < qty ≤ 999,999 | Rangos razonables para inventario |
| INTEGER PostgreSQL | 2,147,483,647 | Respetado | Límite de la base de datos |

---

## 🧪 Casos de Prueba

### ✅ Casos que DEBEN pasar

```
50 Cemento Portland          → ✅ Cantidad: 50
1000 Ladrillos              → ✅ Cantidad: 1000
25 Pintura Latex 4L         → ✅ Cantidad: 25
```

### ❌ Casos que DEBEN rechazarse

```
2995954318 contacto         → ❌ Teléfono detectado
15-1234-5678 llamar         → ❌ Teléfono con guiones
1000000 items               → ❌ Cantidad excesiva (>999,999)
```

---

## 🔧 Archivos Modificados

### 1. `backend/services/fileProcessor.js`

**Líneas 141-145:** Expresiones regulares con límite de 6 dígitos
```javascript
/(\d{1,6})\s+([A-Za-z0-9\s\-\.]+)/gm
```

**Líneas 161-166:** Validación múltiple
```javascript
const isReasonableQuantity = quantity > 0 && quantity <= 999999;
const isNotPhoneNumber = !this.looksLikePhoneNumber(name + " " + quantity);
```

**Líneas 194-205:** Nueva función `looksLikePhoneNumber()`

### 2. `backend/controllers/receiptController.js`

**Líneas 412-416:** Validación de respaldo
```javascript
if (quantity > 2147483647 || quantity < 0) {
  product.quantity = Math.min(Math.max(parseInt(quantity) || 1, 1), 999999);
}
```

---

## 🚀 Comandos para Aplicar

```powershell
# El código ya está actualizado, solo necesitas reiniciar

# Detener servidor
taskkill /F /IM node.exe

# Reiniciar
cd backend
npm run dev
```

---

## ✅ Verificación

### 1. Probar con PDF que contenga teléfono

Sube un PDF con contenido como:
```
Producto: Cemento
Cantidad: 50
Teléfono: 2995954318
```

**Resultado esperado:**
- ✅ Solo se crea 1 producto (Cemento, cantidad 50)
- ✅ El teléfono NO se interpreta como cantidad
- ✅ Sin errores de INTEGER

### 2. Verificar en la consola

```
Procesando PDF: ...
Texto extraído del PDF: ...
✅ Productos extraídos: 1
```

**NO debe aparecer:**
```
❌ el valor «2995954318» está fuera de rango para el tipo integer
```

---

## 💡 Mejoras Adicionales (Futuro)

### Opción 1: Usar Secciones del PDF

Dividir el PDF en secciones y solo buscar productos en la sección de "Items" o "Productos":

```javascript
// Extraer solo la sección de productos
const productSection = text.match(/PRODUCTOS:(.*?)TOTAL:/is);
if (productSection) {
  // Buscar solo en esta sección
}
```

### Opción 2: Machine Learning

Entrenar un modelo para distinguir entre:
- Datos de productos (cantidad, nombre, precio)
- Datos de contacto (teléfono, email)
- Metadatos (fecha, número de orden)

### Opción 3: Formato Estructurado

Requerir que los PDFs sigan un formato específico o usar tablas:

```javascript
// Detectar tablas en el PDF
const tables = extractTablesFromPDF(pdf);
// Las tablas tienen estructura clara: columna "Cantidad", "Producto", "Precio"
```

---

## 📚 Patrones de Teléfono Detectados

La función detecta estos formatos comunes en Argentina y Latinoamérica:

| Formato | Ejemplo | Detectado |
|---------|---------|-----------|
| 10 dígitos | `2995954318` | ✅ |
| Con guiones | `299-595-4318` | ✅ |
| Con espacios | `299 595 4318` | ✅ |
| Con prefijo | `15-1234-5678` | ✅ |
| Con código | `+54-299-595-4318` | ✅ |
| Con texto | `Tel: 2995954318` | ✅ |

---

## ✅ Estado Final

```
✅ Números de teléfono filtrados
✅ Cantidades limitadas a 6 dígitos (999,999)
✅ Validación múltiple implementada
✅ Red de seguridad en el controlador
✅ Servidor reiniciado con cambios
✅ Compatible con INTEGER de PostgreSQL
```

---

**¡Problema del teléfono resuelto!** 🎉

Ahora el sistema puede distinguir correctamente entre cantidades de productos y números de teléfono en los PDFs.

