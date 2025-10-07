import { pool } from '../db.js';

export const movementModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT m.*, p.nombre as product_name, w.nombre as warehouse_name 
      FROM movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN warehouses w ON m.warehouse_id = w.id
      ORDER BY m.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT m.*, p.nombre as product_name, w.nombre as warehouse_name 
      FROM movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN warehouses w ON m.warehouse_id = w.id
      WHERE m.id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      product_id, 
      warehouse_id, 
      movement_type, 
      quantity, 
      unit_price, 
      total_value, 
      reference_document, 
      notes, 
      user_id 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO movements (
        product_id, warehouse_id, movement_type, quantity, 
        unit_price, total_value, reference_document, notes, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      product_id, warehouse_id, movement_type, quantity, 
      unit_price, total_value, reference_document, notes, user_id
    ]);
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(data[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(id);
    const { rows } = await pool.query(`
      UPDATE movements 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM movements WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getByProduct(productId) {
    const { rows } = await pool.query(`
      SELECT m.*, w.nombre as warehouse_name 
      FROM movements m
      LEFT JOIN warehouses w ON m.warehouse_id = w.id
      WHERE m.product_id = $1
      ORDER BY m.created_at DESC
    `, [productId]);
    return rows;
  },

  async getByWarehouse(warehouseId) {
    const { rows } = await pool.query(`
      SELECT m.*, p.nombre as product_name 
      FROM movements m
      LEFT JOIN products p ON m.product_id = p.id
      WHERE m.warehouse_id = $1
      ORDER BY m.created_at DESC
    `, [warehouseId]);
    return rows;
  }
};
