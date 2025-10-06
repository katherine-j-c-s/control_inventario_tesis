import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByStatus, 
  getByManager, 
  getActiveProjects 
} from '../controllers/projectController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/status/:status', getByStatus);
router.get('/manager/:managerId', getByManager);
router.get('/active/list', getActiveProjects);

export default router;
