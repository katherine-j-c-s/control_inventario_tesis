const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const { register, login, getProfile } = require('../controllers/authController');

// Registro de usuario
router.post('/register', upload.single('foto'), register);

// Inicio de sesión
router.post('/login', login);

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
