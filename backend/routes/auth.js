import express from 'express';
const router = express.Router();
import upload from '../middleware/upload.js';
import { authenticateToken } from '../middleware/auth.js';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';

// Registro de usuario
router.post('/register', upload.single('foto'), register);

// Inicio de sesión
router.post('/login', login);

// Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, getProfile);

// Actualizar perfil del usuario autenticado
router.put('/profile', authenticateToken, upload.single('foto'), updateProfile);

export default router;
