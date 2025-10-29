import express from 'express';
import {
  createWorkOrder,
  getAllWorkOrders,
  getWorkOrderById,
  getWorkOrdersByStatus,
  updateWorkOrder,
  deleteWorkOrder,
} from '../controllers/workOrderController.js';

const router = express.Router();

// Rutas para work orders
router.post('/work-orders', createWorkOrder);
router.get('/work-orders', getAllWorkOrders);
router.get('/work-orders/status/:status', getWorkOrdersByStatus);
router.get('/work-orders/:id', getWorkOrderById);
router.put('/work-orders/:id', updateWorkOrder);
router.delete('/work-orders/:id', deleteWorkOrder);

export default router;
