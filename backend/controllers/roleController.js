import AppDataSource from '../database.js';

// Obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    const roleRepository = AppDataSource.getRepository('Role');
    const roles = await roleRepository.find({
      where: { activo: true },
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
    
    // Verificar si el rol ya existe
    const existingRole = await roleRepository.findOne({ 
      where: { nombre, activo: true } 
    });

    if (existingRole) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }

    // Crear nuevo rol
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
    const role = await roleRepository.findOne({ where: { id: parseInt(id), activo: true } });

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // LÓGICA MODIFICADA
    if (role.es_sistema) {
      // Si se intenta cambiar algo que NO sean los permisos, se bloquea.
      if (nombre !== undefined && nombre !== role.nombre) {
        return res.status(403).json({ message: 'No se puede cambiar el nombre de un rol del sistema.' });
      }
      if (descripcion !== undefined && descripcion !== role.descripcion) {
        return res.status(403).json({ message: 'No se puede cambiar la descripción de un rol del sistema.' });
      }
    }
    // Actualizar campos
    if (nombre && nombre !== role.nombre) {
      // Verificar que el nuevo nombre no exista
      const existingRole = await roleRepository.findOne({ 
        where: { nombre, activo: true } 
      });
      if (existingRole && existingRole.id !== role.id) {
        return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
      }
      role.nombre = nombre;
    }

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
    
    const role = await roleRepository.findOne({
      where: { id: parseInt(id), activo: true }
    });

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    if (role.es_sistema) {
      return res.status(403).json({ 
        message: 'No se pueden eliminar los roles del sistema' 
      });
    }

    const userCount = await userRepository.count({
      where: { rol: role.nombre, activo: true }
    });

    if (userCount > 0) {
      return res.status(400).json({ 
        message: `No se puede eliminar el rol porque ${userCount} usuario(s) lo tienen asignado` 
      });
    }

    // [CAMBIO] Reemplazamos .update() por .delete() para un borrado físico
    await roleRepository.delete(id);

    res.json({ message: 'Rol eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Asignar rol a usuario
const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    const adminId = req.user.id;

    if (!userId || !roleId) {
      return res.status(400).json({ 
        message: 'ID de usuario y rol son requeridos' 
      });
    }

    const userRepository = AppDataSource.getRepository('User');
    const roleRepository = AppDataSource.getRepository('Role');
    const userRoleRepository = AppDataSource.getRepository('UserRole');

    // Verificar que el usuario existe
    const user = await userRepository.findOne({
      where: { id: parseInt(userId), activo: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el rol existe
    const role = await roleRepository.findOne({
      where: { id: parseInt(roleId), activo: true }
    });

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Verificar si ya tiene el rol asignado
    const existingAssignment = await userRoleRepository.findOne({
      where: { 
        user_id: parseInt(userId), 
        role_id: parseInt(roleId), 
        activo: true 
      }
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: 'El usuario ya tiene este rol asignado' 
      });
    }

    // Crear asignación
    const userRole = userRoleRepository.create({
      user_id: parseInt(userId),
      role_id: parseInt(roleId),
      asignado_por: adminId
    });

    await userRoleRepository.save(userRole);

    res.json({
      message: 'Rol asignado exitosamente',
      assignment: userRole
    });

  } catch (error) {
    console.error('Error asignando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Remover rol de usuario
const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ 
        message: 'ID de usuario y rol son requeridos' 
      });
    }

    const userRoleRepository = AppDataSource.getRepository('UserRole');

    // Buscar la asignación
    const assignment = await userRoleRepository.findOne({
      where: { 
        user_id: parseInt(userId), 
        role_id: parseInt(roleId), 
        activo: true 
      }
    });

    if (!assignment) {
      return res.status(404).json({ 
        message: 'El usuario no tiene este rol asignado' 
      });
    }

    // Soft delete de la asignación
    await userRoleRepository.update(assignment.id, { activo: false });

    res.json({ message: 'Rol removido exitosamente' });

  } catch (error) {
    console.error('Error removiendo rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener roles de un usuario
const getUserRoles = async (req, res) => {
  try {
    const { userId } = req.params;

    const userRoleRepository = AppDataSource.getRepository('UserRole');
    const roleRepository = AppDataSource.getRepository('Role');

    // Obtener roles del usuario
    const userRoles = await userRoleRepository
      .createQueryBuilder('ur')
      .leftJoinAndSelect('ur.role', 'role')
      .where('ur.user_id = :userId', { userId: parseInt(userId) })
      .andWhere('ur.activo = :activo', { activo: true })
      .andWhere('role.activo = :roleActivo', { roleActivo: true })
      .getMany();

    const roles = userRoles.map(ur => ({
      ...ur.role,
      fecha_asignacion: ur.fecha_asignacion
    }));

    res.json(roles);

  } catch (error) {
    console.error('Error obteniendo roles del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener usuarios con un rol específico
const getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const roleRepository = AppDataSource.getRepository('Role');
    const userRepository = AppDataSource.getRepository('User');

    // Primero, encontramos el rol por su ID para obtener el nombre
    const role = await roleRepository.findOne({
      where: { id: parseInt(roleId), activo: true }
    });

    if (!role) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // [MODIFICADO] Buscamos todos los usuarios que tengan ese nombre de rol
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
