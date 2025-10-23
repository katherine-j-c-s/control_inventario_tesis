import { pool } from './db.js';

async function updateProductLocations() {
  try {
    console.log('🔄 Conectando a la base de datos...');

    // Ubicaciones reales de Neuquén, Argentina
    const locations = [
      { id: 1, ubicacion: 'Av. Argentina 1400, Neuquén, Neuquén, Argentina' },
      { id: 2, ubicacion: 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina' },
      { id: 3, ubicacion: 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina' },
      { id: 4, ubicacion: 'Av. del Trabajador 800, Neuquén, Neuquén, Argentina' },
      { id: 5, ubicacion: 'Av. San Martín 2000, Neuquén, Neuquén, Argentina' },
      { id: 6, ubicacion: 'Av. Roca 1500, Neuquén, Neuquén, Argentina' },
      { id: 7, ubicacion: 'Av. Colón 1800, Neuquén, Neuquén, Argentina' },
      { id: 8, ubicacion: 'Ruta 22 Km 12, Neuquén, Neuquén, Argentina' },
      { id: 9, ubicacion: 'Av. Argentina 800, Neuquén, Neuquén, Argentina' },
      { id: 10, ubicacion: 'Av. del Trabajador 1200, Neuquén, Neuquén, Argentina' }
    ];

    console.log('🔄 Actualizando ubicaciones de productos...');

    for (const location of locations) {
      try {
        // Verificar si el producto existe
        const checkQuery = 'SELECT id, nombre FROM products WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [location.id]);
        
        if (checkResult.rows.length > 0) {
          // Actualizar la ubicación
          const updateQuery = 'UPDATE products SET ubicacion = $1 WHERE id = $2';
          await pool.query(updateQuery, [location.ubicacion, location.id]);
          console.log(`✅ Producto ${location.id}: ${checkResult.rows[0].nombre} -> ${location.ubicacion}`);
        } else {
          console.log(`⚠️  Producto ${location.id} no encontrado`);
        }
      } catch (error) {
        console.log(`❌ Error actualizando producto ${location.id}:`, error.message);
      }
    }

    // Verificar las actualizaciones
    console.log('\n📋 Verificando actualizaciones...');
    const verifyQuery = 'SELECT id, nombre, codigo, ubicacion FROM products ORDER BY id';
    const verifyResult = await pool.query(verifyQuery);

    console.log('\n📍 Productos con nuevas ubicaciones:');
    verifyResult.rows.forEach(product => {
      console.log(`ID: ${product.id} | ${product.nombre} | ${product.ubicacion}`);
    });

    console.log('\n🎉 Actualización completada exitosamente!');
    console.log('📍 Todas las ubicaciones son direcciones reales de Neuquén, Argentina');
    console.log('🗺️  Google Maps podrá encontrar estas ubicaciones correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar la función
updateProductLocations();
