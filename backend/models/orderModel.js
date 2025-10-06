import { pool } from '../db.js';

export const orderModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT o.*, p.nombre as project_name, w.nombre as warehouse_name,
             COUNT(od.id) as items_count,
             SUM(od.quantity * od.unit_price) as total_amount
      FROM orders o
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      LEFT JOIN order_details od ON o.id = od.order_id
      GROUP BY o.id, p.nombre, w.nombre
      ORDER BY o.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT o.*, p.nombre as project_name, w.nombre as warehouse_name
      FROM orders o
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      WHERE o.id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      order_number, 
      project_id, 
      warehouse_id, 
      supplier, 
      order_date, 
      expected_date, 
      status, 
      notes, 
      user_id 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO orders (
        order_number, project_id, warehouse_id, supplier, 
        order_date, expected_date, status, notes, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      order_number, project_id, warehouse_id, supplier, 
      order_date, expected_date, status, notes, user_id
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
      UPDATE orders 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM orders WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getByProject(projectId) {
    const { rows } = await pool.query(`
      SELECT o.*, w.nombre as warehouse_name,
             COUNT(od.id) as items_count,
             SUM(od.quantity * od.unit_price) as total_amount
      FROM orders o
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      LEFT JOIN order_details od ON o.id = od.order_id
      WHERE o.project_id = $1
      GROUP BY o.id, w.nombre
      ORDER BY o.created_at DESC
    `, [projectId]);
    return rows;
  },

  async getByStatus(status) {
    const { rows } = await pool.query(`
      SELECT o.*, p.nombre as project_name, w.nombre as warehouse_name,
             COUNT(od.id) as items_count,
             SUM(od.quantity * od.unit_price) as total_amount
      FROM orders o
      LEFT JOIN projects p ON o.project_id = p.id
      LEFT JOIN warehouses w ON o.warehouse_id = w.id
      LEFT JOIN order_details od ON o.id = od.order_id
      WHERE o.status = $1
      GROUP BY o.id, p.nombre, w.nombre
      ORDER BY o.created_at DESC
    `, [status]);
    return rows;
  }
};
