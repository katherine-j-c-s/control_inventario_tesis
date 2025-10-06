import express from 'express';
import { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  getByProduct, 
  getByQrData, 
  getActiveQrCodes, 
  deactivate, 
  activate 
} from '../controllers/qrCodeController.js';

const router = express.Router();

// Rutas CRUD básicas
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

// Rutas específicas
router.get('/product/:productId', getByProduct);
router.get('/scan/:qrData', getByQrData);
router.get('/active/list', getActiveQrCodes);
router.patch('/:id/deactivate', deactivate);
router.patch('/:id/activate', activate);

export default router;
