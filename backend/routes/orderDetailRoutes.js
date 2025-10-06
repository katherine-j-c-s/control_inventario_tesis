import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByOrder, 
  getByProduct 
} from '../controllers/orderDetailController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/order/:orderId', getByOrder);
router.get('/product/:productId', getByProduct);

export default router;
