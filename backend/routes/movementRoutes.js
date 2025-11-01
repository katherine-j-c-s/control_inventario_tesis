import express from 'express';
import {
  getAllMovements,
  getMovementById,
  createMovement,
  updateMovement,
  deleteMovement
} from '../controllers/movementsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Rutas para movimientos de productos
 * Todas las rutas requieren autenticación
 */

router.use(verifyToken);

// Obtener todos los movimientos
router.get('/', getAllMovements);

// Obtener un movimiento por ID
router.get('/:id', getMovementById);

// Crear un nuevo movimiento
router.post('/', createMovement);

// Actualizar un movimiento
router.put('/:id', updateMovement);

// Eliminar un movimiento
router.delete('/:id', deleteMovement);

export default router;


