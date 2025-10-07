import { pool } from '../db.js';

export const warehouseModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT w.*, 
             COUNT(DISTINCT m.id) as movements_count,
             COUNT(DISTINCT o.id) as orders_count
      FROM warehouses w
      LEFT JOIN movements m ON w.id = m.warehouse_id
      LEFT JOIN orders o ON w.id = o.warehouse_id
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT * FROM warehouses WHERE id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      name, 
      description, 
      location, 
      capacity, 
      manager_id, 
      is_active 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO warehouses (
        name, description, location, capacity, manager_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, location, capacity, manager_id, is_active]);
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
      UPDATE warehouses 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM warehouses WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getActiveWarehouses() {
    const { rows } = await pool.query(`
      SELECT w.*, 
             COUNT(DISTINCT m.id) as movements_count,
             COUNT(DISTINCT o.id) as orders_count
      FROM warehouses w
      LEFT JOIN movements m ON w.id = m.warehouse_id
      LEFT JOIN orders o ON w.id = o.warehouse_id
      WHERE w.is_active = true
      GROUP BY w.id
      ORDER BY w.name ASC
    `);
    return rows;
  },

  async getByManager(managerId) {
    const { rows } = await pool.query(`
      SELECT w.*, 
             COUNT(DISTINCT m.id) as movements_count,
             COUNT(DISTINCT o.id) as orders_count
      FROM warehouses w
      LEFT JOIN movements m ON w.id = m.warehouse_id
      LEFT JOIN orders o ON w.id = o.warehouse_id
      WHERE w.manager_id = $1
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `, [managerId]);
    return rows;
  },

  async deactivateWarehouse(id) {
    const { rows } = await pool.query(`
      UPDATE warehouses 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    return rows[0];
  },

  async activateWarehouse(id) {
    const { rows } = await pool.query(`
      UPDATE warehouses 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    return rows[0];
  }
};
