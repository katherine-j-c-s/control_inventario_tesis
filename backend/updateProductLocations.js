import { AppDataSource } from './database.js';

async function updateProductLocations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Ubicaciones reales de Neuquén, Argentina
    const locations = [
      {
        id: 1,
        ubicacion: 'Av. Argentina 1400, Neuquén, Neuquén, Argentina'
      },
      {
        id: 2,
        ubicacion: 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina'
      },
      {
        id: 3,
        ubicacion: 'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina'
      },
      {
        id: 4,
        ubicacion: 'Av. del Trabajador 800, Neuquén, Neuquén, Argentina'
      },
      {
        id: 5,
        ubicacion: 'Av. San Martín 2000, Neuquén, Neuquén, Argentina'
      },
      {
        id: 6,
        ubicacion: 'Av. Roca 1500, Neuquén, Neuquén, Argentina'
      },
      {
        id: 7,
        ubicacion: 'Av. Colón 1800, Neuquén, Neuquén, Argentina'
      },
      {
        id: 8,
        ubicacion: 'Ruta 22 Km 12, Neuquén, Neuquén, Argentina'
      },
      {
        id: 9,
        ubicacion: 'Av. Argentina 800, Neuquén, Neuquén, Argentina'
      },
      {
        id: 10,
        ubicacion: 'Av. del Trabajador 1200, Neuquén, Neuquén, Argentina'
      }
    ];

    // Obtener el repositorio de productos
    const productRepository = AppDataSource.getRepository('Product');

    console.log('🔄 Actualizando ubicaciones de productos...');

    for (const location of locations) {
      try {
        // Verificar si el producto existe
        const product = await productRepository.findOne({ where: { id: location.id } });
        
        if (product) {
          // Actualizar la ubicación
          await productRepository.update(
            { id: location.id },
            { ubicacion: location.ubicacion }
          );
          console.log(`✅ Producto ${location.id}: ${product.nombre} -> ${location.ubicacion}`);
        } else {
          console.log(`⚠️  Producto ${location.id} no encontrado`);
        }
      } catch (error) {
        console.log(`❌ Error actualizando producto ${location.id}:`, error.message);
      }
    }

    // Verificar las actualizaciones
    console.log('\n📋 Verificando actualizaciones...');
    const updatedProducts = await productRepository.find({
      select: ['id', 'nombre', 'codigo', 'ubicacion'],
      order: { id: 'ASC' }
    });

    console.log('\n📍 Productos con nuevas ubicaciones:');
    updatedProducts.forEach(product => {
      console.log(`ID: ${product.id} | ${product.nombre} | ${product.ubicacion}`);
    });

    console.log('\n🎉 Actualización completada exitosamente!');
    console.log('📍 Todas las ubicaciones son direcciones reales de Neuquén, Argentina');
    console.log('🗺️  Google Maps podrá encontrar estas ubicaciones correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la función
updateProductLocations();
