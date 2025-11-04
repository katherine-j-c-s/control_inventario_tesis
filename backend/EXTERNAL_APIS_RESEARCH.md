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

## 🚀 **Plan de Implementación**

### **Fase 1: Google Maps API**
```javascript
// 1. Configurar API key
// 2. Crear componente de mapa
// 3. Integrar con movimientos de productos
// 4. Mostrar rutas de productos
```

### **Fase 3: Documentación**
- Documentar integración de API
- Crear ejemplos de uso
- Justificar decisiones técnicas

---

## 📊 **Costo Estimado**

| API | Plan Gratuito | Plan Pago | Uso Estimado |
|-----|---------------|-----------|--------------|
| **Google Maps** | $200/mes | $200/mes | 28,000 requests/mes |

**Total estimado**: $200/mes (con plan pago de Google Maps)

---

## ✅ **Conclusión**

**APIs Seleccionadas:**
1. **Google Maps JavaScript API** - Para tracking y visualización
