import { movementModel } from '../models/movementModel.js';

export const getAll = async (req, res) => {
  try {
    const movements = await movementModel.getAll();
    res.json(movements);
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await movementModel.getById(id);
    
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    
    res.json(movement);
  } catch (error) {
    console.error('Error obteniendo movimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const movement = await movementModel.create(req.body);
    res.status(201).json({
      message: 'Movimiento creado exitosamente',
      movement
    });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await movementModel.update(id, req.body);
    
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    
    res.json({
      message: 'Movimiento actualizado exitosamente',
      movement
    });
  } catch (error) {
    console.error('Error actualizando movimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const movement = await movementModel.delete(id);
    
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    
    res.json({
      message: 'Movimiento eliminado exitosamente',
      movement
    });
  } catch (error) {
    console.error('Error eliminando movimiento:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const movements = await movementModel.getByProduct(productId);
    res.json(movements);
  } catch (error) {
    console.error('Error obteniendo movimientos por producto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const movements = await movementModel.getByWarehouse(warehouseId);
    res.json(movements);
  } catch (error) {
    console.error('Error obteniendo movimientos por almacén:', error);
    res.status(500).json({ error: error.message });
  }
};
