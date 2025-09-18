const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserPermissions,
  deleteUser
} = require('../controllers/userController');

// Todas las rutas requieren autenticación y permisos de admin
router.use(authenticateToken);
router.use(requireAdmin);

// Obtener todos los usuarios
router.get('/', getAllUsers);

// Obtener usuario por ID
router.get('/:id', getUserById);

// Actualizar usuario completo
router.put('/:id', upload.single('foto'), updateUser);

// Actualizar rol de usuario
router.patch('/:id/role', updateUserRole);

// Actualizar permisos de usuario
router.patch('/:id/permissions', updateUserPermissions);

// Eliminar usuario (soft delete)
router.delete('/:id', deleteUser);

module.exports = router;
