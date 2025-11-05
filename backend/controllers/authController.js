import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AppDataSource from '../database.js';
import config from '../config.js';

const register = async (req, res) => {
  try {
    console.log('=== INICIO REGISTRO ===');
    console.log('Body recibido:', req.body);
    console.log('File recibido:', req.file);
    
    const { 
      nombre, 
      apellido, 
      dni, 
      email, 
      puesto_laboral, 
      edad, 
      genero, 
      foto,
      password 
    } = req.body;

    console.log('Datos extraídos:', { nombre, apellido, dni, email, puesto_laboral, edad, genero, foto });

    const userRepository = AppDataSource.getRepository('User');
    console.log('Repository obtenido');

    // Verificar si el usuario ya existe
    console.log('Verificando usuario existente...');
    const existingUser = await userRepository.findOne({
      where: [{ dni }, { email }]
    });
    console.log('Usuario existente encontrado:', existingUser);

    if (existingUser) {
      console.log('Usuario ya existe, retornando error 400');
      return res.status(400).json({ 
        message: 'Ya existe un usuario con ese DNI o email' 
      });
    }

    // Encriptar contraseña
    console.log('Encriptando contraseña...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Contraseña encriptada');

    // Crear usuario
    console.log('Creando usuario...');
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
        inventory: true,
        scanQR: true
      }
    });
    console.log('Usuario creado en memoria:', newUser);

    console.log('Guardando usuario en base de datos...');
    const savedUser = await userRepository.save(newUser);
    console.log('Usuario guardado:', savedUser);

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
    console.error('=== ERROR EN REGISTRO ===');
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('========================');
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    
    // 1. Primero, buscamos al usuario por su DNI.
    const user = await userRepository.findOne({ 
      where: { dni, activo: true } 
    });
  
    // 2. Validamos si el usuario existe y su contraseña es correcta.
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
    
    // 3. [CORREGIDO] Una vez validado, buscamos su rol para obtener los permisos.
    const roleRepository = AppDataSource.getRepository('Role');
    const userRole = await roleRepository.findOne({ 
      where: { nombre: user.rol } 
    });

    // Debug: Mostrar información del rol
    console.log('=== DEBUG LOGIN ===');
    console.log('Usuario rol:', user.rol);
    console.log('Rol encontrado:', userRole);
    console.log('Permisos del rol:', userRole?.permisos);
    console.log('===================');

    // 4. Mantenemos los permisos del usuario y agregamos los permisos del rol
    const userWithPermissions = { 
      ...user, 
      permisos: user.permisos || {}, // Permisos específicos del usuario
      rolPermisos: userRole?.permisos || {} // Permisos del rol para el sidebar
    };
    delete userWithPermissions.password; // Quitamos la contraseña del objeto final

    // 5. Generamos el token.
    const token = jwt.sign(
      { userId: user.id, rol: user.rol }, // Guardamos rol en el token para el middleware
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    // 6. Enviamos la respuesta.
    res.json({
      message: 'Inicio de sesión exitoso',
      user: userWithPermissions,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    // Buscar el rol para obtener los permisos del rol
    const roleRepository = AppDataSource.getRepository('Role');
    const userRole = await roleRepository.findOne({ 
      where: { nombre: req.user.rol } 
    });

    // Construir el perfil con los permisos del rol
    const { password, ...userProfile } = req.user;
    const userWithPermissions = {
      ...userProfile,
      permisos: userProfile.permisos || {},
      rolPermisos: userRole?.permisos || {}
    };

    res.json(userWithPermissions);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({
      where: { id: userId, activo: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Campos permitidos para actualizar por el propio usuario
    const allowedFields = [
      'nombre', 'apellido', 'email', 'puesto_laboral', 
      'edad', 'genero'
    ];

    // Filtrar solo los campos permitidos
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    // Si se está actualizando la contraseña, encriptarla
    if (updateData.password) {
      const saltRounds = 10;
      filteredData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Si hay nueva foto, actualizarla
    if (req.file) {
      // Verificar que el archivo se haya guardado correctamente
      if (!req.file.filename) {
        return res.status(400).json({ 
          message: 'Error al procesar la imagen. Por favor, inténtalo de nuevo.' 
        });
      }
      filteredData.foto = req.file.filename;
    }

    // Actualizar usuario
    await userRepository.update(userId, filteredData);
    
    const updatedUser = await userRepository.findOne({
      where: { id: userId },
      select: [
        'id', 'nombre', 'apellido', 'dni', 'email', 
        'puesto_laboral', 'edad', 'genero', 'foto', 
        'rol', 'permisos', 'updated_at'
      ]
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      path: error.path,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile
};