import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Rutas de reportes funcionando correctamente' });
});

// Ruta para verificar productos en la base de datos
router.get('/debug-productos', async (req, res) => {
  try {
    const AppDataSource = (await import('../database.js')).default;
    const Product = (await import('../models/Product.js')).default;
    
    const productRepository = AppDataSource.getRepository(Product);
    const productos = await productRepository.find();
    
    res.json({
      message: 'Productos encontrados',
      total: productos.length,
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria,
        stock: p.stock
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Ruta para generar reporte de inventario (PDF) - Wrapper REST que consume servicio SOAP
router.get('/inventario/pdf', authenticateToken, reportController.generarReporteInventario);

// Ruta para obtener datos del inventario (JSON)
router.get('/inventario/datos', authenticateToken, reportController.obtenerDatosInventario);

export default router;
