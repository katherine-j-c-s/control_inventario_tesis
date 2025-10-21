import express from "express";
import { generateOrderReport } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Ruta para generar informe PDF de orden
 * GET /api/order-report/:id
 */
router.get("/:id", verifyToken, generateOrderReport);

export default router;

