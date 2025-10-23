# 🚀 Configuración de APIs Externas

## ⚡ Configuración Rápida

### **1. Crear archivo `.env.local`**

Crea el archivo `frontend/.env.local` con el siguiente contenido:

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# OpenWeatherMap API Key
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_aqui
```

### **2. Obtener API Keys**

#### **Google Maps:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Ve a "APIs & Services" > "Credentials"
4. Crea una API Key
5. Habilita "Maps JavaScript API"

#### **OpenWeatherMap:**
1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Regístrate (gratis)
3. Ve a "API Keys" en tu perfil
4. Copia tu API Key

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

### **Clima:**
1. Ve a `/movements`
2. Haz clic en "Ver Clima"
3. Deberías ver datos climáticos reales

## 🔧 Solución de Problemas

### **Error: "Google Maps no disponible"**
- ✅ Verifica que `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté en `.env.local`
- ✅ Reinicia el servidor después de agregar la variable
- ✅ Verifica que la API Key sea válida

### **Error: "OpenWeatherMap no disponible"**
- ✅ Verifica que `NEXT_PUBLIC_OPENWEATHER_API_KEY` esté en `.env.local`
- ✅ Verifica que no hayas excedido el límite de 1000 calls/día

### **El mapa no se carga**
- ✅ Verifica la consola del navegador para errores
- ✅ Asegúrate de que la API Key tenga permisos para Maps JavaScript API
- ✅ Verifica que no haya restricciones de dominio muy estrictas

## 📊 Datos Simulados

Si no configuras las API keys, el sistema usará datos simulados para demostración:

- **Mapas**: Datos de ejemplo de Buenos Aires
- **Clima**: Datos simulados de Buenos Aires
- **Funcionalidad**: Todas las características funcionan igual

## 🎯 Para el TP

### **Con APIs reales:**
- ✅ Datos climáticos reales de Buenos Aires
- ✅ Mapas interactivos de Google
- ✅ Funcionalidad completa

### **Sin APIs (fallback):**
- ✅ Datos simulados para demostración
- ✅ Todas las funcionalidades visibles
- ✅ Perfecto para presentación

¡El sistema funciona en ambos casos! 🚀
