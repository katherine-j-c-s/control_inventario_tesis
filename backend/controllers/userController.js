const bcrypt = require('bcryptjs');
const AppDataSource = require('../database');

const getAllUsers = async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository('User');
    const users = await userRepository.find({
      where: { activo: true },
      select: [
        'id', 'nombre', 'apellido', 'dni', 'email', 
        'puesto_laboral', 'edad', 'genero', 'foto', 
        'rol', 'permisos', 'created_at'
      ]
    });

    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({
      where: { id: parseInt(id), activo: true },
      select: [
        'id', 'nombre', 'apellido', 'dni', 'email', 
        'puesto_laboral', 'edad', 'genero', 'foto', 
        'rol', 'permisos', 'created_at'
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({
      where: { id: parseInt(id), activo: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Si se está actualizando la contraseña, encriptarla
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    // Si hay nueva foto, actualizarla
    if (req.file) {
      updateData.foto = req.file.filename;
    }

    // Actualizar usuario
    await userRepository.update(id, updateData);
    
    const updatedUser = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: [
        'id', 'nombre', 'apellido', 'dni', 'email', 
        'puesto_laboral', 'edad', 'genero', 'foto', 
        'rol', 'permisos', 'updated_at'
      ]
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body; // El nombre del rol, ej: "Supervisor"

    // 1. Obtener los repositorios necesarios
    const roleRepository = AppDataSource.getRepository('Role');
    const userRepository = AppDataSource.getRepository('User');

    // 2. Validar que el rol recibido exista en la base de datos
    const rolExiste = await roleRepository.findOne({ where: { nombre: rol, activo: true } });

    if (!rolExiste) {
      return res.status(400).json({ message: `El rol '${rol}' no es un rol válido en el sistema.` });
    }

    // 3. Buscar al usuario que se va a actualizar
    const userToUpdate = await userRepository.findOne({ where: { id: parseInt(id), activo: true } });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // 4. Actualizar el campo 'rol' y guardar los cambios
    userToUpdate.rol = rol;
    await userRepository.save(userToUpdate);

    // 5. Devolver el usuario actualizado (sin la contraseña)
    const updatedUserResponse = { ...userToUpdate };
    delete updatedUserResponse.password; 

    res.status(200).json({ 
      message: 'Rol de usuario actualizado exitosamente.', 
      user: updatedUserResponse 
    });

  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUserPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permisos } = req.body;

    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({
      where: { id: parseInt(id), activo: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Validar estructura de permisos
    const validPermissions = {
      entrega: permisos.entrega || false,
      movimiento: permisos.movimiento || false,
      egreso: permisos.egreso || false
    };

    await userRepository.update(id, { permisos: validPermissions });

    const updatedUser = await userRepository.findOne({
      where: { id: parseInt(id) },
      select: [
        'id', 'nombre', 'apellido', 'dni', 'email', 
        'puesto_laboral', 'edad', 'genero', 'foto', 
        'rol', 'permisos', 'updated_at'
      ]
    });

    res.json({
      message: 'Permisos de usuario actualizados exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error actualizando permisos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userRepository = AppDataSource.getRepository('User');
    
    const user = await userRepository.findOne({
      where: { id: parseInt(id), activo: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    await userRepository.delete(id);

    res.json({ message: 'Usuario eliminado permanentemente' });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserPermissions,
  deleteUser
};
