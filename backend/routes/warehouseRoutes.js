import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getActiveWarehouses, 
  getByManager, 
  deactivate, 
  activate 
} from '../controllers/warehouseController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/active/list', getActiveWarehouses);
router.get('/manager/:managerId', getByManager);
router.patch('/:id/deactivate', deactivate);
router.patch('/:id/activate', activate);

export default router;
