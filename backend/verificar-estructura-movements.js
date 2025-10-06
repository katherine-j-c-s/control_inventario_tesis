// Script para verificar la estructura de la tabla movements
const { pool } = require('./db.js');

async function verificarEstructuraMovements() {
  try {
    console.log('🔍 Verificando estructura de la tabla movements...\n');

    // Verificar la estructura de la tabla
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'movements' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const structure = await pool.query(structureQuery);
    console.log('📋 Estructura de la tabla movements:');
    structure.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Verificar si hay datos en la tabla
    const countQuery = 'SELECT COUNT(*) as total FROM movements;';
    const count = await pool.query(countQuery);
    console.log(`\n📊 Total de registros: ${count.rows[0].total}`);

    // Verificar algunos registros de ejemplo
    const sampleQuery = 'SELECT * FROM movements LIMIT 3;';
    const sample = await pool.query(sampleQuery);
    console.log('\n📝 Registros de ejemplo:');
    sample.rows.forEach((row, index) => {
      console.log(`   Registro ${index + 1}:`, row);
    });

  } catch (error) {
    console.error('❌ Error verificando estructura:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstructuraMovements();
