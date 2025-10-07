import { orderDetailModel } from '../models/orderDetailModel.js';

export const getAll = async (req, res) => {
  try {
    const orderDetails = await orderDetailModel.getAll();
    res.json(orderDetails);
  } catch (error) {
    console.error('Error obteniendo detalles de órdenes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetail = await orderDetailModel.getById(id);
    
    if (!orderDetail) {
      return res.status(404).json({ message: 'Detalle de orden no encontrado' });
    }
    
    res.json(orderDetail);
  } catch (error) {
    console.error('Error obteniendo detalle de orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const orderDetail = await orderDetailModel.create(req.body);
    res.status(201).json({
      message: 'Detalle de orden creado exitosamente',
      orderDetail
    });
  } catch (error) {
    console.error('Error creando detalle de orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetail = await orderDetailModel.update(id, req.body);
    
    if (!orderDetail) {
      return res.status(404).json({ message: 'Detalle de orden no encontrado' });
    }
    
    res.json({
      message: 'Detalle de orden actualizado exitosamente',
      orderDetail
    });
  } catch (error) {
    console.error('Error actualizando detalle de orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const orderDetail = await orderDetailModel.delete(id);
    
    if (!orderDetail) {
      return res.status(404).json({ message: 'Detalle de orden no encontrado' });
    }
    
    res.json({
      message: 'Detalle de orden eliminado exitosamente',
      orderDetail
    });
  } catch (error) {
    console.error('Error eliminando detalle de orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const orderDetails = await orderDetailModel.getByOrder(orderId);
    res.json(orderDetails);
  } catch (error) {
    console.error('Error obteniendo detalles por orden:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const orderDetails = await orderDetailModel.getByProduct(productId);
    res.json(orderDetails);
  } catch (error) {
    console.error('Error obteniendo detalles por producto:', error);
    res.status(500).json({ error: error.message });
  }
};
