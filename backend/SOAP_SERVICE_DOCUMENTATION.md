# Servicio SOAP de Inventario - Documentación Técnica

## 1. Características del Servicio SOAP

### 1.1 Información General
- **Nombre del Servicio**: InventarioService
- **Puerto**: InventarioPort
- **URL del WSDL**: `http://localhost:5001/soap/inventario?wsdl`
- **Namespace**: `http://www.example.com/inventario`
- **Protocolo**: SOAP 1.1/1.2

### 1.2 Operaciones Disponibles

#### Operación: `ConsultarInventario`
- **Descripción**: Consulta el inventario de productos con filtros opcionales
- **Tipo**: Document/Literal
- **Parámetros de Entrada**:
  - `filtro` (string, opcional): Búsqueda por nombre o código de producto
  - `categoria` (string, opcional): Filtro por categoría
  - `fechaDesde` (date, opcional): Fecha de inicio para filtro temporal
  - `fechaHasta` (date, opcional): Fecha de fin para filtro temporal

- **Parámetros de Salida**:
  - `productos` (array): Lista de productos encontrados
  - `totalProductos` (int): Cantidad total de productos
  - `fechaGeneracion` (dateTime): Fecha y hora de generación del reporte

### 1.3 Tipos de Datos

#### Estructura de Producto
```xml
<producto>
  <id>int</id>
  <nombre>string</nombre>
  <codigo>string</codigo>
  <categoria>string</categoria>
  <descripcion>string</descripcion>
  <unidad_medida>string</unidad_medida>
  <stock_actual>int</stock_actual>
  <stock_minimo>int</stock_minimo>
  <precio_unitario>decimal</precio_unitario>
  <ubicacion>string</ubicacion>
  <activo>boolean</activo>
  <created_at>dateTime</created_at>
  <updated_at>dateTime</updated_at>
</producto>
```

## 2. Ejemplo de Uso del Servicio SOAP

### 2.1 Consulta Simple
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarInventario xmlns="http://www.example.com/inventario">
      <filtro></filtro>
      <categoria></categoria>
      <fechaDesde></fechaDesde>
      <fechaHasta></fechaHasta>
    </ConsultarInventario>
  </soap:Body>
</soap:Envelope>
```

### 2.2 Consulta con Filtros
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarInventario xmlns="http://www.example.com/inventario">
      <filtro>tornillo</filtro>
      <categoria>Ferretería</categoria>
      <fechaDesde>2024-01-01</fechaDesde>
      <fechaHasta>2024-12-31</fechaHasta>
    </ConsultarInventario>
  </soap:Body>
</soap:Envelope>
```

### 2.3 Respuesta del Servicio
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarInventarioResponse xmlns="http://www.example.com/inventario">
      <productos>
        <producto>
          <id>1</id>
          <nombre>Tornillo de acero 6mm</nombre>
          <codigo>TOR001</codigo>
          <categoria>Ferretería</categoria>
          <stock_actual>150</stock_actual>
          <precio_unitario>25.50</precio_unitario>
        </producto>
      </productos>
      <totalProductos>1</totalProductos>
      <fechaGeneracion>2024-10-23T15:30:00Z</fechaGeneracion>
    </ConsultarInventarioResponse>
  </soap:Body>
</soap:Envelope>
```

## 3. Wrapper REST para Servicio SOAP

### 3.1 Endpoint REST
- **URL**: `GET /api/reports/inventario/pdf`
- **Autenticación**: Bearer Token requerido
- **Parámetros Query**:
  - `filtro`: Búsqueda por nombre/código
  - `categoria`: Filtro por categoría
  - `fechaDesde`: Fecha de inicio
  - `fechaHasta`: Fecha de fin

### 3.2 Flujo de Transformación

1. **Cliente REST** → Envía petición HTTP GET con parámetros
2. **Wrapper REST** → Recibe parámetros y los transforma
3. **Cliente SOAP** → Llama al servicio SOAP interno
4. **Servicio SOAP** → Consulta base de datos y procesa datos
5. **Wrapper REST** → Transforma respuesta SOAP a PDF
6. **Cliente REST** → Recibe PDF como blob para descarga

### 3.3 Código del Wrapper
```javascript
// Transformación de parámetros REST a SOAP
const soapResponse = await soapClient.ConsultarInventarioAsync({
  filtro: filtro || '',
  categoria: categoria || '',
  fechaDesde: fechaDesde || '',
  fechaHasta: fechaHasta || ''
});

// Transformación de respuesta SOAP a PDF
const inventarioData = this.transformSOAPResponse(soapResponse);
const pdfBuffer = await this.generatePDF(inventarioData);
```

## 4. Beneficios del Wrapper REST

### 4.1 Ventajas Técnicas
- **Simplicidad**: Los clientes REST son más simples de implementar
- **Compatibilidad**: Mejor integración con aplicaciones web modernas
- **Estándares**: HTTP/JSON son más universales que SOAP/XML
- **Herramientas**: Mejor soporte en herramientas de desarrollo

### 4.2 Ventajas de Negocio
- **Adopción**: Los desarrolladores prefieren APIs REST
- **Mantenimiento**: Menor complejidad en el cliente
- **Escalabilidad**: Mejor rendimiento en aplicaciones web
- **Flexibilidad**: Fácil agregar nuevos endpoints

### 4.3 Casos de Uso
- **Aplicaciones Web**: Frontend consume REST, backend usa SOAP
- **Microservicios**: Servicios internos usan SOAP, APIs públicas usan REST
- **Legacy Integration**: Modernizar sistemas legacy manteniendo SOAP
- **Performance**: REST para consultas rápidas, SOAP para operaciones complejas

## 5. Arquitectura del Sistema

```
Frontend (React) 
    ↓ HTTP/JSON
Wrapper REST (/api/reports/inventario/pdf)
    ↓ SOAP/XML
Servicio SOAP Interno (/soap/inventario)
    ↓ SQL
Base de Datos PostgreSQL
```

## 6. Implementación Técnica

### 6.1 Stack Tecnológico
- **Backend**: Node.js + Express.js
- **SOAP**: node-soap library
- **Base de Datos**: PostgreSQL + TypeORM
- **PDF**: jsPDF + jspdf-autotable
- **Frontend**: React + Next.js

### 6.2 Configuración del Servicio
```javascript
// Configuración del servicio SOAP
const service = {
  InventarioService: {
    InventarioPortType: {
      ConsultarInventario: this.ConsultarInventario.bind(this)
    }
  }
};

// Inicialización del servidor SOAP
soap.listen(app, '/soap/inventario', service, wsdl);
```

## 7. Conclusión

La implementación de un wrapper REST para un servicio SOAP proporciona:

1. **Mejor experiencia de desarrollo** para el frontend
2. **Mantenimiento de estándares empresariales** con SOAP
3. **Flexibilidad arquitectónica** para futuras integraciones
4. **Compatibilidad** con sistemas legacy y modernos

Esta arquitectura híbrida permite aprovechar las ventajas de ambos protocolos según el contexto de uso.
