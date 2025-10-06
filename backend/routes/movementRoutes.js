import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByProduct, 
  getByWarehouse 
} from '../controllers/movementController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/product/:productId', getByProduct);
router.get('/warehouse/:warehouseId', getByWarehouse);

export default router;
