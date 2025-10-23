import AppDataSource from '../database.js';

// Crear un pedido de obra con varios items
const createWorkOrder = async (req, res) => {
  try {
    const { project_id, descripcion, usuario_id, items } = req.body;

    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const workOrderItemRepository = AppDataSource.getRepository('WorkOrderItem');

    // Crear pedido principal
    const workOrder = workOrderRepository.create({
      project_id,
      descripcion,
      usuario_id,
      estado: 'pendiente',
    });
    await workOrderRepository.save(workOrder);

    // Crear items asociados
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const workOrderItem = workOrderItemRepository.create({
          work_order: workOrder,
          nombre_producto: item.nombre_producto,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          estado_item: 'pendiente',
        });
        await workOrderItemRepository.save(workOrderItem);
      }
    }

    res.status(201).json({ message: 'Pedido de obra creado', workOrder });
  } catch (error) {
    console.error('Error creando pedido de obra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener todos los pedidos con sus items
const getAllWorkOrders = async (req, res) => {
  try {
    const workOrderRepository = AppDataSource.getRepository('WorkOrder');
    const orders = await workOrderRepository.find({
      relations: ['items'],
    });
    res.json(orders);
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

export {
  createWorkOrder,
  getAllWorkOrders,
  getWorkOrderById,
  updateWorkOrder,
  deleteWorkOrder,
};
