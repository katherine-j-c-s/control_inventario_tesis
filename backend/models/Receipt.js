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

// Traer remitos no verificados
async function getUnverifiedReceipts() {
  const result = await pool.query('SELECT * FROM get_unverified_receipts();');
  return result.rows;
}

// Traer todos los remitos
async function getAllReceipts() {
  const result = await pool.query('SELECT * FROM get_all_receipts();');
  return result.rows;
}

// Verificar un remito
async function verifyReceipt(receiptId) {
  const result = await pool.query('SELECT * FROM verify_receipt($1);', [receiptId]);
  return result.rows[0];
}

// Obtener remitos verificados
async function getVerifiedReceipts() {
  const result = await pool.query('SELECT * FROM get_verified_receipts();');
  return result.rows;
}

// Obtener remitos por estado
async function getReceiptsByStatus(status) {
  const result = await pool.query('SELECT * FROM get_receipts_by_status($1);', [status]);
  return result.rows;
}

// Obtener estadísticas de remitos
async function getReceiptsStatistics() {
  const result = await pool.query('SELECT * FROM get_receipts_statistics();');
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