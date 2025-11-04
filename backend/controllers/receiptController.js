import {
  getUnverifiedReceipts,
  getAllReceipts,
  verifyReceipt,
  getVerifiedReceipts,
  getReceiptsByStatus,
  getReceiptsStatistics,
} from "../models/Receipt.js";
import FileProcessor from "../services/fileProcessor.js"

async function getUnverified(req, res) {
  try {
    const data = await getUnverifiedReceipts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAll(req, res) {
  try {
    const data = await getAllReceipts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function verify(req, res) {
  try {
    const { id } = req.params;
    const data = await verifyReceipt(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getVerified(req, res) {
  try {
    const data = await getVerifiedReceipts();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getByStatus(req, res) {
  try {
    const { status } = req.params;
    const data = await getReceiptsByStatus(status);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getStatistics(req, res) {
  try {
    const data = await getReceiptsStatistics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const createReceipt = async (req, res) => {
  try {
    const { warehouse_id, entry_date, order_id, status, products } = req.body;

    // Validar datos requeridos
    if (
      !warehouse_id ||
      !entry_date ||
      !products ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        error:
          "Datos requeridos: warehouse_id, entry_date y products (array no vacío)",
      });
    }

    const { pool } = await import("../db.js");

    // Iniciar transacción
    await pool.query("BEGIN");

    try {
      // 1. Insertar el remito
      const receiptQuery = `
                INSERT INTO receipts (warehouse_id, entry_date, order_id, status, verification_status)
                VALUES ($1, $2, $3, $4, false)
                RETURNING receipt_id;
            `;
      const { rows: receiptRows } = await pool.query(receiptQuery, [
        warehouse_id,
        entry_date,
        order_id || null,
        status || "Pending",
      ]);

      const receiptId = receiptRows[0].receipt_id;

      // 2. Procesar cada producto
      const productIds = [];
      for (const product of products) {
        const { name, description, quantity, unit_price } = product;

        if (!name || !quantity) {
          throw new Error(
            `Producto inválido: nombre y cantidad son requeridos`
          );
        }

        // Buscar si el producto ya existe por nombre
        let productId;
        const existingProductQuery = `
                    SELECT id FROM products 
                    WHERE LOWER(nombre) = LOWER($1) AND activo = true
                    LIMIT 1;
                `;
        const { rows: existingRows } = await pool.query(existingProductQuery, [
          name,
        ]);

        if (existingRows.length > 0) {
          // Producto existe, usar su ID
          productId = existingRows[0].id;

          // Actualizar stock si se proporciona precio
          if (unit_price) {
            await pool.query(
              `
                            UPDATE products 
                            SET stock_actual = stock_actual + $1,
                                precio_unitario = $2,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = $3;
                        `,
              [quantity, unit_price, productId]
            );
          } else {
            await pool.query(
              `
                            UPDATE products 
                            SET stock_actual = stock_actual + $1,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = $2;
                        `,
              [quantity, productId]
            );
          }
        } else {
          // Crear nuevo producto
          const newProductQuery = `
                        INSERT INTO products (
                            nombre, codigo, categoria, descripcion, unidad_medida, 
                            precio_unitario, stock_minimo, stock_actual, ubicacion, 
                            activo, created_at, updated_at
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id;
                    `;
          const { rows: newProductRows } = await pool.query(newProductQuery, [
            name,
            description || `PROD-${Date.now()}`, // Código único si no se proporciona
            "General",
            description || "",
            "unidad",
            unit_price || 0,
            0, // stock_minimo
            quantity,
            "Almacén", // ubicacion
          ]);
          productId = newProductRows[0].id;
        }

        productIds.push(productId);

        // 3. Crear relación en receipt_products
        await pool.query(
          `
                    INSERT INTO receipt_products (receipt_id, product_id, quantity)
                    VALUES ($1, $2, $3);
                `,
          [receiptId, productId, quantity]
        );
      }

      // 4. No necesitamos actualizar quantity_products ya que no existe en la tabla

      // Confirmar transacción
      await pool.query("COMMIT");

      res.json({
        success: true,
        message: "Remito cargado correctamente con sus productos.",
        receipt_id: receiptId,
        products_created: productIds.length,
        data: {
          receipt_id: receiptId,
          warehouse_id,
          entry_date,
          order_id,
          status: status || "Pending",
          products_count: products.length,
        },
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creando remito:", error);
    res.status(500).json({
      error: "Error al guardar remito o productos: " + error.message,
    });
  }
};

const updateReceipt = async (req, res) => {
  try {
    const data = await updateReceipt(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const data = await deleteReceipt(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = await import("../db.js");
    
    const query = `
      SELECT 
        r.receipt_id as id,
        r.warehouse_id,
        COALESCE((
          SELECT COUNT(*)::INTEGER 
          FROM receipt_products rp 
          WHERE rp.receipt_id = r.receipt_id
        ), 0) as quantity_products,
        r.entry_date,
        r.verification_status,
        r.order_id,
        NULL::INTEGER as product_id,
        r.status
      FROM receipts r
      WHERE r.receipt_id = $1 
      AND (r.status != 'deleted' OR r.status IS NULL);
    `;
    
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Remito no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error obteniendo remito:", error);
    res.status(500).json({ error: error.message });
  }
};

const getReceiptWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { pool } = await import("../db.js");

    const query = `
            SELECT 
                r.receipt_id,
                r.warehouse_id,
                r.entry_date,
                r.verification_status,
                r.order_id,
                r.status,
                rp.product_id,
                rp.quantity,
                p.nombre as product_name,
                p.descripcion as product_description,
                p.categoria as product_category,
                p.unidad_medida as product_unit,
                p.precio_unitario as product_price
            FROM receipts r
            LEFT JOIN receipt_products rp ON r.receipt_id = rp.receipt_id
            LEFT JOIN products p ON rp.product_id = p.id AND p.activo = true
            WHERE r.receipt_id = $1
            ORDER BY p.nombre;
        `;

    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Remito no encontrado" });
    }

    const receipt = {
      receipt_id: rows[0].receipt_id,
      warehouse_id: rows[0].warehouse_id,
      quantity_products: 0,
      entry_date: rows[0].entry_date,
      verification_status: rows[0].verification_status,
      order_id: rows[0].order_id,
      status: rows[0].status,
      products: [],
    };

    rows.forEach((row) => {
      if (row.product_id) {
        receipt.products.push({
          product_id: row.product_id,
          product_name: row.product_name,
          product_description: row.product_description,
          product_category: row.product_category,
          product_unit: row.product_unit,
          product_price: row.product_price,
          quantity: row.quantity,
        });
      }
    });

    receipt.quantity_products = receipt.products.length;

    res.json(receipt);
  } catch (error) {
    console.error("Error obteniendo remito con productos:", error);
    res.status(500).json({ error: error.message });
  }
};

// 
const uploadReceiptFile = async (req, res) => {
  try {
    console.log("📁 Iniciando procesamiento de archivo...");
    console.log("📋 Headers:", req.headers);
    console.log("📋 Body:", req.body);
    console.log("📋 File:", req.file);
    console.log("📋 Files:", req.files);

    // ✅ Verificar que multer haya recibido el archivo
    if (!req.file) {
      console.log("❌ No se encontró archivo en req.file");
      return res.status(400).json({
        error: "No se proporcionó ningún archivo",
      });
    }

    // ✅ Definir filePath y tipo ANTES de usarlo
    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    console.log("📂 Ruta del archivo:", filePath);
    console.log("📄 Tipo de archivo:", fileType);
    console.log("🔧 FileProcessor module loaded:", FileProcessor);

    // ✅ Procesar archivo según su tipo
    let processedData;
    if (fileType === "application/pdf") {
      processedData = await FileProcessor.processPDF(filePath);
    } else if (fileType.startsWith("image/")) {
      processedData = await FileProcessor.processImage(filePath);
    } else if (
      fileType === "text/csv" ||
      fileType === "text/plain" ||
      fileType === "application/csv"
    ) {
      processedData = await FileProcessor.processCSV(filePath);
    } else {
      throw new Error("Tipo de archivo no soportado");
    }

    if (!processedData.success) {
      throw new Error("Error al procesar el archivo");
    }

    const { pool } = await import("../db.js");
    const { warehouse_id, entry_date, order_id, status, products } = processedData.data;

    if (!products || products.length === 0) {
      throw new Error("No se pudieron extraer productos del archivo");
    }

    // ✅ Iniciar transacción
    await pool.query("BEGIN");

    try {
      const receiptQuery = `
        INSERT INTO receipts (warehouse_id, entry_date, order_id, status, verification_status)
        VALUES ($1, $2, $3, $4, false)
        RETURNING receipt_id;
      `;

      const { rows: receiptRows } = await pool.query(receiptQuery, [
        warehouse_id,
        entry_date,
        order_id || null,
        status || "Pending",
      ]);

      const receiptId = receiptRows[0].receipt_id;

      // Procesar productos
      const productIds = [];
      for (const product of products) {
        const { name, description, quantity, unit_price } = product;

        if (!name || !quantity) {
          throw new Error(`Producto inválido: nombre y cantidad son requeridos`);
        }

        // Validar que quantity no exceda el límite de INTEGER en PostgreSQL (2,147,483,647)
        if (quantity > 2147483647 || quantity < 0) {
          console.warn(`⚠️ Cantidad inválida detectada: ${quantity}. Ajustando a valor razonable.`);
          product.quantity = Math.min(Math.max(parseInt(quantity) || 1, 1), 999999);
        }

        const existingProductQuery = `
          SELECT id FROM products 
          WHERE LOWER(nombre) = LOWER($1) AND activo = true
          LIMIT 1;
        `;
        const { rows: existingRows } = await pool.query(existingProductQuery, [name]);

        let productId;

        if (existingRows.length > 0) {
          productId = existingRows[0].id;
          if (unit_price) {
            await pool.query(
              `
              UPDATE products 
              SET stock_actual = stock_actual + $1,
                  precio_unitario = $2,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $3;
              `,
              [quantity, unit_price, productId]
            );
          } else {
            await pool.query(
              `
              UPDATE products 
              SET stock_actual = stock_actual + $1,
                  updated_at = CURRENT_TIMESTAMP
              WHERE id = $2;
              `,
              [quantity, productId]
            );
          }
        } else {
          const newProductQuery = `
            INSERT INTO products (
                nombre, codigo, categoria, descripcion, unidad_medida, 
                precio_unitario, stock_minimo, stock_actual, ubicacion, 
                activo, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id;
          `;
          const { rows: newProductRows } = await pool.query(newProductQuery, [
            name,
            description || `PROD-${Math.floor(Math.random() * 1000000)}`,
            "General",
            description || "",
            "unidad",
            unit_price || 0,
            0,
            quantity,
            "Almacén",
          ]);
          productId = newProductRows[0].id;
        }

        productIds.push(productId);

        await pool.query(
          `
          INSERT INTO receipt_products (receipt_id, product_id, quantity)
          VALUES ($1, $2, $3);
          `,
          [receiptId, productId, quantity]
        );
      }

      await pool.query("COMMIT");

      // ✅ Eliminar archivo temporal
      const fs = await import("fs");
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `Archivo procesado correctamente. Se creó el remito #${receiptId} con ${products.length} productos.`,
        receipt_id: receiptId,
        products_created: productIds.length,
        data: {
          receipt_id: receiptId,
          warehouse_id,
          entry_date,
          order_id,
          status: status || "Pending",
          products_count: products.length,
        },
      });
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error procesando archivo:", error);
    res.status(500).json({
      error: "Error al procesar archivo: " + error.message,
    });
  }
};


const getWarehouses = async (req, res) => {
  try {
    const { pool } = await import("../db.js");

    const query = `
            SELECT 
                warehouse_id as id,
                name,
                address_sector as location,
                address_sector,
                0 as latitude,
                0 as longitude,
                COALESCE(capacity, 0) as capacity
            FROM warehouses
            ORDER BY name;
        `;

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error obteniendo almacenes:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getUnverified,
  getAll,
  verify,
  getVerified,
  getByStatus,
  getStatistics,
  getWarehouses,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getReceiptById,
  getReceiptWithProducts,
  uploadReceiptFile,
};