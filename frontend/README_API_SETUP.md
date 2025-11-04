# 🚀 Configuración de APIs Externas

## ⚡ Configuración Rápida

### **1. Crear archivo `.env.local`**

Crea el archivo `frontend/.env.local` con el siguiente contenido:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### **2. Obtener API Key de Google Maps**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Ve a "APIs & Services" > "Credentials"
4. Crea una API Key
5. Habilita "Maps JavaScript API"

### **3. Reiniciar Servidor**

```bash
cd frontend
npm run dev
```

## 🧪 Probar Funcionalidades

### **Mapas:**
1. Ve a `/movements`
2. Haz clic en "Visualizar en Maps" en cualquier producto
3. Deberías ver el mapa interactivo

## 🔧 Solución de Problemas

### **Error: "Google Maps no disponible"**
- ✅ Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté en `.env.local`
- ✅ Reinicia el servidor después de agregar la variable
- ✅ Verifica que la API Key sea válida

### **El mapa no se carga**
- ✅ Verifica la consola del navegador para errores
- ✅ Asegúrate de que la API Key tenga permisos para Maps JavaScript API
- ✅ Verifica que no haya restricciones de dominio muy estrictas

## 📊 Datos Simulados

Si no configuras la API key, el sistema usará datos simulados para demostración:

- **Mapas**: Datos de ejemplo de Neuquén, Argentina
- **Funcionalidad**: Todas las características funcionan igual

## 🎯 Para el TP

### **Con API real:**
- ✅ Mapas interactivos de Google
- ✅ Funcionalidad completa

### **Sin API (fallback):**
- ✅ Datos simulados para demostración
- ✅ Todas las funcionalidades visibles
- ✅ Perfecto para presentación

¡El sistema funciona en ambos casos! 🚀
