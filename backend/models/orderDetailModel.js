import { pool } from '../db.js';

export const orderDetailModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT od.*, o.order_number, p.nombre as product_name, p.codigo as product_code
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      LEFT JOIN products p ON od.product_id = p.id
      ORDER BY od.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT od.*, o.order_number, p.nombre as product_name, p.codigo as product_code
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      LEFT JOIN products p ON od.product_id = p.id
      WHERE od.id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      order_id, 
      product_id, 
      quantity, 
      unit_price, 
      total_price, 
      notes 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO order_details (
        order_id, product_id, quantity, unit_price, total_price, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [order_id, product_id, quantity, unit_price, total_price, notes]);
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
      UPDATE order_details 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM order_details WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getByOrder(orderId) {
    const { rows } = await pool.query(`
      SELECT od.*, p.nombre as product_name, p.codigo as product_code, p.unidad_medida
      FROM order_details od
      LEFT JOIN products p ON od.product_id = p.id
      WHERE od.order_id = $1
      ORDER BY od.created_at ASC
    `, [orderId]);
    return rows;
  },

  async getByProduct(productId) {
    const { rows } = await pool.query(`
      SELECT od.*, o.order_number, o.status as order_status
      FROM order_details od
      LEFT JOIN orders o ON od.order_id = o.id
      WHERE od.product_id = $1
      ORDER BY od.created_at DESC
    `, [productId]);
    return rows;
  },

  async deleteByOrder(orderId) {
    const { rows } = await pool.query(`
      DELETE FROM order_details WHERE order_id = $1 RETURNING *
    `, [orderId]);
    return rows;
  }
};
