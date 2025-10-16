import express from "express";
import QRCode from "qrcode";
import { pool } from "../db.js";
import upload from "../middleware/fileUpload.js";
import {
  getUnverified,
  getAll,
  verify,
  getVerified,
  getByStatus,
  getStatistics,
  getReceiptWithProducts,
  createReceipt,
  uploadReceiptFile,
  getWarehouses,
} from "../controllers/receiptController.js";

const router = express.Router();

router.get("/receipts", getAll);
router.get("/receipts/unverified", getUnverified);
router.get("/receipts/verified", getVerified);
router.get("/receipts/status/:status", getByStatus);
router.get("/receipts/statistics", getStatistics);
router.get("/receipts/:id", getReceiptWithProducts);
router.get("/warehouses", getWarehouses);

router.post("/receipts", createReceipt);
router.post("/receipts/upload", upload.single("file"), uploadReceiptFile);

router.put("/receipts/verify/:id", verify);

router.get("/remitos/:id/productos", async (req, res) => {
  const remitoId = req.params.id;

  try {
    // Primero verificar si el remito existe y está verificado
    const remitoQuery = `
      SELECT 
        r.receipt_id,
        r.verification_status,
        r.status
      FROM receipts r
      WHERE r.receipt_id = $1;
    `;

    const { rows: remitoRows } = await pool.query(remitoQuery, [remitoId]);

    if (remitoRows.length === 0) {
      return res.status(404).json({ error: "Remito no encontrado" });
    }

    const remito = remitoRows[0];

    // Buscar productos del remito usando la tabla receipt_products
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
        rp.quantity as cantidad_remito,
        r.receipt_id,
        r.entry_date as fecha_remito,
        r.verification_status as verificado
      FROM products p
      INNER JOIN receipt_products rp ON p.id = rp.product_id
      INNER JOIN receipts r ON rp.receipt_id = r.receipt_id
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

        const { rows: movimientos } = await pool.query(movimientosQuery, [
          producto.id,
        ]);

        return {
          ...producto,
          cantidad: producto.cantidad_remito, // Usar la cantidad del remito
          verificado: producto.verificado,
          movimientos: movimientos.map((mov) => ({
            tipo: mov.tipo,
            cantidad: mov.cantidad,
            fecha: mov.fecha,
            status: mov.status,
            usuario: mov.usuario_nombre || "Sistema",
          })),
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
          verificado: prod.verificado,
          movimientos: prod.movimientos,
          timestamp: new Date().toISOString(),
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(infoQR));
        return {
          ...prod,
          qrDataUrl,
        };
      })
    );

    res.json(productosConQR);
  } catch (error) {
    console.error("Error obteniendo productos del remito:", error);
    res.status(500).json({ error: "Error generando QR de productos" });
  }
});

router.get("/productos/:id", async (req, res) => {
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

    const { rows: movimientos } = await pool.query(movimientosQuery, [
      productoId,
    ]);

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
      movimientos: movimientos.map((mov) => ({
        tipo: mov.tipo,
        cantidad: mov.cantidad,
        fecha: mov.fecha,
        status: mov.status,
        usuario: mov.usuario_nombre || "Sistema",
      })),
      timestamp: new Date().toISOString(),
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(infoQR));

    const productoConQR = {
      ...producto,
      qrDataUrl,
      movimientos: infoQR.movimientos,
    };

    res.json(productoConQR);
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({ error: "Error generando QR del producto" });
  }
});
router.post('/productos/:id/pdf', async (req, res) => {
  const productoId = req.params.id;
  const { qrDataUrl, productoData } = req.body;

  try {
    const pdfkit = await import('pdfkit');
    const PDFDocument = pdfkit.default;
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="producto-${productoId}-${productoData.nombre.replace(/\s+/g, '-')}-qr.pdf"`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(24).text('INFORMACIÓN DEL PRODUCTO', { align: 'center' });
    doc.moveDown(1.5);

    // Datos del producto
    doc.fontSize(18).text(`${productoData.nombre}`);
    doc.fontSize(12);
    doc.text(`ID: ${productoData.id}`);
    doc.text(`Código: ${productoData.codigo || 'N/A'}`);
    doc.text(`Descripción: ${productoData.descripcion || 'Sin descripción'}`);
    doc.text(`Categoría: ${productoData.categoria}`);
    doc.text(`Cantidad: ${productoData.cantidad} ${productoData.unidad}`);
    doc.text(`Precio Unitario: $${productoData.precio}`);
    doc.text(`Ubicación: ${productoData.ubicacion || 'N/A'}`);
    doc.text(`Stock Mínimo: ${productoData.stock_minimo}`);
    doc.moveDown();

    // Movimientos
    if (productoData.movimientos && productoData.movimientos.length > 0) {
      doc.fontSize(16).text('MOVIMIENTOS RECIENTES', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      let y = doc.y;
      productoData.movimientos.slice(0, 10).forEach((mov, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(`${index + 1}. ${mov.tipo.toUpperCase()} - ${mov.cantidad} ${productoData.unidad}`, 50, y);
        doc.text(`   Fecha: ${new Date(mov.fecha).toLocaleDateString('es-ES')}`, 50, y + 12);
        doc.text(`   Usuario: ${mov.usuario}`, 50, y + 24);
        if (mov.descripcion) {
          doc.text(`   Descripción: ${mov.descripcion}`, 50, y + 36);
          y += 50;
        } else {
          y += 36;
        }
      });
    }

    // Nueva página con QR
    doc.addPage();
    doc.fontSize(18).text('CÓDIGO QR DEL PRODUCTO', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text('Escanea este código para ver los detalles actualizados del producto.', { align: 'center' });

    // Convertir base64 a imagen
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrBase64, 'base64');

    // Agregar QR al PDF
    doc.image(qrBuffer, (doc.page.width - 200) / 2, doc.y + 20, { width: 200 });

    doc.end();
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

// router.post("/productos/:id/pdf", async (req, res) => {
//   // const productoId = req.params.id;
//   // const { qrDataUrl, productoData } = req.body;
//   const pdfkit = await import("pdfkit");
//   const PDFDocument = pdfkit.default;
//   const doc = new PDFDocument();
//   try {
//     const PDFDocument = await import("pdfkit");
//     const doc = new PDFDocument();

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="producto-${productoId}-${productoData.nombre.replace(
//         /\s+/g,
//         "-"
//       )}-qr.pdf"`
//     );

//     doc.pipe(res);

//     doc
//       .fontSize(24)
//       .text("INFORMACIÓN DEL PRODUCTO", 50, 50, { align: "center" });
//     doc.moveDown();

//     doc.fontSize(18).text(`${productoData.nombre}`, 50, 100);
//     doc.fontSize(12);
//     doc.text(`ID: ${productoData.id}`, 50, 130);
//     doc.text(`Código: ${productoData.codigo || "N/A"}`, 50, 150);
//     doc.text(
//       `Descripción: ${productoData.descripcion || "Sin descripción"}`,
//       50,
//       170
//     );
//     doc.text(`Categoría: ${productoData.categoria}`, 50, 190);
//     doc.text(
//       `Cantidad: ${productoData.cantidad} ${productoData.unidad}`,
//       50,
//       210
//     );
//     doc.text(`Precio Unitario: $${productoData.precio}`, 50, 230);
//     doc.text(`Ubicación: ${productoData.ubicacion || "N/A"}`, 50, 250);
//     doc.text(`Stock Mínimo: ${productoData.stock_minimo}`, 50, 270);

//     if (productoData.movimientos && productoData.movimientos.length > 0) {
//       doc.moveDown();
//       doc.fontSize(16).text("MOVIMIENTOS RECIENTES", 50, 320);
//       doc.fontSize(10);

//       let yPosition = 350;
//       productoData.movimientos.slice(0, 10).forEach((mov, index) => {
//         if (yPosition > 700) {
//           doc.addPage();
//           yPosition = 50;
//         }

//         doc.text(
//           `${index + 1}. ${mov.tipo.toUpperCase()} - ${mov.cantidad} ${
//             productoData.unidad
//           }`,
//           50,
//           yPosition
//         );
//         doc.text(
//           `   Fecha: ${new Date(mov.fecha).toLocaleDateString("es-ES")}`,
//           50,
//           yPosition + 15
//         );
//         doc.text(`   Usuario: ${mov.usuario}`, 50, yPosition + 30);
//         if (mov.descripcion) {
//           doc.text(`   Descripción: ${mov.descripcion}`, 50, yPosition + 45);
//           yPosition += 60;
//         } else {
//           yPosition += 45;
//         }
//       });
//     }

//     doc.addPage();
//     doc.fontSize(16).text("CÓDIGO QR", 50, 50, { align: "center" });
//     doc
//       .fontSize(12)
//       .text(
//         "El código QR contiene toda la información del producto y sus movimientos.",
//         50,
//         100,
//         { align: "center" }
//       );
//     doc.text(
//       "Puede ser escaneado para obtener información actualizada en tiempo real.",
//       50,
//       120,
//       { align: "center" }
//     );

//     doc.end();
//   } catch (error) {
//     console.error("Error generando PDF:", error);
//     res.status(500).json({ error: "Error generando PDF" });
//   }
// });

export default router;
