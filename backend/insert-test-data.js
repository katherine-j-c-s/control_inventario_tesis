// Script para insertar datos de prueba en las tablas
const { pool } = require('./db.js');

async function insertTestData() {
  try {
    console.log('🔄 Insertando datos de prueba...\n');

    // 1. Verificar si ya existen productos
    console.log('📦 Verificando productos existentes...');
    const existingProducts = await pool.query('SELECT COUNT(*) as total FROM products WHERE activo = true');
    
    if (existingProducts.rows[0].total > 0) {
      console.log(`✅ Ya existen ${existingProducts.rows[0].total} productos en la base de datos`);
    } else {
      console.log('📦 Insertando productos...');
      const productosQuery = `
        INSERT INTO products (nombre, codigo, categoria, descripcion, unidad_medida, precio_unitario, stock_actual, stock_minimo, ubicacion, activo)
        VALUES 
          ('Aceite Motor 5W-30', 'ACE-001', 'Lubricantes', 'Aceite de motor sintético 5W-30', 'litros', 25.50, 100, 20, 'Estante A-1', true),
          ('Filtro de Aire', 'FIL-002', 'Filtros', 'Filtro de aire para motor diesel', 'unidades', 15.75, 50, 10, 'Estante B-2', true),
          ('Bujía de Encendido', 'BUJ-003', 'Encendido', 'Bujía de encendido iridium', 'unidades', 8.90, 200, 30, 'Estante C-3', true),
          ('Líquido de Frenos', 'LFB-004', 'Frenos', 'Líquido de frenos DOT 4', 'litros', 12.30, 80, 15, 'Estante D-4', true),
          ('Refrigerante', 'REF-005', 'Refrigeración', 'Refrigerante anticongelante', 'litros', 18.60, 60, 12, 'Estante E-5', true)
        ON CONFLICT (codigo) DO NOTHING
        RETURNING id, nombre;
      `;

      const productos = await pool.query(productosQuery);
      console.log(`✅ Productos insertados: ${productos.rows.length}`);
    }

    // 2. Verificar y insertar remitos de prueba
    console.log('📋 Verificando remitos existentes...');
    const existingRemitos = await pool.query('SELECT COUNT(*) as total FROM receipts WHERE status != \'deleted\'');
    
    if (existingRemitos.rows[0].total > 0) {
      console.log(`✅ Ya existen ${existingRemitos.rows[0].total} remitos en la base de datos`);
    } else {
      console.log('📋 Insertando remitos...');
      const remitosQuery = `
        INSERT INTO receipts (warehouse_id, quantity_products, entry_date, verification_status, order_id, product_id, status)
        VALUES 
          (1, 3, CURRENT_TIMESTAMP, true, 1001, 1, 'active'),
          (1, 2, CURRENT_TIMESTAMP, true, 1002, 2, 'active'),
          (1, 1, CURRENT_TIMESTAMP, false, 1003, 3, 'pending'),
          (2, 4, CURRENT_TIMESTAMP, true, 1004, 4, 'active'),
          (2, 2, CURRENT_TIMESTAMP, true, 1005, 5, 'active')
        RETURNING receipt_id, product_id;
      `;

      const remitos = await pool.query(remitosQuery);
      console.log(`✅ Remitos insertados: ${remitos.rows.length}`);
    }

    // 3. Verificar y insertar movimientos de prueba
    console.log('🔄 Verificando movimientos existentes...');
    const existingMovimientos = await pool.query('SELECT COUNT(*) as total FROM movements');
    
    if (existingMovimientos.rows[0].total > 0) {
      console.log(`✅ Ya existen ${existingMovimientos.rows[0].total} movimientos en la base de datos`);
    } else {
      console.log('🔄 Insertando movimientos...');
      const movimientosQuery = `
        INSERT INTO movements (product_id, movement_type, quantity, date, status, user_id)
        VALUES 
          (1, 'entrada', 100, CURRENT_DATE, 'completed', 1),
          (1, 'salida', 20, CURRENT_DATE - INTERVAL '1 day', 'completed', 1),
          (2, 'entrada', 50, CURRENT_DATE, 'completed', 1),
          (2, 'salida', 5, CURRENT_DATE - INTERVAL '2 days', 'completed', 1),
          (3, 'entrada', 200, CURRENT_DATE, 'completed', 1),
          (3, 'salida', 15, CURRENT_DATE - INTERVAL '3 days', 'completed', 1),
          (4, 'entrada', 80, CURRENT_DATE, 'completed', 1),
          (4, 'salida', 10, CURRENT_DATE - INTERVAL '1 day', 'completed', 1),
          (5, 'entrada', 60, CURRENT_DATE, 'completed', 1),
          (5, 'salida', 8, CURRENT_DATE - INTERVAL '2 days', 'completed', 1)
        RETURNING movement_id, product_id, movement_type;
      `;

      const movimientos = await pool.query(movimientosQuery);
      console.log(`✅ Movimientos insertados: ${movimientos.rows.length}`);
    }

    // 4. Verificar datos insertados
    console.log('\n📊 Verificando datos insertados...');
    
    const countProductos = await pool.query('SELECT COUNT(*) as total FROM products WHERE activo = true');
    const countRemitos = await pool.query('SELECT COUNT(*) as total FROM receipts WHERE status != \'deleted\'');
    const countMovimientos = await pool.query('SELECT COUNT(*) as total FROM movements');

    console.log(`📦 Productos activos: ${countProductos.rows[0].total}`);
    console.log(`📋 Remitos activos: ${countRemitos.rows[0].total}`);
    console.log(`🔄 Movimientos: ${countMovimientos.rows[0].total}`);

    console.log('\n✅ Datos de prueba insertados correctamente!');

  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error.message);
  } finally {
    await pool.end();
  }
}

insertTestData();
