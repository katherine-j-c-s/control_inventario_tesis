# 🔍 Investigación de APIs Externas para Sistema de Inventario

## 📋 Requisitos del TP
- **Cantidad**: 2 APIs externas (2 integrantes del grupo)
- **Justificación**: Cada API debe estar justificada y comparada con alternativas
- **Comparativa**: REST vs GraphQL

---

## 🎯 **API 1: Google Maps JavaScript API**

### **¿Por qué Google Maps?**
- **Tracking de Productos**: Visualizar rutas de movimiento de productos
- **Geolocalización**: Ubicación de almacenes, proveedores, clientes
- **Logística**: Optimización de rutas de entrega
- **Integración**: Fácil integración con React/Next.js

### **Funcionalidades Propuestas**
```javascript
// Ejemplo de implementación
const ProductTracker = {
  // Mostrar ruta de un producto específico
  showProductRoute: (productId) => {
    // Obtener historial de movimientos del producto
    // Mostrar en mapa interactivo
  },
  
  // Visualizar ubicaciones de almacenes
  showWarehouseLocations: () => {
    // Mostrar todos los almacenes en el mapa
  },
  
  // Optimizar rutas de entrega
  optimizeDeliveryRoutes: (deliveries) => {
    // Calcular rutas óptimas
  }
};
```

### **Comparación con Alternativas**

| API | Ventajas | Desventajas | Decisión |
|-----|----------|-------------|----------|
| **Google Maps** | • Mayor precisión<br>• Mejor integración<br>• Documentación excelente | • Costo por uso<br>• Requiere API key | ✅ **ELEGIDA** |
| **OpenStreetMap** | • Gratuita<br>• Open source | • Menor precisión<br>• Menos funcionalidades | ❌ |
| **Mapbox** | • Buena personalización<br>• Precio competitivo | • Curva de aprendizaje<br>• Menor adopción | ❌ |

---

## 🌤️ **API 2: OpenWeatherMap API**

### **¿Por qué OpenWeatherMap?**
- **Condiciones de Almacenamiento**: Productos sensibles al clima
- **Logística**: Planificar entregas según condiciones climáticas
- **Alertas**: Notificar condiciones adversas
- **Gratuita**: Plan gratuito con 1000 llamadas/día

### **Funcionalidades Propuestas**
```javascript
// Ejemplo de implementación
const WeatherIntegration = {
  // Verificar condiciones para almacenamiento
  checkStorageConditions: (location, productType) => {
    // Obtener clima actual
    // Verificar si es seguro almacenar el producto
  },
  
  // Alertas climáticas para logística
  getWeatherAlerts: (deliveryRoute) => {
    // Verificar condiciones en ruta de entrega
    // Alertar sobre condiciones adversas
  },
  
  // Planificar entregas según clima
  planDeliveryByWeather: (deliveries) => {
    // Reorganizar entregas según pronóstico
  }
};
```

### **Comparación con Alternativas**

| API | Ventajas | Desventajas | Decisión |
|-----|----------|-------------|----------|
| **OpenWeatherMap** | • Gratuita<br>• Datos precisos<br>• Fácil integración | • Límite de llamadas<br>• Menos datos históricos | ✅ **ELEGIDA** |
| **WeatherAPI** | • Más datos históricos<br>• Mejor para análisis | • Más cara<br>• Complejidad | ❌ |
| **AccuWeather** | • Muy precisa<br>• Datos detallados | • Muy cara<br>• Compleja | ❌ |

---

## 🔄 **REST vs GraphQL - Comparativa**

### **REST (Representational State Transfer)**

#### **Ventajas**
- ✅ **Simplicidad**: Fácil de entender e implementar
- ✅ **Estándar**: Ampliamente adoptado
- ✅ **Caching**: Excelente soporte para caché HTTP
- ✅ **Herramientas**: Muchas herramientas de desarrollo
- ✅ **Escalabilidad**: Fácil de escalar horizontalmente

#### **Desventajas**
- ❌ **Over-fetching**: Obtener más datos de los necesarios
- ❌ **Under-fetching**: Múltiples requests para datos relacionados
- ❌ **Versionado**: Complejo manejar versiones
- ❌ **Flexibilidad**: Estructura fija de respuestas

### **GraphQL**

#### **Ventajas**
- ✅ **Flexibilidad**: Solicitar exactamente los datos necesarios
- ✅ **Una sola query**: Obtener datos relacionados en una consulta
- ✅ **Tipado fuerte**: Schema bien definido
- ✅ **Introspection**: Documentación automática
- ✅ **Evolución**: Fácil agregar nuevos campos

#### **Desventajas**
- ❌ **Complejidad**: Curva de aprendizaje más alta
- ❌ **Caching**: Más complejo de implementar
- ❌ **Over-engineering**: Puede ser excesivo para casos simples
- ❌ **Herramientas**: Menos maduras que REST

---

## 🎯 **Recomendación para tu Sistema de Inventario**

### **¿Cuándo usar REST?**
- ✅ **APIs simples** con pocas relaciones
- ✅ **Integración con APIs externas** (Google Maps, OpenWeatherMap)
- ✅ **Sistemas legacy** o equipos con experiencia en REST
- ✅ **Caching crítico** para performance

### **¿Cuándo usar GraphQL?**
- ✅ **Frontend complejo** con múltiples vistas
- ✅ **Múltiples clientes** (web, mobile, etc.)
- ✅ **Datos relacionados** (productos con categorías, usuarios con roles)
- ✅ **Evolución rápida** del schema

### **Decisión Final para tu TP**

**RECOMENDACIÓN: REST** para tu sistema de inventario

**Justificación:**
1. **Simplicidad**: Tu sistema actual ya usa REST
2. **APIs externas**: Google Maps y OpenWeatherMap son REST
3. **Equipo**: Más fácil de mantener para 2 personas
4. **Escalabilidad**: Suficiente para las necesidades del inventario
5. **Tiempo**: Menos tiempo de desarrollo para el TP

---

## 🚀 **Plan de Implementación**

### **Fase 1: Google Maps API**
```javascript
// 1. Configurar API key
// 2. Crear componente de mapa
// 3. Integrar con movimientos de productos
// 4. Mostrar rutas de productos
```

### **Fase 2: OpenWeatherMap API**
```javascript
// 1. Configurar API key
// 2. Crear servicio de clima
// 3. Integrar con almacenamiento
// 4. Alertas climáticas
```

### **Fase 3: Documentación**
- Documentar integración de ambas APIs
- Crear ejemplos de uso
- Justificar decisiones técnicas

---

## 📊 **Costo Estimado**

| API | Plan Gratuito | Plan Pago | Uso Estimado |
|-----|---------------|-----------|--------------|
| **Google Maps** | $200/mes | $200/mes | 28,000 requests/mes |
| **OpenWeatherMap** | 1000 calls/día | $40/mes | 1000 calls/día |

**Total estimado**: $240/mes (con plan pago de Google Maps)

---

## ✅ **Conclusión**

**APIs Seleccionadas:**
1. **Google Maps JavaScript API** - Para tracking y visualización
2. **OpenWeatherMap API** - Para condiciones climáticas

**Tecnología Recomendada:** **REST** para tu sistema de inventario

**Justificación:** Ambas APIs son REST, tu sistema actual es REST, y es más simple para un TP de 2 personas.
