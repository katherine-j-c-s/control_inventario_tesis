import { orderModel } from '../models/orderModel.js';

export const getAll = async (req, res) => {
  try {
    const orders = await orderModel.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.getById(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const order = await orderModel.create(req.body);
    res.status(201).json({
      message: 'Orden creada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.update(id, req.body);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json({
      message: 'Orden actualizada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error actualizando orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderModel.delete(id);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    res.json({
      message: 'Orden eliminada exitosamente',
      order
    });
  } catch (error) {
    console.error('Error eliminando orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const orders = await orderModel.getByProject(projectId);
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes por proyecto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const orders = await orderModel.getByStatus(status);
    res.json(orders);
  } catch (error) {
    console.error('Error obteniendo órdenes por estado:', error);
    res.status(500).json({ error: error.message });
  }
};
