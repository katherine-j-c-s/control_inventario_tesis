// Script para ejecutar los stored procedures de remitos
const { pool } = require('./db.js');
const fs = require('fs');
const path = require('path');

async function ejecutarStoredProcedures() {
  try {
    console.log('🔧 Ejecutando stored procedures de remitos...\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'stored_procedures_receipts.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el contenido en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Encontrados ${statements.length} statements para ejecutar\n`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);
          await pool.query(statement);
          console.log(`✅ Statement ${i + 1} ejecutado correctamente`);
        } catch (error) {
          console.log(`⚠️  Error en statement ${i + 1}: ${error.message}`);
          // Continuar con el siguiente statement
        }
      }
    }

    console.log('\n🔍 Verificando que las funciones se crearon...');
    
    // Verificar que las funciones existen
    const functionsQuery = `
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE '%receipt%'
      ORDER BY routine_name;
    `;
    
    const functions = await pool.query(functionsQuery);
    console.log('\n📋 Funciones encontradas:');
    functions.rows.forEach(func => {
      console.log(`   ✅ ${func.routine_name} (${func.routine_type})`);
    });

    console.log('\n🎉 Stored procedures ejecutados exitosamente!');
    console.log('\n💡 Ahora puedes probar los endpoints:');
    console.log('   - GET /api/receipts');
    console.log('   - GET /api/receipts/unverified');
    console.log('   - GET /api/receipts/verified');
    console.log('   - GET /api/receipts/statistics');

  } catch (error) {
    console.error('❌ Error ejecutando stored procedures:', error.message);
  } finally {
    await pool.end();
  }
}

ejecutarStoredProcedures();
