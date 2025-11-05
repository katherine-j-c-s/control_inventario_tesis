import express from 'express';
const router = express.Router();
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUsersByRole
} from '../controllers/roleController.js';

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Rutas de roles
router.get('/', getAllRoles);
router.post('/', createRole);
router.put('/:id', updateRole);
router.delete('/:id', deleteRole);

// Rutas de asignación de roles
router.post('/assign', assignRoleToUser);
router.post('/remove', removeRoleFromUser);

// Rutas de consulta
router.get('/user/:userId', getUserRoles);
router.get('/:roleId/users', getUsersByRole);

export default router;