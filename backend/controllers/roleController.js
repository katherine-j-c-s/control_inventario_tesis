import AppDataSource from '../database.js';

// Obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    const roleRepository = AppDataSource.getRepository('Role');
    const roles = await roleRepository.find({
      order: { nombre: 'ASC' }
    });

    res.json(roles);
  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nuevo rol
const createRole = async (req, res) => {
  try {
    const { nombre, descripcion, permisos } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre del rol es requerido' });
    }

    const roleRepository = AppDataSource.getRepository('Role');
    const existingRole = await roleRepository.findOne({ where: { nombre } });

    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }

    const newRole = roleRepository.create({
      nombre,
      descripcion,
      permisos: permisos || {},
      es_sistema: false
    });

    const savedRole = await roleRepository.save(newRole);

    res.status(201).json({
      message: 'Rol creado exitosamente',
      role: savedRole
    });

  } catch (error) {
    console.error('Error creando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar rol
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, permisos } = req.body;

    const roleRepository = AppDataSource.getRepository('Role');
    const role = await roleRepository.findOne({ where: { id: parseInt(id) } });

    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    if (nombre) role.nombre = nombre;
    if (descripcion !== undefined) role.descripcion = descripcion;
    if (permisos) role.permisos = permisos;

    const updatedRole = await roleRepository.save(role);

    res.json({
      message: 'Rol actualizado exitosamente',
      role: updatedRole
    });

  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar rol
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const roleRepository = AppDataSource.getRepository('Role');
    const userRepository = AppDataSource.getRepository('User');

    const role = await roleRepository.findOne({ where: { id: parseInt(id) } });

    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    // Verificar si algún usuario tiene este rol asignado
    const userCount = await userRepository.count({ where: { rol: role.nombre } });
    if (userCount > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el rol porque ${userCount} usuario(s) lo tienen asignado`
      });
    }

    await roleRepository.delete(id);
    res.json({ message: 'Rol eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ Asignar rol a usuario (actualiza rol y permisos directamente en la tabla users)
const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'ID de usuario y rol son requeridos' });
    }

    const userRepository = AppDataSource.getRepository('User');
    const roleRepository = AppDataSource.getRepository('Role');

    const user = await userRepository.findOne({ where: { id: parseInt(userId), activo: true } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const role = await roleRepository.findOne({ where: { id: parseInt(roleId) } });
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    // Asignar rol y permisos del rol al usuario
    user.rol = role.nombre;
    user.permisos = role.permisos;

    await userRepository.save(user);

    res.json({
      message: `Rol "${role.nombre}" asignado correctamente a ${user.nombre}`,
      user
    });

  } catch (error) {
    console.error('Error asignando rol a usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ Remover rol del usuario (reestablece a "usuario" por defecto)
const removeRoleFromUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'ID de usuario es requerido' });

    const userRepository = AppDataSource.getRepository('User');
    const defaultRole = 'usuario';

    const user = await userRepository.findOne({ where: { id: parseInt(userId), activo: true } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Buscar permisos del rol por defecto
    const roleRepository = AppDataSource.getRepository('Role');
    const defaultRoleData = await roleRepository.findOne({ where: { nombre: defaultRole } });

    user.rol = defaultRole;
    user.permisos = defaultRoleData ? defaultRoleData.permisos : {};

    await userRepository.save(user);

    res.json({
      message: `Rol restablecido a "${defaultRole}" para ${user.nombre}`,
      user
    });

  } catch (error) {
    console.error('Error removiendo rol de usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ Obtener el rol actual de un usuario
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;
    const userRepository = AppDataSource.getRepository('User');

    const user = await userRepository.findOne({ where: { id: parseInt(userId), activo: true } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json({
      rol: user.rol,
      permisos: user.permisos
    });

  } catch (error) {
    console.error('Error obteniendo rol del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener usuarios por rol
const getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const roleRepository = AppDataSource.getRepository('Role');
    const userRepository = AppDataSource.getRepository('User');

    const role = await roleRepository.findOne({ where: { id: parseInt(roleId) } });
    if (!role) return res.status(404).json({ message: 'Rol no encontrado' });

    const users = await userRepository.find({
      where: { rol: role.nombre, activo: true }
    });

    res.json(users);

  } catch (error) {
    console.error('Error obteniendo usuarios por rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUsersByRole
};
