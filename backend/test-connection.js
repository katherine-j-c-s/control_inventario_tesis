// Script para probar la conexión a la base de datos
require('dotenv').config();
const { DataSource } = require('typeorm');
const config = require('./config');

const User = require('./models/User');
const Product = require('./models/Product');
const Role = require('./models/Role');
const UserRole = require('./models/UserRole');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // No sincronizar en la prueba
  logging: true,
  entities: [User, Product, Role, UserRole],
});

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a la base de datos...');
    console.log(`📍 Host: ${config.database.host}`);
    console.log(`📍 Puerto: ${config.database.port}`);
    console.log(`📍 Usuario: ${config.database.username}`);
    console.log(`📍 Base de datos: ${config.database.database}`);
    
    await AppDataSource.initialize();
    console.log('✅ ¡Conexión exitosa a la base de datos!');
    
    // Probar una consulta simple
    const result = await AppDataSource.query('SELECT current_database(), version()');
    console.log('📊 Información de la base de datos:');
    console.log(`   - Base de datos actual: ${result[0].current_database}`);
    console.log(`   - Versión de PostgreSQL: ${result[0].version.split(' ')[0]}`);
    
    await AppDataSource.destroy();
    console.log('🔌 Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose');
      console.log('   2. Verificar que el puerto 5432 esté disponible');
      console.log('   3. Verificar la configuración en el archivo .env');
    } else if (error.code === '3D000') {
      console.log('\n💡 La base de datos "controlInventario" no existe.');
      console.log('   Ejecuta el script create_database.sql en pgAdmin4');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación.');
      console.log('   Verifica el usuario y contraseña en el archivo .env');
    }
  }
}

testConnection();
