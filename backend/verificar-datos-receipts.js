// Script para verificar los datos de receipts y su relación con products
const { pool } = require('./db.js');

async function verificarDatosReceipts() {
  try {
    console.log('🔍 Verificando datos de receipts y products...\n');

    // Verificar remitos
    const receiptsQuery = 'SELECT * FROM receipts ORDER BY receipt_id LIMIT 5;';
    const receipts = await pool.query(receiptsQuery);
    console.log('📋 Remitos:');
    receipts.rows.forEach(rec => {
      console.log(`   ID: ${rec.receipt_id}, Product ID: ${rec.product_id}, Status: ${rec.status}, Verificado: ${rec.verification_status}`);
    });

    // Verificar productos
    const productsQuery = 'SELECT id, nombre, codigo FROM products WHERE activo = true ORDER BY id LIMIT 5;';
    const products = await pool.query(productsQuery);
    console.log('\n📦 Productos:');
    products.rows.forEach(prod => {
      console.log(`   ID: ${prod.id}, Nombre: ${prod.nombre}, Código: ${prod.codigo}`);
    });

    // Verificar la relación
    const relationQuery = `
      SELECT 
        r.receipt_id,
        r.product_id,
        p.nombre as product_name,
        p.activo as product_active
      FROM receipts r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.receipt_id;
    `;
    const relations = await pool.query(relationQuery);
    console.log('\n🔗 Relaciones Receipt-Product:');
    relations.rows.forEach(rel => {
      console.log(`   Receipt ${rel.receipt_id} -> Product ${rel.product_id} (${rel.product_name || 'NO ENCONTRADO'}) - Activo: ${rel.product_active}`);
    });

  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  } finally {
    await pool.end();
  }
}

verificarDatosReceipts();
