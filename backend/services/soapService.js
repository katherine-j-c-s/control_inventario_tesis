import soap from 'soap';
import AppDataSource from '../database.js';

// Servicio SOAP interno para consultas de inventario
class InventarioSOAPService {
  constructor() {
    this.wsdl = this.generateWSDL();
    this.server = null;
  }

  // Generar WSDL dinámicamente
  generateWSDL() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://schemas.xmlsoap.org/wsdl/"
            xmlns:tns="http://inventario.soap.service"
            xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            targetNamespace="http://inventario.soap.service">

  <types>
    <xsd:schema targetNamespace="http://inventario.soap.service">
      <xsd:element name="ConsultarInventarioRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="filtro" type="xsd:string" minOccurs="0"/>
            <xsd:element name="categoria" type="xsd:string" minOccurs="0"/>
            <xsd:element name="fechaDesde" type="xsd:date" minOccurs="0"/>
            <xsd:element name="fechaHasta" type="xsd:date" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:element name="ConsultarInventarioResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="productos" type="tns:ProductoArray"/>
            <xsd:element name="totalProductos" type="xsd:int"/>
            <xsd:element name="fechaGeneracion" type="xsd:dateTime"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      
      <xsd:complexType name="ProductoArray">
        <xsd:sequence>
          <xsd:element name="producto" type="tns:Producto" maxOccurs="unbounded"/>
        </xsd:sequence>
      </xsd:complexType>
      
      <xsd:complexType name="Producto">
        <xsd:sequence>
          <xsd:element name="id" type="xsd:int"/>
          <xsd:element name="nombre" type="xsd:string"/>
          <xsd:element name="codigo" type="xsd:string"/>
          <xsd:element name="categoria" type="xsd:string"/>
          <xsd:element name="stock" type="xsd:int"/>
          <xsd:element name="precio" type="xsd:decimal"/>
          <xsd:element name="fechaUltimoMovimiento" type="xsd:dateTime"/>
        </xsd:sequence>
      </xsd:complexType>
    </xsd:schema>
  </types>

  <message name="ConsultarInventarioRequest">
    <part name="parameters" element="tns:ConsultarInventarioRequest"/>
  </message>
  
  <message name="ConsultarInventarioResponse">
    <part name="parameters" element="tns:ConsultarInventarioResponse"/>
  </message>

  <portType name="InventarioPortType">
    <operation name="ConsultarInventario">
      <input message="tns:ConsultarInventarioRequest"/>
      <output message="tns:ConsultarInventarioResponse"/>
    </operation>
  </portType>

  <binding name="InventarioBinding" type="tns:InventarioPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="ConsultarInventario">
      <soap:operation soapAction="http://inventario.soap.service/ConsultarInventario"/>
      <input>
        <soap:body use="literal"/>
      </input>
      <output>
        <soap:body use="literal"/>
      </output>
    </operation>
  </binding>

  <service name="InventarioService">
    <port name="InventarioPort" binding="tns:InventarioBinding">
      <soap:address location="http://localhost:5001/soap/inventario"/>
    </port>
  </service>
</definitions>`;
  }

  // Método principal para consultar inventario
  async ConsultarInventario(args) {
    try {
      console.log('=== CONSULTA SOAP INVENTARIO ===');
      console.log('Parámetros recibidos:', args);
      
      const { filtro, categoria, fechaDesde, fechaHasta } = args;
      
      // Construir query dinámico
      const productRepository = AppDataSource.getRepository('Product');
      let query = productRepository.createQueryBuilder('product');
      
      // Aplicar filtros
      if (filtro) {
        query = query.where('product.nombre ILIKE :filtro OR product.codigo ILIKE :filtro', {
          filtro: `%${filtro}%`
        });
      }
      
      if (categoria) {
        query = query.andWhere('product.categoria = :categoria', { categoria });
      }
      
      if (fechaDesde) {
        query = query.andWhere('product.updated_at >= :fechaDesde', { fechaDesde });
      }
      
      if (fechaHasta) {
        query = query.andWhere('product.updated_at <= :fechaHasta', { fechaHasta });
      }
      
      // Ejecutar consulta
      const productos = await query.getMany();
      
      console.log(`Productos encontrados: ${productos.length}`);
      
      // Transformar datos para respuesta SOAP
      const productosSOAP = productos.map(producto => ({
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        categoria: producto.categoria,
        stock: producto.stock,
        precio: parseFloat(producto.precio || 0),
        fechaUltimoMovimiento: producto.updated_at
      }));
      
      const respuesta = {
        productos: {
          producto: productosSOAP
        },
        totalProductos: productos.length,
        fechaGeneracion: new Date().toISOString()
      };
      
      console.log('Respuesta SOAP generada:', respuesta);
      console.log('===============================');
      
      return respuesta;
      
    } catch (error) {
      console.error('Error en ConsultarInventario SOAP:', error);
      throw new Error(`Error al consultar inventario: ${error.message}`);
    }
  }

  // Configurar servicio SOAP para Express
  configureSOAPService(app) {
    try {
      const service = {
        InventarioService: {
          InventarioPortType: {
            ConsultarInventario: this.ConsultarInventario.bind(this)
          }
        }
      };

      // Configurar el servicio SOAP en Express
      soap.listen(app, '/soap/inventario', service, this.wsdl);
      console.log(`🚀 Servicio SOAP configurado en Express`);
      console.log(`📋 WSDL disponible en: http://localhost:5001/soap/inventario?wsdl`);
      
      return true;
    } catch (error) {
      console.error('Error configurando servicio SOAP:', error);
      throw error;
    }
  }

  // Detener servidor SOAP
  stopServer() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Servicio SOAP detenido');
    }
  }
}

export default InventarioSOAPService;
