const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config');
const AppDataSource = require('./database');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

const app = express();

// CORS simple - permitir todo
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));

// Middlewares de seguridad básicos
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

// Middlewares de logging y parsing
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (fotos de usuarios)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir página de prueba CORS
app.get('/test-cors', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-cors.html'));
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      message: 'El archivo es demasiado grande. Máximo 5MB permitido.' 
    });
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({ message: error.message });
  }
  
  res.status(500).json({ 
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Inicializar la base de datos y servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida exitosamente');

    // Crear roles por defecto si no existen
    const roleRepository = AppDataSource.getRepository('Role');
    
    const adminRole = await roleRepository.findOne({ where: { nombre: 'admin' } });
    if (!adminRole) {
      const adminRoleData = roleRepository.create({
        nombre: 'admin',
        descripcion: 'Administrador del sistema con todos los permisos',
        permisos: {
          entrega: true,
          movimiento: true,
          egreso: true,
          admin_usuarios: true,
          admin_roles: true,
          admin_sistema: true
        },
        es_sistema: true
      });
      await roleRepository.save(adminRoleData);
      console.log('Rol de administrador creado');
    }

    const userRole = await roleRepository.findOne({ where: { nombre: 'usuario' } });
    if (!userRole) {
      const userRoleData = roleRepository.create({
        nombre: 'usuario',
        descripcion: 'Usuario básico del sistema',
        permisos: {
          entrega: false,
          movimiento: false,
          egreso: false
        },
        es_sistema: true
      });
      await roleRepository.save(userRoleData);
      console.log('Rol de usuario creado');
    }

    // Crear usuario administrador por defecto si no existe
    const userRepository = AppDataSource.getRepository('User');
    const adminExists = await userRepository.findOne({ 
      where: { rol: 'admin' } 
    });

    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = userRepository.create({
        nombre: 'Administrador',
        apellido: 'Sistema',
        dni: '00000000',
        email: 'admin@sistema.com',
        puesto_laboral: 'Administrador del Sistema',
        edad: 30,
        genero: 'No especificado',
        password: hashedPassword,
        rol: 'admin',
        permisos: {
          entrega: true,
          movimiento: true,
          egreso: true
        }
      });

      await userRepository.save(adminUser);
      console.log('Usuario administrador creado:');
      console.log('DNI: 00000000');
      console.log('Contraseña: admin123');
    }

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`Servidor ejecutándose en puerto ${config.port}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verificar que PostgreSQL esté ejecutándose');
      console.log('   2. Verificar que el puerto 5432 esté disponible');
      console.log('   3. Verificar la configuración en el archivo .env');
    } else if (error.code === '3D000') {
      console.log('\n💡 La base de datos "controlInventario" no existe.');
      console.log('   Ejecuta el script create_database.sql en pgAdmin4');
    } else if (error.code === '28P01') {
      console.log('\n💡 Error de autenticación.');
      console.log('   Verifica el usuario y contraseña en el archivo .env');
    }
    
    process.exit(1);
  }
};

startServer();
