const express = require('express');
const { 
  getUnverified, 
  getAll, 
  verify, 
  getVerified, 
  getByStatus, 
  getStatistics 
} = require('../controllers/receiptController.js');

const router = express.Router();

// Rutas para obtener remitos
router.get('/receipts', getAll);
router.get('/receipts/unverified', getUnverified);
router.get('/receipts/verified', getVerified);
router.get('/receipts/status/:status', getByStatus);
router.get('/receipts/statistics', getStatistics);

// Rutas para acciones
router.put('/receipts/verify/:id', verify);

module.exports = router;
