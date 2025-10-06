const { pool } = require('./db.js');

// Script de prueba para verificar que los stored procedures funcionan correctamente
async function testReceipts() {
  try {
    console.log('🧪 Iniciando pruebas de stored procedures de remitos...\n');

    // Test 1: Verificar que las funciones existen
    console.log('1. Verificando que las funciones existen...');
    const functionsQuery = `
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%receipt%'
      ORDER BY routine_name;
    `;
    
    const functions = await pool.query(functionsQuery);
    console.log('✅ Funciones encontradas:');
    functions.rows.forEach(func => {
      console.log(`   - ${func.routine_name} (${func.routine_type})`);
    });

    // Test 2: Probar get_all_receipts
    console.log('\n2. Probando get_all_receipts()...');
    try {
      const allReceipts = await pool.query('SELECT * FROM get_all_receipts();');
      console.log(`✅ get_all_receipts() ejecutado correctamente. Encontrados ${allReceipts.rows.length} remitos.`);
    } catch (error) {
      console.log(`❌ Error en get_all_receipts(): ${error.message}`);
    }

    // Test 3: Probar get_unverified_receipts
    console.log('\n3. Probando get_unverified_receipts()...');
    try {
      const unverifiedReceipts = await pool.query('SELECT * FROM get_unverified_receipts();');
      console.log(`✅ get_unverified_receipts() ejecutado correctamente. Encontrados ${unverifiedReceipts.rows.length} remitos no verificados.`);
    } catch (error) {
      console.log(`❌ Error en get_unverified_receipts(): ${error.message}`);
    }

    // Test 4: Probar get_verified_receipts
    console.log('\n4. Probando get_verified_receipts()...');
    try {
      const verifiedReceipts = await pool.query('SELECT * FROM get_verified_receipts();');
      console.log(`✅ get_verified_receipts() ejecutado correctamente. Encontrados ${verifiedReceipts.rows.length} remitos verificados.`);
    } catch (error) {
      console.log(`❌ Error en get_verified_receipts(): ${error.message}`);
    }

    // Test 5: Probar get_receipts_statistics
    console.log('\n5. Probando get_receipts_statistics()...');
    try {
      const statistics = await pool.query('SELECT * FROM get_receipts_statistics();');
      console.log('✅ get_receipts_statistics() ejecutado correctamente.');
      console.log('   Estadísticas:', statistics.rows[0]);
    } catch (error) {
      console.log(`❌ Error en get_receipts_statistics(): ${error.message}`);
    }

    // Test 6: Probar get_receipts_by_status
    console.log('\n6. Probando get_receipts_by_status()...');
    try {
      const pendingReceipts = await pool.query("SELECT * FROM get_receipts_by_status('pending');");
      console.log(`✅ get_receipts_by_status('pending') ejecutado correctamente. Encontrados ${pendingReceipts.rows.length} remitos pendientes.`);
    } catch (error) {
      console.log(`❌ Error en get_receipts_by_status(): ${error.message}`);
    }

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📝 Notas:');
    console.log('   - Si alguna función falla, verifica que los stored procedures se ejecutaron correctamente');
    console.log('   - Si no hay datos, es normal si la tabla receipts está vacía');
    console.log('   - Para probar verify_receipt(), necesitas tener al menos un remito en la base de datos');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await pool.end();
  }
}

// Ejecutar las pruebas
testReceipts();
