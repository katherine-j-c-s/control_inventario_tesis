// controllers/WorkOrderItemController.js
import AppDataSource from '../database.js';

// Obtener todos los items de un pedido específico
const getItemsByWorkOrder = async (req, res) => {
  try {
    const { work_order_id } = req.params;
    const itemRepository = AppDataSource.getRepository('WorkOrderItem');

    const items = await itemRepository.find({
      where: { work_order_id: parseInt(work_order_id) },
    });

    res.json(items);
  } catch (error) {
    console.error('Error obteniendo items del pedido:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo item para un pedido existente
const createItem = async (req, res) => {
  try {
    const { work_order_id, nombre_producto, descripcion, cantidad } = req.body;
    const itemRepository = AppDataSource.getRepository('WorkOrderItem');

    const newItem = itemRepository.create({
      work_order_id,
      nombre_producto,
      descripcion,
      cantidad,
    });

    await itemRepository.save(newItem);
    res.status(201).json({ message: 'Item agregado exitosamente', item: newItem });
  } catch (error) {
    console.error('Error creando item:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar un item (cantidad o estado)
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad, estado_item } = req.body;
    const itemRepository = AppDataSource.getRepository('WorkOrderItem');

    const item = await itemRepository.findOne({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });

    if (cantidad !== undefined) item.cantidad = cantidad;
    if (estado_item !== undefined) item.estado_item = estado_item;

    await itemRepository.save(item);
    res.json({ message: 'Item actualizado exitosamente', item });
  } catch (error) {
    console.error('Error actualizando item:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un item de un pedido
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemRepository = AppDataSource.getRepository('WorkOrderItem');

    const item = await itemRepository.findOne({ where: { id: parseInt(id) } });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });

    await itemRepository.remove(item);
    res.json({ message: 'Item eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando item:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export {
  getItemsByWorkOrder,
  createItem,
  updateItem,
  deleteItem,
};
