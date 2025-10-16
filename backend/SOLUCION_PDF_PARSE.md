# 🔧 Solución al Error: DOMMatrix is not defined en Node.js 20

## 📊 Problema Detectado

**Error original:**
```
ReferenceError: DOMMatrix is not defined
    at .../node_modules/pdfjs-dist/legacy/build/pdf.mjs:15620:22
```

**Versiones problemáticas instaladas:**
- `pdf-parse`: 2.3.12
- `pdfjs-dist`: 5.4.296 (dependencia automática)
- Node.js: 20.15.1

**Causa:** 
- La versión 2.3.12 de `pdf-parse` instala `pdfjs-dist` 5.4.296
- Esta versión de `pdfjs-dist` requiere objetos del navegador (DOMMatrix, ImageData, Path2D)
- Estos objetos no existen nativamente en Node.js
- Además, `pdfjs-dist` 5.4.296 requiere Node.js ≥20.16.0 (tu versión es 20.15.1)

---

## ✅ Solución Implementada

### Opción Elegida: Downgrade a pdf-parse 1.1.1

Se instaló `pdf-parse@1.1.1` que utiliza `pdfjs-dist@2.x`, compatible con Node.js 20 sin necesidad de polyfills.

### Comandos Ejecutados

```powershell
# 1. Desinstalar versión problemática
npm uninstall pdf-parse

# 2. Instalar versión compatible
npm install pdf-parse@1.1.1
```

### Cambios en el Código

**Archivo: `backend/services/fileProcessor.js`**

Se actualizó el import para usar `createRequire` ya que `pdf-parse@1.1.1` es CommonJS:

```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
```

---

## 🎯 Funcionalidades Agregadas

### 1. Extracción de PDFs Digitales ✅
- Funciona perfectamente con `pdf-parse@1.1.1`
- Extrae texto de PDFs generados digitalmente

### 2. Detección de PDFs Escaneados ✅
- Detecta automáticamente si un PDF está escaneado (texto vacío o muy corto)
- Retorna mensaje indicativo para procesamiento adicional

### 3. OCR para Imágenes (Preparado) ✅
- Función `processImageWithOCR()` lista para usar con imágenes JPG, PNG, etc.
- Utiliza Tesseract.js (ya instalado en tu proyecto)
- Lenguaje configurado: español ('spa')

---

## 📝 Comandos de Referencia

### Ver versiones instaladas
```powershell
npm list pdf-parse pdfjs-dist
```

### Resultado esperado
```
backend@1.0.0
└── pdf-parse@1.1.1
```

### Si necesitas reinstalar
```powershell
# Limpiar instalación
npm uninstall pdf-parse pdfjs-dist

# Instalar versión correcta
npm install pdf-parse@1.1.1
```

---

## 🔄 Alternativas Evaluadas

### Opción 1: canvas + pdf-parse@2.3.12
❌ **Rechazada** - Requiere Node.js ≥20.16.0 y compilación nativa de canvas

```powershell
# NO USAR - Solo si actualizas Node.js
npm install canvas
npm install pdf-parse@2.3.12
```

### Opción 2: Downgrade pdfjs-dist
❌ **No funcional** - pdf-parse tiene dependencias específicas

```powershell
# NO USAR - Genera conflictos
npm install pdfjs-dist@3.11.174
```

### Opción 3: pdf2json
⚠️ **Alternativa válida** - Pero requiere cambios mayores en el código

```powershell
# Alternativa si pdf-parse no funciona
npm uninstall pdf-parse
npm install pdf2json
```

---

## 🖼️ Procesamiento de PDFs Escaneados (OCR)

Para PDFs escaneados (que son esencialmente imágenes), necesitas convertirlos primero a imágenes.

### Opción A: Usar pdf-poppler (Recomendado)

```powershell
# Instalar pdf-poppler
npm install pdf-poppler

# También necesitas instalar Poppler en tu sistema:
# Windows: https://github.com/oschwartz10612/poppler-windows/releases
# Descargar y agregar a PATH
```

**Ejemplo de uso:**
```javascript
import { convert } from 'pdf-poppler';
import Tesseract from 'tesseract.js';

// Convertir PDF a imágenes
const options = {
  format: 'png',
  out_dir: './temp',
  out_prefix: 'page',
  page: null // todas las páginas
};

const pdfPath = './uploads/documento-escaneado.pdf';
await convert(pdfPath, options);

// Luego aplicar OCR a cada imagen
const result = await Tesseract.recognize('./temp/page-1.png', 'spa');
console.log(result.data.text);
```

### Opción B: Subir imágenes directamente

Si el usuario puede subir imágenes en lugar de PDFs escaneados, usa la función ya implementada:

```javascript
const text = await FileProcessor.processImageWithOCR('./uploads/imagen.jpg');
```

---

## 🚀 Actualización Recomendada de Node.js

Para tener acceso a las últimas versiones de paquetes, considera actualizar Node.js:

```powershell
# Ver versión actual
node --version

# Actualizar a Node.js 20.16.0 o superior
# Descarga desde: https://nodejs.org/
```

**Beneficios:**
- Compatibilidad con `pdf-parse@2.3.12` + `canvas`
- Mejor rendimiento
- Más características de JavaScript

---

## ✅ Estado Final

**Solución implementada y funcionando:**
- ✅ `pdf-parse@1.1.1` instalado
- ✅ Código actualizado para usar `createRequire`
- ✅ Detección automática de PDFs escaneados
- ✅ Función OCR preparada para imágenes
- ✅ Servidor funcionando sin errores

**Próximos pasos (opcional):**
- Instalar `pdf-poppler` para PDFs escaneados
- Actualizar Node.js a ≥20.16.0
- Implementar conversión completa PDF→imagen→OCR

---

## 📚 Referencias

- [pdf-parse en npm](https://www.npmjs.com/package/pdf-parse)
- [pdfjs-dist en npm](https://www.npmjs.com/package/pdfjs-dist)
- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [pdf-poppler](https://www.npmjs.com/package/pdf-poppler)

