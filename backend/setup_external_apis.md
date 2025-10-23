# 🔧 Configuración de APIs Externas

## 📋 Pasos para Configurar las APIs

### **1. Google Maps API**

#### **Obtener API Key:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"
4. Haz clic en "Create Credentials" > "API Key"
5. Copia tu API Key

#### **Habilitar APIs necesarias:**
- Maps JavaScript API
- Geocoding API (opcional)
- Places API (opcional)

#### **Configurar restricciones (recomendado):**
- **Application restrictions**: HTTP referrers
- **Website restrictions**: `localhost:3000/*`, `tu-dominio.com/*`

### **2. OpenWeatherMap API**

#### **Obtener API Key:**
1. Ve a [OpenWeatherMap](https://openweathermap.org/api)
2. Haz clic en "Sign Up" para crear cuenta gratuita
3. Ve a "API Keys" en tu perfil
4. Copia tu API Key

#### **Plan gratuito incluye:**
- 1000 calls/día
- Current weather data
- 5-day/3-hour forecast
- 16-day forecast

### **3. Configurar Variables de Entorno**

#### **Crear archivo `.env.local` en la carpeta `frontend/`:**

```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui

# OpenWeatherMap API Key
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_openweather_api_key_aqui
```

#### **Ejemplo de configuración:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBvOkBwvQwQwQwQwQwQwQwQwQwQwQwQwQ
NEXT_PUBLIC_OPENWEATHER_API_KEY=1234567890abcdef1234567890abcdef
```

### **4. Verificar Configuración**

#### **Reiniciar el servidor de desarrollo:**
```bash
cd frontend
npm run dev
```

#### **Probar funcionalidades:**
1. **Mapas**: Ve a `/movements` y haz clic en "Visualizar en Maps"
2. **Clima**: Ve a `/movements` y haz clic en "Ver Clima"

### **5. Solución de Problemas**

#### **Error: "Google Maps API key not found"**
- Verifica que la variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` esté configurada
- Reinicia el servidor de desarrollo
- Verifica que la API Key sea válida en Google Cloud Console

#### **Error: "OpenWeatherMap API key not found"**
- Verifica que la variable `NEXT_PUBLIC_OPENWEATHER_API_KEY` esté configurada
- Verifica que la API Key sea válida en OpenWeatherMap
- Verifica que no hayas excedido el límite de 1000 calls/día

#### **Error: "CORS policy"**
- Las APIs externas pueden tener restricciones CORS
- El sistema incluye fallback a datos simulados si fallan las APIs

### **6. Monitoreo de Uso**

#### **Google Maps:**
- Ve a Google Cloud Console > APIs & Services > Quotas
- Monitorea el uso de Maps JavaScript API

#### **OpenWeatherMap:**
- Ve a tu perfil en OpenWeatherMap
- Revisa el uso diario en "API usage"

### **7. Costos Estimados**

#### **Google Maps (Plan gratuito):**
- $200/mes de crédito gratuito
- ~28,000 requests/mes incluidos
- Costo adicional: $7 por 1000 requests

#### **OpenWeatherMap (Plan gratuito):**
- 1000 calls/día gratis
- Sin costo adicional dentro del límite
- Plan pago: $40/mes para más calls

### **8. Seguridad**

#### **Mejores prácticas:**
- ✅ **Nunca commitees** el archivo `.env.local`
- ✅ **Usa restricciones de dominio** en Google Cloud
- ✅ **Monitorea el uso** regularmente
- ✅ **Rota las API keys** periódicamente

#### **Archivos a ignorar:**
```gitignore
# Variables de entorno
.env.local
.env.production
```

### **9. Para Producción**

#### **Variables de entorno en producción:**
- Configura las variables en tu plataforma de hosting
- Vercel: Ve a Settings > Environment Variables
- Netlify: Ve a Site Settings > Environment Variables

#### **Dominios permitidos:**
- Agrega tu dominio de producción en Google Cloud Console
- Ejemplo: `https://tu-app.vercel.app/*`

---

## ✅ Checklist de Configuración

- [ ] **Google Maps API Key obtenida**
- [ ] **OpenWeatherMap API Key obtenida**
- [ ] **Archivo `.env.local` creado**
- [ ] **Variables de entorno configuradas**
- [ ] **Servidor reiniciado**
- [ ] **Funcionalidad de mapas probada**
- [ ] **Funcionalidad de clima probada**
- [ ] **Fallback a datos simulados funcionando**

---

## 🚀 ¡Listo para usar!

Una vez configuradas las API keys, tu sistema de inventario tendrá:

- ✅ **Mapas interactivos** con Google Maps
- ✅ **Datos climáticos reales** con OpenWeatherMap
- ✅ **Fallback automático** a datos simulados
- ✅ **Monitoreo de uso** de APIs
- ✅ **Seguridad** con restricciones de dominio
