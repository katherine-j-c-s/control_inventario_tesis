const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppDataSource = require('../database');
const config = require('../config');

const register = async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      dni, 
      email, 
      puesto_laboral, 
      edad, 
      genero, 
      password 
    } = req.body;

    const userRepository = AppDataSource.getRepository('User');

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({
      where: [{ dni }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con ese DNI o email' 
      });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser = userRepository.create({
      nombre,
      apellido,
      dni,
      email,
      puesto_laboral,
      edad,
      genero,
      password: hashedPassword,
      foto: req.file ? req.file.filename : null,
      rol: 'usuario',
      permisos: {
        entrega: false,
        movimiento: false,
        egreso: false
      }
    });

    const savedUser = await userRepository.save(newUser);

    // Generar token
    const token = jwt.sign(
      { userId: savedUser.id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Remover password de la respuesta
    const { password: _, ...userResponse } = savedUser;

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { dni, password } = req.body;

    if (!dni || !password) {
      return res.status(400).json({ 
        message: 'DNI y contraseña son requeridos' 
      });
    }

    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({ 
      where: { dni, activo: true } 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { userId: user.id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // Remover password de la respuesta
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Inicio de sesión exitoso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const { password, ...userProfile } = req.user;
    res.json(userProfile);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
