const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUsersByRole
} = require('../controllers/roleController');

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

module.exports = router;
