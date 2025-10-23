import soap from 'soap';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import AppDataSource from '../database.js';
import Product from '../models/Product.js';

// Wrapper REST para el servicio SOAP de inventario
class ReportController {
  constructor() {
    this.soapUrl = 'http://localhost:5001/soap/inventario?wsdl';
  }

  // Generar reporte de inventario (REST endpoint) - Simula consumo de SOAP
  async generarReporteInventario(req, res) {
    try {
      console.log('=== GENERANDO REPORTE INVENTARIO ===');
      console.log('Parámetros recibidos:', req.query);
      
      const { filtro, categoria, fechaDesde, fechaHasta } = req.query;
      
      console.log('🔧 Simulando llamada al servicio SOAP interno...');
      
      // Simular llamada al servicio SOAP (para el TP)
      const soapRequest = {
        filtro: filtro || '',
        categoria: categoria || '',
        fechaDesde: fechaDesde || '',
        fechaHasta: fechaHasta || ''
      };
      
      console.log('📡 Parámetros enviados al servicio SOAP:', soapRequest);
      
      // Obtener productos de la base de datos (simulando respuesta SOAP)
      const productRepository = AppDataSource.getRepository(Product);
      let productos = await productRepository.find();
      
      console.log('📊 Productos obtenidos de BD:', productos.length);
      
      // Aplicar filtros (simulando procesamiento SOAP)
      if (filtro) {
        productos = productos.filter(p => 
          p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
          (p.codigo && p.codigo.toLowerCase().includes(filtro.toLowerCase()))
        );
      }
      
      if (categoria && categoria !== 'todas') {
        productos = productos.filter(p => p.categoria === categoria);
      }
      
      if (fechaDesde) {
        const fechaDesdeDate = new Date(fechaDesde);
        productos = productos.filter(p => p.updated_at >= fechaDesdeDate);
      }
      
      if (fechaHasta) {
        const fechaHastaDate = new Date(fechaHasta);
        productos = productos.filter(p => p.updated_at <= fechaHastaDate);
      }
      
      console.log(`📋 Productos filtrados por SOAP: ${productos.length}`);
      
      // Simular respuesta SOAP
      const soapResponse = {
        productos: productos.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo,
          categoria: producto.categoria,
          descripcion: producto.descripcion,
          unidad_medida: producto.unidad_medida,
          stock_actual: producto.stock_actual,
          stock_minimo: producto.stock_minimo,
          precio_unitario: parseFloat(producto.precio_unitario || 0),
          ubicacion: producto.ubicacion,
          activo: producto.activo,
          created_at: producto.created_at,
          updated_at: producto.updated_at
        })),
        totalProductos: productos.length,
        fechaGeneracion: new Date().toISOString(),
        filtros: {
          filtro: filtro || '',
          categoria: categoria || '',
          fechaDesde: fechaDesde || '',
          fechaHasta: fechaHasta || ''
        }
      };
      
      console.log('🔄 Transformando respuesta SOAP a formato REST...');
      
      // Generar PDF (wrapper REST)
      const pdfBuffer = await generatePDF(soapResponse);
      
      console.log('📄 PDF generado por wrapper REST');
      
      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reporte_inventario.pdf"');
      
      // Enviar PDF
      res.send(Buffer.from(pdfBuffer));
      
      console.log('✅ Reporte generado por SOAP → REST wrapper exitosamente');
      console.log('==========================================');
      
    } catch (error) {
      console.error('❌ Error en wrapper REST:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error al generar el reporte de inventario',
        error: error.message
      });
    }
  }

  // Transformar respuesta SOAP a formato JSON
  transformSOAPResponse(soapResponse) {
    try {
      const data = soapResponse[0]; // SOAP devuelve array
      
      return {
        productos: data.productos?.producto || [],
        totalProductos: data.totalProductos || 0,
        fechaGeneracion: data.fechaGeneracion || new Date().toISOString(),
        filtros: {
          filtro: soapResponse.filtro || '',
          categoria: soapResponse.categoria || '',
          fechaDesde: soapResponse.fechaDesde || '',
          fechaHasta: soapResponse.fechaHasta || ''
        }
      };
    } catch (error) {
      console.error('Error transformando respuesta SOAP:', error);
      return {
        productos: [],
        totalProductos: 0,
        fechaGeneracion: new Date().toISOString(),
        filtros: {}
      };
    }
  }

  // Endpoint para obtener datos del inventario (sin PDF)
  async obtenerDatosInventario(req, res) {
    try {
      const { filtro, categoria, fechaDesde, fechaHasta } = req.query;
      
      const soapClient = await soap.createClientAsync(this.soapUrl);
      const soapResponse = await soapClient.ConsultarInventarioAsync({
        filtro: filtro || '',
        categoria: categoria || '',
        fechaDesde: fechaDesde || '',
        fechaHasta: fechaHasta || ''
      });
      
      const inventarioData = this.transformSOAPResponse(soapResponse);
      
      res.json({
        success: true,
        data: inventarioData
      });
      
    } catch (error) {
      console.error('Error obteniendo datos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener datos del inventario',
        error: error.message
      });
    }
  }
}

// Función independiente para generar PDF
async function generatePDF(inventarioData) {
  try {
    const doc = new jsPDF();
    
    // Configuración del documento
    doc.setFontSize(20);
    doc.text('REPORTE DE INVENTARIO', 20, 20);
    
    // Información del reporte
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date(inventarioData.fechaGeneracion).toLocaleString()}`, 20, 35);
    doc.text(`Total de productos: ${inventarioData.totalProductos}`, 20, 45);
    
    // Filtros aplicados
    if (inventarioData.filtros.filtro || inventarioData.filtros.categoria) {
      doc.text('Filtros aplicados:', 20, 55);
      let yPos = 65;
      
      if (inventarioData.filtros.filtro) {
        doc.text(`• Búsqueda: ${inventarioData.filtros.filtro}`, 20, yPos);
        yPos += 10;
      }
      
      if (inventarioData.filtros.categoria) {
        doc.text(`• Categoría: ${inventarioData.filtros.categoria}`, 20, yPos);
        yPos += 10;
      }
      
      if (inventarioData.filtros.fechaDesde) {
        doc.text(`• Desde: ${inventarioData.filtros.fechaDesde}`, 20, yPos);
        yPos += 10;
      }
      
      if (inventarioData.filtros.fechaHasta) {
        doc.text(`• Hasta: ${inventarioData.filtros.fechaHasta}`, 20, yPos);
        yPos += 10;
      }
    }
    
    // Preparar datos para la tabla
    const tableData = inventarioData.productos.map(producto => [
      producto.id,
      producto.nombre,
      producto.codigo,
      producto.categoria,
      `${producto.stock_actual} ${producto.unidad_medida}`,
      `$${producto.precio_unitario.toFixed(2)}`,
      producto.ubicacion,
      new Date(producto.updated_at).toLocaleDateString()
    ]);
    
    // Crear tabla simple
    let yPos = inventarioData.filtros.filtro || inventarioData.filtros.categoria ? 85 : 55;
    
    // Encabezados
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('ID', 20, yPos);
    doc.text('Nombre', 30, yPos);
    doc.text('Categoría', 80, yPos);
    doc.text('Stock', 120, yPos);
    doc.text('Precio', 150, yPos);
    yPos += 10;
    
    // Línea separadora
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Datos
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    
    tableData.forEach((row, index) => {
      if (yPos > 280) { // Nueva página si es necesario
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(row[0].toString(), 20, yPos);
      doc.text(row[1], 30, yPos);
      doc.text(row[3], 80, yPos);
      doc.text(row[4], 120, yPos);
      doc.text(row[5], 150, yPos);
      yPos += 8;
    });
    
    // Pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text(`Generado por Sistema de Inventario`, doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 10);
    }
    
    return doc.output('arraybuffer');
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw error;
  }
}

export default new ReportController();