import express from "express";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderStatistics,
  getOrderProducts,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Rutas para órdenes de compra
 * Todas las rutas requieren autenticación
 */

// Obtener estadísticas (antes de la ruta /:id para evitar conflictos)
router.get("/statistics", verifyToken, getOrderStatistics);

// Obtener todas las órdenes
router.get("/", verifyToken, getAllOrders);

// Obtener una orden por ID
router.get("/:id", verifyToken, getOrderById);

// Obtener productos de una orden específica
router.get("/:id/products", verifyToken, getOrderProducts);

// Crear una nueva orden
router.post("/", verifyToken, createOrder);

// Actualizar una orden
router.put("/:id", verifyToken, updateOrder);

// Eliminar una orden
router.delete("/:id", verifyToken, deleteOrder);

export default router;