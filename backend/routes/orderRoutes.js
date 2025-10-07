import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByProject, 
  getByStatus 
} from '../controllers/orderController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/project/:projectId', getByProject);
router.get('/status/:status', getByStatus);

export default router;
