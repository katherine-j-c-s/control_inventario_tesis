// Script para crear las funciones de remitos directamente
const { pool } = require('./db.js');

async function crearFuncionesReceipts() {
  try {
    console.log('🔧 Creando funciones de remitos...\n');

    // 1. Función para obtener todos los remitos
    console.log('📝 Creando get_all_receipts...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_all_receipts()
      RETURNS TABLE (
          receipt_id INTEGER,
          warehouse_id INTEGER,
          quantity_products INTEGER,
          entry_date TIMESTAMP,
          verification_status BOOLEAN,
          order_id INTEGER,
          product_id INTEGER,
          status VARCHAR(255)
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              r.receipt_id,
              r.warehouse_id,
              r.quantity_products,
              r.entry_date,
              r.verification_status,
              r.order_id,
              r.product_id,
              r.status
          FROM receipts r
          WHERE r.status != 'deleted'
          ORDER BY r.entry_date DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_all_receipts creada');

    // 2. Función para obtener remitos no verificados
    console.log('📝 Creando get_unverified_receipts...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_unverified_receipts()
      RETURNS TABLE (
          receipt_id INTEGER,
          warehouse_id INTEGER,
          quantity_products INTEGER,
          entry_date TIMESTAMP,
          verification_status BOOLEAN,
          order_id INTEGER,
          product_id INTEGER,
          status VARCHAR(255)
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              r.receipt_id,
              r.warehouse_id,
              r.quantity_products,
              r.entry_date,
              r.verification_status,
              r.order_id,
              r.product_id,
              r.status
          FROM receipts r
          WHERE r.verification_status = false 
          AND r.status != 'deleted'
          ORDER BY r.entry_date DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_unverified_receipts creada');

    // 3. Función para obtener remitos verificados
    console.log('📝 Creando get_verified_receipts...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_verified_receipts()
      RETURNS TABLE (
          receipt_id INTEGER,
          warehouse_id INTEGER,
          quantity_products INTEGER,
          entry_date TIMESTAMP,
          verification_status BOOLEAN,
          order_id INTEGER,
          product_id INTEGER,
          status VARCHAR(255)
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              r.receipt_id,
              r.warehouse_id,
              r.quantity_products,
              r.entry_date,
              r.verification_status,
              r.order_id,
              r.product_id,
              r.status
          FROM receipts r
          WHERE r.verification_status = true 
          AND r.status != 'deleted'
          ORDER BY r.entry_date DESC;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_verified_receipts creada');

    // 4. Función para verificar un remito
    console.log('📝 Creando verify_receipt...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION verify_receipt(receipt_id_param INTEGER)
      RETURNS TABLE (
          receipt_id INTEGER,
          warehouse_id INTEGER,
          quantity_products INTEGER,
          entry_date TIMESTAMP,
          verification_status BOOLEAN,
          order_id INTEGER,
          product_id INTEGER,
          status VARCHAR(255)
      ) AS $$
      BEGIN
          UPDATE receipts 
          SET verification_status = true,
              status = 'verified'
          WHERE receipt_id = receipt_id_param;
          
          RETURN QUERY
          SELECT 
              r.receipt_id,
              r.warehouse_id,
              r.quantity_products,
              r.entry_date,
              r.verification_status,
              r.order_id,
              r.product_id,
              r.status
          FROM receipts r
          WHERE r.receipt_id = receipt_id_param;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ verify_receipt creada');

    // 5. Función para obtener estadísticas
    console.log('📝 Creando get_receipts_statistics...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION get_receipts_statistics()
      RETURNS TABLE (
          total_receipts BIGINT,
          verified_receipts BIGINT,
          unverified_receipts BIGINT,
          pending_receipts BIGINT
      ) AS $$
      BEGIN
          RETURN QUERY
          SELECT 
              COUNT(*) as total_receipts,
              COUNT(CASE WHEN verification_status = true THEN 1 END) as verified_receipts,
              COUNT(CASE WHEN verification_status = false THEN 1 END) as unverified_receipts,
              COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_receipts
          FROM receipts
          WHERE status != 'deleted';
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ get_receipts_statistics creada');

    console.log('\n🔍 Verificando funciones creadas...');
    
    // Verificar que las funciones existen
    const functionsQuery = `
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%receipt%'
      ORDER BY routine_name;
    `;
    
    const functions = await pool.query(functionsQuery);
    console.log('\n📋 Funciones disponibles:');
    functions.rows.forEach(func => {
      console.log(`   ✅ ${func.routine_name} (${func.routine_type})`);
    });

    console.log('\n🎉 Todas las funciones creadas exitosamente!');
    console.log('\n💡 Ahora puedes probar los endpoints:');
    console.log('   - GET /api/receipts');
    console.log('   - GET /api/receipts/unverified');
    console.log('   - GET /api/receipts/verified');
    console.log('   - GET /api/receipts/statistics');

  } catch (error) {
    console.error('❌ Error creando funciones:', error.message);
  } finally {
    await pool.end();
  }
}

crearFuncionesReceipts();
