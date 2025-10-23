# 🚀 Guía de Implementación - APIs Externas

## 📋 Resumen de la Implementación

Se han integrado **2 APIs externas** en el sistema de inventario:

1. **🌍 Google Maps JavaScript API** - Para tracking y visualización de productos
2. **🌤️ OpenWeatherMap API** - Para condiciones climáticas

---

## 🔧 Configuración de APIs

### **1. Google Maps API**

#### **Configuración:**
```bash
# 1. Obtener API Key de Google Cloud Console
# 2. Habilitar las siguientes APIs:
#    - Maps JavaScript API
#    - Geocoding API
#    - Places API (opcional)

# 3. Configurar en .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

#### **Funcionalidades Implementadas:**
- ✅ **Ubicación Actual**: Muestra dónde está el producto
- ✅ **Historial de Movimientos**: Ruta completa del producto
- ✅ **Ubicación de Almacenes**: Todos los almacenes del sistema
- ✅ **Cálculo de Distancias**: Distancia total recorrida
- ✅ **Marcadores Interactivos**: Info windows con detalles

### **2. OpenWeatherMap API**

#### **Configuración:**
```bash
# 1. Registrarse en OpenWeatherMap
# 2. Obtener API Key gratuita (1000 calls/día)

# 3. Configurar en .env.local
NEXT_PUBLIC_OPENWEATHER_API_KEY=tu_api_key_aqui
```

#### **Funcionalidades Implementadas:**
- ✅ **Clima Actual**: Temperatura, humedad, viento, presión
- ✅ **Pronóstico Semanal**: 7 días de pronóstico
- ✅ **Recomendaciones**: Para almacenamiento y transporte
- ✅ **Alertas Climáticas**: Condiciones adversas
- ✅ **Impacto en Inventario**: Análisis de condiciones

---

## 🗂️ Estructura de Archivos

```
frontend/src/
├── components/
│   ├── VisualizacionMaps.js      # Componente de mapas
│   └── ClimaComponent.js         # Componente de clima
├── hooks/
│   └── useExternalAPIs.js        # Hook para APIs externas
├── app/
│   ├── movements/
│   │   ├── page.js               # Página principal con botones
│   │   ├── visualizacion/[id]/
│   │   │   └── page.js           # Página de mapas
│   │   └── clima/
│   │       └── page.js           # Página de clima
│   └── movements/components/
│       └── historyMovements.js   # Lista con botón de mapas
└── env.example                   # Variables de entorno
```

---

## 🎯 Flujo de Usuario

### **1. Desde Movimientos → Mapas**
```
1. Usuario está en /movements
2. Ve lista de movimientos de productos
3. Hace clic en "Visualizar en Maps" de un producto
4. Navega a /movements/visualizacion/[id]
5. Ve mapa interactivo con opciones:
   - Ubicación actual
   - Historial de movimientos
   - Ubicación de almacenes
```

### **2. Desde Movimientos → Clima**
```
1. Usuario está en /movements
2. Hace clic en "Ver Clima"
3. Navega a /movements/clima
4. Ve información climática:
   - Clima actual
   - Pronóstico semanal
   - Recomendaciones para inventario
```

---

## 🔌 Integración Técnica

### **Hook useExternalAPIs**
```javascript
const {
  googleMapsLoaded,    // Estado de carga de Google Maps
  weatherData,         // Datos del clima actual
  loading,             // Estado de carga
  error,               // Errores
  fetchWeatherData,    // Función para obtener clima
  fetchWeeklyForecast  // Función para pronóstico
} = useExternalAPIs();
```

### **Componente VisualizacionMaps**
- **Props**: `productId`, `product`
- **Estados**: `activeView` (actual, historial, almacenes)
- **Funciones**: `renderCurrentLocation()`, `renderMovementHistory()`, `renderWarehouses()`

### **Componente ClimaComponent**
- **Props**: Ninguna
- **Estados**: `weatherData`, `weeklyForecast`
- **Funciones**: `getWeatherIcon()`, `getWeatherImpact()`

---

## 📊 Datos Simulados para TP

### **Movimientos de Productos:**
```javascript
const mockData = {
  movements: [
    {
      id: 1,
      fecha: '2024-01-15',
      desde: 'Almacén Central',
      hasta: 'Almacén Norte',
      ubicacion_desde: { lat: -34.6037, lng: -58.3816 },
      ubicacion_hasta: { lat: -34.6118, lng: -58.3960 },
      tipo: 'entrada'
    }
    // ... más movimientos
  ],
  warehouses: [
    { id: 1, nombre: 'Almacén Central', lat: -34.6037, lng: -58.3816, capacidad: 1000 }
    // ... más almacenes
  ]
};
```

### **Datos Climáticos:**
```javascript
const mockWeatherData = {
  current: {
    temperature: 22,
    humidity: 65,
    pressure: 1013,
    windSpeed: 15,
    description: 'Parcialmente nublado'
  },
  weekly: [
    { day: 'Lunes', temp: { min: 18, max: 25 }, description: 'Soleado' }
    // ... más días
  ]
};
```

---

## 🎨 Características de UI/UX

### **Mapas:**
- ✅ **Botones de Navegación**: Ubicación actual, Historial, Almacenes
- ✅ **Marcadores Coloridos**: Verde (origen), Rojo (destino), Azul (actual)
- ✅ **Líneas de Ruta**: Polylines azules conectando puntos
- ✅ **Info Windows**: Detalles al hacer clic en marcadores
- ✅ **Cálculo de Distancias**: Distancia total recorrida
- ✅ **Leyenda**: Explicación de colores y símbolos

### **Clima:**
- ✅ **Diseño Responsivo**: Grid adaptativo
- ✅ **Iconos Climáticos**: Sol, nubes, lluvia
- ✅ **Métricas Detalladas**: Temperatura, humedad, viento, presión
- ✅ **Pronóstico Semanal**: 7 días con temperaturas min/max
- ✅ **Recomendaciones**: Para almacenamiento y transporte
- ✅ **Impacto Visual**: Colores según condiciones

---

## 🔒 Seguridad y Mejores Prácticas

### **API Keys:**
- ✅ **Variables de Entorno**: No hardcodeadas en el código
- ✅ **Restricciones de Dominio**: Configuradas en Google Cloud
- ✅ **Límites de Uso**: Monitoreo de cuotas
- ✅ **Fallback**: Datos simulados si falla la API

### **Manejo de Errores:**
- ✅ **Loading States**: Indicadores de carga
- ✅ **Error Boundaries**: Captura de errores
- ✅ **Retry Logic**: Reintentos automáticos
- ✅ **User Feedback**: Mensajes de error claros

---

## 📈 Métricas y Monitoreo

### **Google Maps:**
- **Requests/mes**: ~28,000 (dentro del límite gratuito)
- **Costo estimado**: $0 (plan gratuito)
- **Funcionalidades**: Mapas, marcadores, polylines

### **OpenWeatherMap:**
- **Requests/día**: 1000 (límite gratuito)
- **Costo estimado**: $0 (plan gratuito)
- **Funcionalidades**: Clima actual, pronóstico

---

## 🚀 Próximos Pasos

### **Para Producción:**
1. **Configurar API Keys reales**
2. **Implementar autenticación**
3. **Agregar caché para optimizar**
4. **Monitoreo de uso y costos**
5. **Testing con datos reales**

### **Mejoras Futuras:**
1. **Geolocalización en tiempo real**
2. **Notificaciones push climáticas**
3. **Análisis predictivo de rutas**
4. **Integración con más APIs**
5. **Dashboard de métricas**

---

## ✅ Checklist de Implementación

- [x] **Componente VisualizacionMaps creado**
- [x] **Componente ClimaComponent creado**
- [x] **Hook useExternalAPIs implementado**
- [x] **Rutas de navegación configuradas**
- [x] **Botones integrados en movimientos**
- [x] **Datos simulados para TP**
- [x] **UI/UX responsive**
- [x] **Manejo de errores**
- [x] **Documentación completa**

---

## 🎯 Justificación para TP

### **Google Maps API:**
- **Justificación**: Tracking de productos es fundamental en inventario
- **Alternativa considerada**: OpenStreetMap (menos precisa)
- **Beneficio**: Visualización clara de rutas y ubicaciones

### **OpenWeatherMap API:**
- **Justificación**: Condiciones climáticas afectan almacenamiento
- **Alternativa considerada**: WeatherAPI (más cara)
- **Beneficio**: Optimización de logística y almacenamiento

### **REST vs GraphQL:**
- **Decisión**: REST
- **Justificación**: APIs externas son REST, simplicidad para 2 personas
- **Beneficio**: Implementación más rápida y mantenible
