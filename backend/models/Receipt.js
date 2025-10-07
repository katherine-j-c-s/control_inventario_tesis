const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Receipt',
    tableName: 'receipts',
    columns:{
      receipt_id :{
        type: 'int',
        primary: true,
        generated: true,
      },
      warehouse_id :{
        type: 'int',
        nullable: true,
      },
      quantity_products :{
        type: 'int',
        nullable: true,
      },
      entry_date :{
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
      },
      verification_status :{
        type: Boolean,
        default: false,
      },
      order_id:{
        type: 'int',
        nullable: true,
      },
      product_id:{
        type: 'int',
        nullable: true,
      },
      status:{
        type: 'varchar',
        length: 255,
      },
      },
})

const { pool } = require('../db.js');

async function getUnverifiedReceipts() {
  const query = `
    SELECT 
      r.receipt_id,
      r.warehouse_id,
      w.name as warehouse_name,
      w.location as warehouse_location,
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
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    WHERE r.verification_status = false 
    AND r.status != 'deleted'
    ORDER BY r.entry_date DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getAllReceipts() {
  const query = `
    SELECT 
      r.receipt_id,
      r.warehouse_id,
      w.name as warehouse_name,
      w.location as warehouse_location,
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
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    WHERE r.status != 'deleted'
    ORDER BY r.entry_date DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function verifyReceipt(receiptId) {
  await pool.query(`
    UPDATE receipts 
    SET verification_status = true,
        status = 'verified'
    WHERE receipt_id = $1;
  `, [receiptId]);
  
  const query = `
    SELECT 
      r.receipt_id,
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
    WHERE r.receipt_id = $1;
  `;
  const result = await pool.query(query, [receiptId]);
  return result.rows[0];
}

async function getVerifiedReceipts() {
  const query = `
    SELECT 
      r.receipt_id,
      r.warehouse_id,
      w.name as warehouse_name,
      w.location as warehouse_location,
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
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    WHERE r.verification_status = true 
    AND r.status != 'deleted'
    ORDER BY r.entry_date DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

async function getReceiptsByStatus(status) {
  const query = `
    SELECT 
      r.receipt_id,
      r.warehouse_id,
      w.name as warehouse_name,
      w.location as warehouse_location,
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
    LEFT JOIN warehouses w ON r.warehouse_id = w.id
    WHERE r.status = $1
    ORDER BY r.entry_date DESC;
  `;
  const result = await pool.query(query, [status]);
  return result.rows;
}

async function getReceiptsStatistics() {
  const query = `
    SELECT 
      COUNT(*) as total_receipts,
      COUNT(CASE WHEN verification_status = true THEN 1 END) as verified_receipts,
      COUNT(CASE WHEN verification_status = false THEN 1 END) as unverified_receipts,
      COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_receipts
    FROM receipts 
    WHERE status != 'deleted';
  `;
  const result = await pool.query(query);
  return result.rows[0];
}

module.exports = {
  getUnverifiedReceipts,
  getAllReceipts,
  verifyReceipt,
  getVerifiedReceipts,
  getReceiptsByStatus,
  getReceiptsStatistics
};