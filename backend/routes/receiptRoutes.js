const express = require('express');
const QRCode = require('qrcode');
const { pool } = require('../db.js');
const { 
  getUnverified, 
  getAll, 
  verify, 
  getVerified, 
  getByStatus, 
  getStatistics,
  getReceiptWithProducts
} = require('../controllers/receiptController.js');

const router = express.Router();

router.get('/receipts', getAll);
router.get('/receipts/unverified', getUnverified);
router.get('/receipts/verified', getVerified);
router.get('/receipts/status/:status', getByStatus);
router.get('/receipts/statistics', getStatistics);
router.get('/receipts/:id', getReceiptWithProducts);

router.put('/receipts/verify/:id', verify);

router.get('/remitos/:id/productos', async (req, res) => {
  const remitoId = req.params.id;

  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.categoria,
        p.unidad_medida as unidad,
        p.precio_unitario as precio,
        p.stock_actual as cantidad,
        p.ubicacion,
        r.receipt_id,
        r.entry_date as fecha_remito
      FROM products p
      INNER JOIN receipts r ON p.id = r.product_id
      WHERE r.receipt_id = $1 AND p.activo = true
      ORDER BY p.nombre;
    `;

    const { rows: productos } = await pool.query(query, [remitoId]);

    if (productos.length === 0) {
      return res.json([]);
    }

    const productosConMovimientos = await Promise.all(
      productos.map(async (producto) => {
        const movimientosQuery = `
          SELECT 
            m.movement_type as tipo,
            m.quantity as cantidad,
            m.date as fecha,
            m.status,
            u.nombre as usuario_nombre
          FROM movements m
          LEFT JOIN users u ON m.user_id = u.id
          WHERE m.product_id = $1
          ORDER BY m.date DESC, m.movement_id DESC
          LIMIT 10;
        `;

        const { rows: movimientos } = await pool.query(movimientosQuery, [producto.id]);

        return {
          ...producto,
          movimientos: movimientos.map(mov => ({
            tipo: mov.tipo,
            cantidad: mov.cantidad,
            fecha: mov.fecha,
            status: mov.status,
            usuario: mov.usuario_nombre || 'Sistema'
          }))
        };
      })
    );

    const productosConQR = await Promise.all(
      productosConMovimientos.map(async (prod) => {
        const infoQR = {
          id: prod.id,
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          categoria: prod.categoria,
          cantidad: prod.cantidad,
          unidad: prod.unidad,
          precio: prod.precio,
          ubicacion: prod.ubicacion,
          remito_id: remitoId,
          fecha_remito: prod.fecha_remito,
          movimientos: prod.movimientos,
          timestamp: new Date().toISOString()
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(infoQR));
        return { 
          ...prod, 
          qrDataUrl
        };
      })
    );

    res.json(productosConQR);
  } catch (error) {
    console.error('Error obteniendo productos del remito:', error);
    res.status(500).json({ error: "Error generando QR de productos" });
  }
});

router.get('/productos/:id', async (req, res) => {
  const productoId = req.params.id;

  try {
    const productoQuery = `
      SELECT 
        p.id,
        p.nombre,
        p.descripcion,
        p.categoria,
        p.unidad_medida as unidad,
        p.precio_unitario as precio,
        p.stock_actual as cantidad,
        p.ubicacion,
        p.codigo,
        p.stock_minimo,
        p.created_at
      FROM products p
      WHERE p.id = $1 AND p.activo = true;
    `;

    const { rows: productos } = await pool.query(productoQuery, [productoId]);

    if (productos.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const producto = productos[0];

    const movimientosQuery = `
      SELECT 
        m.movement_type as tipo,
        m.quantity as cantidad,
        m.date as fecha,
        m.status,
        u.nombre as usuario_nombre
      FROM movements m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.product_id = $1
      ORDER BY m.date DESC, m.movement_id DESC
      LIMIT 20;
    `;

    const { rows: movimientos } = await pool.query(movimientosQuery, [productoId]);

    const infoQR = {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria,
      cantidad: producto.cantidad,
      unidad: producto.unidad,
      precio: producto.precio,
      ubicacion: producto.ubicacion,
      codigo: producto.codigo,
      stock_minimo: producto.stock_minimo,
      movimientos: movimientos.map(mov => ({
        tipo: mov.tipo,
        cantidad: mov.cantidad,
        fecha: mov.fecha,
        status: mov.status,
        usuario: mov.usuario_nombre || 'Sistema'
      })),
      timestamp: new Date().toISOString()
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(infoQR));
    
    const productoConQR = {
      ...producto,
      qrDataUrl,
      movimientos: infoQR.movimientos
    };

    res.json(productoConQR);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: "Error generando QR del producto" });
  }
});

router.post('/productos/:id/pdf', async (req, res) => {
  const productoId = req.params.id;
  const { qrDataUrl, productoData } = req.body;

  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="producto-${productoId}-${productoData.nombre.replace(/\s+/g, '-')}-qr.pdf"`);
    
    doc.pipe(res);
    
    doc.fontSize(24).text('INFORMACIÓN DEL PRODUCTO', 50, 50, { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(18).text(`${productoData.nombre}`, 50, 100);
    doc.fontSize(12);
    doc.text(`ID: ${productoData.id}`, 50, 130);
    doc.text(`Código: ${productoData.codigo || 'N/A'}`, 50, 150);
    doc.text(`Descripción: ${productoData.descripcion || 'Sin descripción'}`, 50, 170);
    doc.text(`Categoría: ${productoData.categoria}`, 50, 190);
    doc.text(`Cantidad: ${productoData.cantidad} ${productoData.unidad}`, 50, 210);
    doc.text(`Precio Unitario: $${productoData.precio}`, 50, 230);
    doc.text(`Ubicación: ${productoData.ubicacion || 'N/A'}`, 50, 250);
    doc.text(`Stock Mínimo: ${productoData.stock_minimo}`, 50, 270);
    
    if (productoData.movimientos && productoData.movimientos.length > 0) {
      doc.moveDown();
      doc.fontSize(16).text('MOVIMIENTOS RECIENTES', 50, 320);
      doc.fontSize(10);
      
      let yPosition = 350;
      productoData.movimientos.slice(0, 10).forEach((mov, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.text(`${index + 1}. ${mov.tipo.toUpperCase()} - ${mov.cantidad} ${productoData.unidad}`, 50, yPosition);
        doc.text(`   Fecha: ${new Date(mov.fecha).toLocaleDateString('es-ES')}`, 50, yPosition + 15);
        doc.text(`   Usuario: ${mov.usuario}`, 50, yPosition + 30);
        if (mov.descripcion) {
          doc.text(`   Descripción: ${mov.descripcion}`, 50, yPosition + 45);
          yPosition += 60;
        } else {
          yPosition += 45;
        }
      });
    }
    
    doc.addPage();
    doc.fontSize(16).text('CÓDIGO QR', 50, 50, { align: 'center' });
    doc.fontSize(12).text('El código QR contiene toda la información del producto y sus movimientos.', 50, 100, { align: 'center' });
    doc.text('Puede ser escaneado para obtener información actualizada en tiempo real.', 50, 120, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

module.exports = router;