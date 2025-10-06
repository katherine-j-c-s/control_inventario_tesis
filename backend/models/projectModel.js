import { pool } from '../db.js';

export const projectModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT p.*, 
             COUNT(DISTINCT o.id) as orders_count,
             COUNT(DISTINCT m.id) as movements_count
      FROM projects p
      LEFT JOIN orders o ON p.id = o.project_id
      LEFT JOIN movements m ON p.id = m.project_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT * FROM projects WHERE id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      name, 
      description, 
      start_date, 
      end_date, 
      status, 
      budget, 
      client, 
      manager_id 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO projects (
        name, description, start_date, end_date, status, budget, client, manager_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, description, start_date, end_date, status, budget, client, manager_id]);
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
      UPDATE projects 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM projects WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getByStatus(status) {
    const { rows } = await pool.query(`
      SELECT p.*, 
             COUNT(DISTINCT o.id) as orders_count,
             COUNT(DISTINCT m.id) as movements_count
      FROM projects p
      LEFT JOIN orders o ON p.id = o.project_id
      LEFT JOIN movements m ON p.id = m.project_id
      WHERE p.status = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [status]);
    return rows;
  },

  async getByManager(managerId) {
    const { rows } = await pool.query(`
      SELECT p.*, 
             COUNT(DISTINCT o.id) as orders_count,
             COUNT(DISTINCT m.id) as movements_count
      FROM projects p
      LEFT JOIN orders o ON p.id = o.project_id
      LEFT JOIN movements m ON p.id = m.project_id
      WHERE p.manager_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [managerId]);
    return rows;
  },

  async getActiveProjects() {
    const { rows } = await pool.query(`
      SELECT p.*, 
             COUNT(DISTINCT o.id) as orders_count,
             COUNT(DISTINCT m.id) as movements_count
      FROM projects p
      LEFT JOIN orders o ON p.id = o.project_id
      LEFT JOIN movements m ON p.id = m.project_id
      WHERE p.status IN ('active', 'in_progress')
      GROUP BY p.id
      ORDER BY p.start_date DESC
    `);
    return rows;
  }
};
