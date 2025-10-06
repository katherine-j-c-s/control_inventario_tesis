// Script de diagnóstico para verificar la conexión a la base de datos
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USERNAME || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'controlInventario',
  password: process.env.DB_PASSWORD || 'MiClave123',
  port: process.env.DB_PORT || 5432,
});

async function diagnosticar() {
  console.log('🔍 Iniciando diagnóstico de conexión...\n');
  
  console.log('📋 Configuración:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
  console.log(`   Usuario: ${process.env.DB_USERNAME || 'postgres'}`);
  console.log(`   Base de datos: ${process.env.DB_NAME || 'controlInventario'}`);
  console.log(`   Contraseña: ${process.env.DB_PASSWORD ? '***configurada***' : 'NO CONFIGURADA'}\n`);

  try {
    console.log('🔌 Intentando conectar a PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL!');
    
    console.log('\n📊 Verificando base de datos...');
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log(`   Base de datos actual: ${result.rows[0].current_database}`);
    console.log(`   Usuario actual: ${result.rows[0].current_user}`);
    console.log(`   Versión PostgreSQL: ${result.rows[0].version.split(' ')[0]}`);
    
    console.log('\n📋 Verificando tablas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('   Tablas encontradas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️  No se encontraron tablas en la base de datos');
    }
    
    client.release();
    console.log('\n🎉 Diagnóstico completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose');
      console.log('   2. Verificar que el puerto 5432 esté disponible');
      console.log('   3. Iniciar PostgreSQL desde el Panel de Control o Services');
    } else if (error.code === '3D000') {
      console.log('\n💡 La base de datos no existe:');
      console.log('   1. Ejecutar el script create_database.sql en pgAdmin4');
      console.log('   2. O crear la base de datos manualmente');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación:');
      console.log('   1. Verificar usuario y contraseña en .env');
      console.log('   2. Verificar que el usuario tenga permisos');
    }
  } finally {
    await pool.end();
  }
}

diagnosticar();
