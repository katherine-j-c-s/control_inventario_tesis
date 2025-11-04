import AppDataSource from "../database.js";
import pdf from "pdf-creator-node";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllOrders = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository("Order");
    const orders = await orderRepository.find({
      order: { order_id: "DESC" },
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error obteniendo órdenes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las órdenes",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderRepository = AppDataSource.getRepository("Order");

    const order = await orderRepository.findOne({
      where: { order_id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error obteniendo orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la orden",
    });
  }
};

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    console.log("Datos recibidos en el backend:", orderData);

    // Validaciones básicas
    if (!orderData.supplier) {
      return res.status(400).json({
        success: false,
        message: "El campo 'supplier' es requerido",
      });
    }

    if (!orderData.issue_date) {
      return res.status(400).json({
        success: false,
        message: "El campo 'issue_date' es requerido",
      });
    }

    const orderRepository = AppDataSource.getRepository("Order");
    const newOrder = orderRepository.create({
      ...orderData,
      status: orderData.status || false,
      delivery_status: orderData.delivery_status || "Pending",
    });

    const savedOrder = await orderRepository.save(newOrder);

    res.status(201).json({
      success: true,
      message: "Orden creada exitosamente",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Error creando orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la orden",
    });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const orderRepository = AppDataSource.getRepository("Order");
    const order = await orderRepository.findOne({
      where: { order_id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    // Actualizar campos
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && key !== "order_id") {
        order[key] = updateData[key];
      }
    });

    const updatedOrder = await orderRepository.save(order);

    res.json({
      success: true,
      message: "Orden actualizada exitosamente",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error actualizando orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la orden",
    });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderRepository = AppDataSource.getRepository("Order");

    const order = await orderRepository.findOne({
      where: { order_id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    await orderRepository.remove(order);

    res.json({
      success: true,
      message: "Orden eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la orden",
    });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    const orderRepository = AppDataSource.getRepository("Order");

    const totalOrders = await orderRepository.count();
    const completedOrders = await orderRepository.count({
      where: { status: true },
    });
    const pendingOrders = await orderRepository.count({
      where: { status: false },
    });

    // Calcular total de montos
    const orders = await orderRepository.find({
      select: ["total"],
    });

    const totalAmount = orders.reduce(
      (sum, order) => sum + (parseFloat(order.total) || 0),
      0
    );

    res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalAmount: totalAmount.toFixed(2),
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
    });
  }
};

const getOrderProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const orderRepository = AppDataSource.getRepository("Order");
    const productRepository = AppDataSource.getRepository("Product");

    const order = await orderRepository.findOne({
      where: { order_id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }

    // Obtener productos relacionados a través de order_details
    const query = `
      SELECT 
        p.id,
        p.nombre as name,
        p.descripcion as description,
        p.precio_unitario as unit_price,
        COALESCE(od.quantity, 1) as quantity,
        (COALESCE(od.quantity, 1) * p.precio_unitario) as total
      FROM products p
      LEFT JOIN order_details od ON p.id = od.product_id AND od.order_id = $1
      WHERE od.order_id = $1 OR p.id IN (
        SELECT DISTINCT product_id FROM order_details WHERE order_id = $1
      )
    `;

    const products = await AppDataSource.query(query, [parseInt(id)]);

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error obteniendo productos de la orden:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los productos de la orden",
    });
  }
};

const generateOrderReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Usar SQL directo para evitar problemas con columnas que pueden no existir
    const { pool } = await import("../db.js");
    
    // Verificar si la columna notes existe
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'notes'
      ) as notes_exists;
    `;
    
    const { rows: checkRows } = await pool.query(checkColumnQuery);
    const hasNotesColumn = checkRows[0]?.notes_exists || false;
    
    // Obtener la orden usando SQL directo
    const orderQuery = hasNotesColumn
      ? `
        SELECT 
          order_id,
          supplier,
          status,
          project_id,
          issue_date,
          delivery_date,
          amount,
          total,
          responsible_person,
          delivery_status,
          contact,
          item_quantity,
          company_name,
          company_address,
          notes
        FROM orders
        WHERE order_id = $1
      `
      : `
        SELECT 
          order_id,
          supplier,
          status,
          project_id,
          issue_date,
          delivery_date,
          amount,
          total,
          responsible_person,
          delivery_status,
          contact,
          item_quantity,
          company_name,
          company_address,
          NULL::TEXT as notes
        FROM orders
        WHERE order_id = $1
      `;
    
    const { rows: orderRows } = await pool.query(orderQuery, [parseInt(id)]);
    
    if (!orderRows || orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
      });
    }
    
    const order = orderRows[0];

    // Obtener productos de la orden
    // Nota: order_details puede no existir, así que obtenemos productos directamente si no hay detalles
    const productsQuery = `
      SELECT 
        COALESCE(p.nombre, 'Producto sin nombre') as name,
        COALESCE(p.descripcion, 'Sin descripción') as description,
        COALESCE(od.quantity, 1) as quantity,
        COALESCE(p.precio_unitario, 0) as unit_price,
        (COALESCE(od.quantity, 1) * COALESCE(p.precio_unitario, 0)) as total
      FROM order_details od
      LEFT JOIN products p ON p.id = od.product_id
      WHERE od.order_id = $1
      UNION ALL
      SELECT 
        'Sin productos asociados' as name,
        'Esta orden no tiene productos en order_details' as description,
        0 as quantity,
        0 as unit_price,
        0 as total
      WHERE NOT EXISTS (
        SELECT 1 FROM order_details WHERE order_id = $1
      )
      LIMIT 1;
    `;

    let products;
    try {
      const productsResult = await pool.query(productsQuery, [parseInt(id)]);
      products = productsResult.rows;
      
      // Si no hay productos en order_details, crear un array vacío
      if (products.length === 1 && products[0].name === 'Sin productos asociados') {
        products = [];
      }
    } catch (productsError) {
      console.error('Error obteniendo productos de la orden:', productsError);
      // Si falla la consulta (por ejemplo, si order_details no existe), usar array vacío
      products = [];
    }

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Template HTML para el PDF
    const html = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <style>
      body { 
        font-family: Arial, sans-serif; 
        margin: 40px;
        color: #000000;
        line-height: 1.6;
      }
      h1, h2, h3 {
        color: #000000;
        margin-bottom: 8px;
      }
      h1 {
        text-align: center;
        font-size: 26px;
        margin-bottom: 5px;
      }
      .subheader {
        text-align: center;
        font-size: 14px;
        color: #555;
        margin-bottom: 30px;
      }
      .section { 
        margin: 25px 0;
      }
      .info-row { 
        margin: 4px 0; 
      }
      .label { 
        font-weight: bold; 
        display: inline-block;
        min-width: 150px; 
      }
      .value { 
        color: #333; 
      }
      .total { 
        font-size: 22px; 
        color: #000;
        font-weight: bold; 
        margin-top: 10px;
      }
      .products-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }
      .products-table th, .products-table td {
        border-bottom: 1px solid #ccc;
        padding: 8px 10px;
        text-align: left;
      }
      .products-table th {
        background-color: #f5f5f5;
        font-weight: bold;
      }
      .footer {
        text-align: center;
        margin-top: 40px;
        color: #777;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <h1>ORDEN DE COMPRA</h1>
    <div class="subheader">Orden #${order.order_id}</div>

    <div class="section">
      <h2>Información de la Empresa</h2>
      <div class="info-row">
        <span class="label">Empresa:</span>
        <span class="value">${order.company_name || "N/A"}</span>
      </div>
      <div class="info-row">
        <span class="label">Dirección:</span>
        <span class="value">${order.company_address || "N/A"}</span>
      </div>
    </div>

    <div class="section">
      <h2>Información del Proveedor</h2>
      <div class="info-row">
        <span class="label">Proveedor:</span>
        <span class="value">${order.supplier}</span>
      </div>
      <div class="info-row">
        <span class="label">Contacto:</span>
        <span class="value">${order.contact || "N/A"}</span>
      </div>
    </div>

    <div class="section">
      <h2>Detalles de la Orden</h2>
      <div class="info-row">
        <span class="label">Fecha de Emisión:</span>
        <span class="value">${formatDate(order.issue_date)}</span>
      </div>
      <div class="info-row">
        <span class="label">Fecha de Entrega:</span>
        <span class="value">${formatDate(order.delivery_date)}</span>
      </div>
      <div class="info-row">
        <span class="label">Responsable:</span>
        <span class="value">${order.responsible_person || "N/A"}</span>
      </div>
      <div class="info-row">
        <span class="label">Estado de Entrega:</span>
        <span class="value">${order.delivery_status || "N/A"}</span>
      </div>
      <div class="info-row">
        <span class="label">Cantidad de Ítems:</span>
        <span class="value">${order.item_quantity || 0}</span>
      </div>
    </div>

    <div class="section">
      <h2>Productos de la Orden</h2>
      <table class="products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${
            products && products.length > 0
              ? products
                  .map(
                    (p) => `
                    <tr>
                      <td>${p.name || 'Producto sin nombre'}</td>
                      <td>${p.quantity || 0}</td>
                      <td>$${parseFloat(p.unit_price || 0).toFixed(2)}</td>
                      <td>$${parseFloat(p.total || 0).toFixed(2)}</td>
                    </tr>`
                  )
                  .join("")
              : `<tr><td colspan="4">No hay productos en esta orden.</td></tr>`
          }
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Información Financiera</h2>
      <div class="info-row">
        <span class="label">Monto:</span>
        <span class="value">$${parseFloat(order.amount || 0).toFixed(2)}</span>
      </div>
      <div class="info-row">
        <span class="label">Total:</span>
        <span class="total">$${parseFloat(order.total || 0).toFixed(2)}</span>
      </div>
    </div>

    ${
      order.notes
        ? `
    <div class="section">
      <h2>Observaciones</h2>
      <p>${order.notes}</p>
    </div>
    `
        : ""
    }

    <div class="footer">
      Documento generado el ${new Date().toLocaleDateString(
        "es-ES"
      )} a las ${new Date().toLocaleTimeString("es-ES")}
    </div>
  </body>
</html>
`;

    // Opciones del PDF
    const options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
    };

    // Crear directorio temporal si no existe
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `temp-orden-${id}.pdf`);

    const document = {
      html: html,
      data: {},
      path: tempFilePath,
      type: "",
    };

    try {
      const pdfBuffer = await pdf.create(document, options);
      
      // Esperar un poco para asegurar que el archivo se haya escrito completamente
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!fs.existsSync(tempFilePath)) {
        throw new Error(`El archivo PDF no se creó en: ${tempFilePath}`);
      }
      
      const pdfFile = fs.readFileSync(tempFilePath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="orden-${id}.pdf"`
      );

      res.send(pdfFile);
      
      // Eliminar archivo temporal después de enviarlo
      setTimeout(() => {
        if (fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath);
          } catch (unlinkError) {
            console.error("Error eliminando archivo temporal:", unlinkError);
          }
        }
      }, 1000);
    } catch (pdfError) {
      console.error("Error generando PDF:", pdfError);
      // Intentar eliminar el archivo si existe
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkError) {
          console.error("Error eliminando archivo temporal:", unlinkError);
        }
      }
      throw pdfError;
    }
  } catch (error) {
    console.error("Error generando informe:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar el informe PDF",
      error: error.message,
    });
  }
};

export {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStatistics,
  getOrderProducts,
  generateOrderReport,
};