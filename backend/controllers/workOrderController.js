import AppDataSource from '../database.js';

// Crear un pedido de obra con varios items
const createWorkOrder = async (req, res) => {
  try {
    const { project_id, descripcion, usuario_id, items } = req.body;

    // Validaciones básicas
    if (!usuario_id) {
      return res.status(400).json({ message: 'El ID del usuario es requerido' });
    }

    if (!descripcion || descripcion.trim() === '') {
      return res.status(400).json({ message: 'La descripción es requerida' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe incluir al menos un producto' });
    }

    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const workOrderItemRepository = AppDataSource.getRepository('WorkOrderItem');

    // Crear pedido principal
    const workOrder = workOrderRepository.create({
      project_id: project_id || 1, // Valor por defecto si no se proporciona
      descripcion: descripcion.trim(),
      usuario_id,
      estado: 'pendiente',
    });
    
    const savedWorkOrder = await workOrderRepository.save(workOrder);

    // Crear items asociados
    const createdItems = [];
    for (const item of items) {
      if (item.nombre_producto && item.nombre_producto.trim()) {
        const workOrderItem = workOrderItemRepository.create({
          work_order: savedWorkOrder,
          nombre_producto: item.nombre_producto.trim(),
          descripcion: item.descripcion?.trim() || '',
          cantidad: parseInt(item.cantidad) || 1,
          estado_item: 'pendiente',
        });
        const savedItem = await workOrderItemRepository.save(workOrderItem);
        createdItems.push(savedItem);
      }
    }

    console.log(`Pedido de obra creado: ID ${savedWorkOrder.id} con ${createdItems.length} productos`);

    res.status(201).json({ 
      success: true,
      message: 'Pedido de obra creado exitosamente', 
      workOrder: {
        id: savedWorkOrder.id,
        descripcion: savedWorkOrder.descripcion,
        estado: savedWorkOrder.estado,
        fecha_solicitud: savedWorkOrder.fecha_solicitud,
        total_items: createdItems.length
      }
    });
  } catch (error) {
    console.error('Error creando pedido de obra:', error);
    
    // Manejo de errores específicos
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ message: 'Usuario o proyecto no válido' });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los pedidos con sus items
const getAllWorkOrders = async (req, res) => {
  try {
    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const userRepository = AppDataSource.getRepository('User');
    const projectRepository = AppDataSource.getRepository('Project');
    
    const orders = await workOrderRepository.find({
      relations: ['items'],
    });

    // Enriquecer los datos con información de usuario y proyecto
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await userRepository.findOne({ where: { id: order.usuario_id } });
        const project = await projectRepository.findOne({ where: { project_id: order.project_id } });
        
        return {
          ...order,
          solicitante: user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado',
          obra: project ? project.name : 'Proyecto no encontrado',
          fecha_solicitud: order.fecha_solicitud,
          fecha_requerida: order.fecha_solicitud, // Por ahora usar la misma fecha
          prioridad: 'Media', // Por defecto
          total_productos: order.items ? order.items.length : 0,
          productos: order.items ? order.items.map(item => ({
            nombre: item.nombre_producto,
            cantidad: item.cantidad,
            unidad: 'unidad', // Por defecto
            observaciones: item.descripcion
          })) : [],
          observaciones: order.descripcion
        };
      })
    );

    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error obteniendo pedidos de obra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un pedido por ID con sus items
const getWorkOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const order = await workOrderRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['items'],
    });
    if (!order) {
      return res.status(404).json({ message: 'Pedido de obra no encontrado' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo pedido de obra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar estado del pedido o de un item
const updateWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, items } = req.body;

    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const workOrderItemRepository = AppDataSource.getRepository('WorkOrderItem');

    const workOrder = await workOrderRepository.findOne({ where: { id: parseInt(id) } });
    if (!workOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    if (estado) {
      workOrder.estado = estado;
      await workOrderRepository.save(workOrder);
    }

    if (items && Array.isArray(items)) {
      for (const item of items) {
        const itemToUpdate = await workOrderItemRepository.findOne({ where: { id: item.id } });
        if (itemToUpdate) {
          itemToUpdate.estado_item = item.estado_item || itemToUpdate.estado_item;
          await workOrderItemRepository.save(itemToUpdate);
        }
      }
    }

    res.json({ message: 'Pedido de obra actualizado' });
  } catch (error) {
    console.error('Error actualizando pedido de obra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar pedido de obra
const deleteWorkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const workOrder = await workOrderRepository.findOne({ where: { id: parseInt(id) } });
    if (!workOrder) return res.status(404).json({ message: 'Pedido no encontrado' });

    await workOrderRepository.remove(workOrder);
    res.json({ message: 'Pedido de obra eliminado' });
  } catch (error) {
    console.error('Error eliminando pedido de obra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener pedidos filtrados por estado
const getWorkOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const userRepository = AppDataSource.getRepository('User');
    const projectRepository = AppDataSource.getRepository('Project');
    
    const orders = await workOrderRepository.find({
      where: { estado: status },
      relations: ['items'],
    });

    // Enriquecer los datos con información de usuario y proyecto
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const user = await userRepository.findOne({ where: { id: order.usuario_id } });
        const project = await projectRepository.findOne({ where: { project_id: order.project_id } });
        
        return {
          ...order,
          solicitante: user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado',
          obra: project ? project.name : 'Proyecto no encontrado',
          fecha_solicitud: order.fecha_solicitud,
          fecha_requerida: order.fecha_solicitud,
          prioridad: 'Media',
          total_productos: order.items ? order.items.length : 0,
          productos: order.items ? order.items.map(item => ({
            nombre: item.nombre_producto,
            cantidad: item.cantidad,
            unidad: 'unidad',
            observaciones: item.descripcion
          })) : [],
          observaciones: order.descripcion
        };
      })
    );

    res.json(enrichedOrders);
  } catch (error) {
    console.error('Error obteniendo pedidos por estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export {
  createWorkOrder,
  getAllWorkOrders,
  getWorkOrderById,
  getWorkOrdersByStatus,
  updateWorkOrder,
  deleteWorkOrder,
};
