import jwt from 'jsonwebtoken';
import config from '../config.js';
import AppDataSource from '../database.js';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const userRepository = AppDataSource.getRepository('User');
    const user = await userRepository.findOne({ 
      where: { id: decoded.userId, activo: true } 
    });

    if (!user) {
      return res.status(403).json({ message: 'Usuario no válido' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user.rol === 'admin' || req.user.permisos[permission]) {
      next();
    } else {
      return res.status(403).json({ message: `Acceso denegado. Se requiere permiso de ${permission}.` });
    }
  };
};
// Exportar como verifyToken para compatibilidad
const verifyToken = authenticateToken;

export {
  authenticateToken,
  verifyToken,
  requireAdmin,
  requirePermission
};

