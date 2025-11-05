import express from 'express';
import { pool } from '../db.js';
const router = express.Router();

// Obtener todos los productos
router.get('/productos', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        p.categoria,
        p.descripcion,
        p.unidad_medida,
        p.precio_unitario,
        p.stock_minimo,
        p.stock_actual,
        p.ubicacion,
        p.qr_code,
        p.activo,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.activo = true
      ORDER BY p.nombre;
    `;

    const { rows: productos } = await pool.query(query);
    res.json(productos);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener producto por ID
router.get('/productos/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const query = `
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        p.categoria,
        p.descripcion,
        p.unidad_medida,
        p.precio_unitario,
        p.stock_minimo,
        p.stock_actual,
        p.ubicacion,
        p.qr_code,
        p.activo,
        p.created_at,
        p.updated_at
      FROM products p
      WHERE p.id = $1 AND p.activo = true;
    `;

    const { rows: productos } = await pool.query(query, [productId]);

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productos[0]);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo producto
router.post('/productos', async (req, res) => {
  try {
    const {
      nombre,
      codigo,
      categoria,
      descripcion,
      unidad_medida,
      precio_unitario,
      stock_minimo,
      stock_actual,
      ubicacion
    } = req.body;

    const query = `
      INSERT INTO products (
        nombre, codigo, categoria, descripcion, unidad_medida,
        precio_unitario, stock_minimo, stock_actual, ubicacion, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      nombre, codigo, categoria, descripcion, unidad_medida,
      precio_unitario, stock_minimo, stock_actual, ubicacion
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar producto
router.put('/productos/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const {
      nombre,
      codigo,
      categoria,
      descripcion,
      unidad_medida,
      precio_unitario,
      stock_minimo,
      stock_actual,
      ubicacion
    } = req.body;

    const query = `
      UPDATE products SET
        nombre = $1,
        codigo = $2,
        categoria = $3,
        descripcion = $4,
        unidad_medida = $5,
        precio_unitario = $6,
        stock_minimo = $7,
        stock_actual = $8,
        ubicacion = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND activo = true
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      nombre, codigo, categoria, descripcion, unidad_medida,
      precio_unitario, stock_minimo, stock_actual, ubicacion, productId
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto (soft delete)
router.delete('/productos/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const query = `
      UPDATE products SET
        activo = false,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [productId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint específico para egreso de producto (resta cantidad del stock)
router.post('/productos/:id/egreso', async (req, res) => {
  const productId = req.params.id;
  const { cantidad } = req.body;

  console.log(`📦 Iniciando egreso de producto ID: ${productId}, cantidad: ${cantidad}`);

  try {
    // Validar que se envió la cantidad
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ 
        error: 'Cantidad inválida',
        message: 'Debe especificar una cantidad mayor a 0'
      });
    }

    // Verificar que el producto existe y está activo
    const checkQuery = `
      SELECT id, nombre, codigo, stock_actual, activo
      FROM products 
      WHERE id = $1;
    `;

    const { rows: productRows } = await pool.query(checkQuery, [productId]);

    if (productRows.length === 0) {
      console.log(`❌ Producto ${productId} no encontrado en la base de datos`);
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        message: 'El producto no existe en la base de datos'
      });
    }

    const product = productRows[0];
    
    // Verificar si ya está inactivo
    if (!product.activo) {
      console.log(`⚠️ Producto ${productId} ya estaba eliminado`);
      return res.status(400).json({ 
        error: 'Producto no disponible',
        message: 'El producto ya ha sido eliminado del inventario'
      });
    }

    console.log(`📦 Producto encontrado: ${product.nombre} (${product.codigo}) - Stock actual: ${product.stock_actual}`);

    // Verificar que hay suficiente stock
    if (product.stock_actual < cantidad) {
      console.log(`❌ Stock insuficiente. Disponible: ${product.stock_actual}, Solicitado: ${cantidad}`);
      return res.status(400).json({ 
        error: 'Stock insuficiente',
        message: `Stock disponible: ${product.stock_actual}, cantidad solicitada: ${cantidad}`
      });
    }

    // Calcular nuevo stock
    const nuevoStock = product.stock_actual - cantidad;
    console.log(`🔢 Calculando nuevo stock: ${product.stock_actual} - ${cantidad} = ${nuevoStock}`);

    let updateQuery;
    let updateValues;
    let actionMessage;

    if (nuevoStock === 0) {
      // Si el stock queda en 0, eliminar el producto (soft delete)
      updateQuery = `
        UPDATE products SET
          stock_actual = $2,
          activo = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND activo = true
        RETURNING id, nombre, codigo, stock_actual, activo;
      `;
      updateValues = [productId, nuevoStock];
      actionMessage = 'Producto eliminado del inventario (stock agotado)';
      console.log(`🗑️ Stock llegó a 0, eliminando producto del inventario`);
    } else {
      // Si queda stock, solo actualizar la cantidad
      updateQuery = `
        UPDATE products SET
          stock_actual = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND activo = true
        RETURNING id, nombre, codigo, stock_actual, activo;
      `;
      updateValues = [productId, nuevoStock];
      actionMessage = `Stock actualizado. Cantidad restante: ${nuevoStock}`;
      console.log(`📊 Actualizando stock a ${nuevoStock} unidades`);
    }

    const { rows: updatedRows } = await pool.query(updateQuery, updateValues);

    if (updatedRows.length === 0) {
      console.log(`❌ No se pudo actualizar el producto ${productId}`);
      return res.status(500).json({ 
        error: 'Error al procesar el egreso',
        message: 'No se pudo actualizar el stock del producto'
      });
    }

    const updatedProduct = updatedRows[0];
    console.log(`✅ Producto ${productId} actualizado exitosamente: ${updatedProduct.nombre}`);

    // Verificar el resultado final
    const verifyQuery = `
      SELECT stock_actual, activo FROM products WHERE id = $1;
    `;
    const { rows: verifyRows } = await pool.query(verifyQuery, [productId]);
    
    if (verifyRows.length > 0) {
      const finalState = verifyRows[0];
      console.log(`✅ Verificación exitosa: Stock final: ${finalState.stock_actual}, Activo: ${finalState.activo}`);
    }

    res.json({ 
      message: actionMessage,
      success: true,
      product: {
        id: updatedProduct.id,
        nombre: updatedProduct.nombre,
        codigo: updatedProduct.codigo,
        stock_anterior: product.stock_actual,
        cantidad_egresada: cantidad,
        stock_actual: updatedProduct.stock_actual,
        eliminado: !updatedProduct.activo
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando egreso de producto:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'Error al procesar el egreso del producto',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;