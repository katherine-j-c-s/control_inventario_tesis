const express = require('express');
const { pool } = require('../db');
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

module.exports = router;
