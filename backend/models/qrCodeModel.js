import { pool } from '../db.js';

export const qrCodeModel = {
  async getAll() {
    const { rows } = await pool.query(`
      SELECT q.*, p.nombre as product_name, p.codigo as product_code
      FROM qr_codes q
      LEFT JOIN products p ON q.product_id = p.id
      ORDER BY q.created_at DESC
    `);
    return rows;
  },

  async getById(id) {
    const { rows } = await pool.query(`
      SELECT q.*, p.nombre as product_name, p.codigo as product_code
      FROM qr_codes q
      LEFT JOIN products p ON q.product_id = p.id
      WHERE q.id = $1
    `, [id]);
    return rows[0];
  },

  async create(data) {
    const { 
      product_id, 
      qr_data, 
      qr_image_url, 
      is_active 
    } = data;
    
    const { rows } = await pool.query(`
      INSERT INTO qr_codes (
        product_id, qr_data, qr_image_url, is_active
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [product_id, qr_data, qr_image_url, is_active]);
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
      UPDATE qr_codes 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);
    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(`
      DELETE FROM qr_codes WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  },

  async getByProduct(productId) {
    const { rows } = await pool.query(`
      SELECT * FROM qr_codes WHERE product_id = $1 ORDER BY created_at DESC
    `, [productId]);
    return rows;
  },

  async getByQrData(qrData) {
    const { rows } = await pool.query(`
      SELECT q.*, p.nombre as product_name, p.codigo as product_code
      FROM qr_codes q
      LEFT JOIN products p ON q.product_id = p.id
      WHERE q.qr_data = $1 AND q.is_active = true
    `, [qrData]);
    return rows[0];
  },

  async getActiveQrCodes() {
    const { rows } = await pool.query(`
      SELECT q.*, p.nombre as product_name, p.codigo as product_code
      FROM qr_codes q
      LEFT JOIN products p ON q.product_id = p.id
      WHERE q.is_active = true
      ORDER BY q.created_at DESC
    `);
    return rows;
  },

  async deactivateQrCode(id) {
    const { rows } = await pool.query(`
      UPDATE qr_codes 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    return rows[0];
  },

  async activateQrCode(id) {
    const { rows } = await pool.query(`
      UPDATE qr_codes 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);
    return rows[0];
  }
};
