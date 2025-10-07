import { warehouseModel } from '../models/warehouseModel.js';

export const getAll = async (req, res) => {
  try {
    const warehouses = await warehouseModel.getAll();
    res.json(warehouses);
  } catch (error) {
    console.error('Error obteniendo almacenes:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseModel.getById(id);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json(warehouse);
  } catch (error) {
    console.error('Error obteniendo almacén:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const warehouse = await warehouseModel.create(req.body);
    res.status(201).json({
      message: 'Almacén creado exitosamente',
      warehouse
    });
  } catch (error) {
    console.error('Error creando almacén:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseModel.update(id, req.body);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({
      message: 'Almacén actualizado exitosamente',
      warehouse
    });
  } catch (error) {
    console.error('Error actualizando almacén:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseModel.delete(id);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({
      message: 'Almacén eliminado exitosamente',
      warehouse
    });
  } catch (error) {
    console.error('Error eliminando almacén:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveWarehouses = async (req, res) => {
  try {
    const warehouses = await warehouseModel.getActiveWarehouses();
    res.json(warehouses);
  } catch (error) {
    console.error('Error obteniendo almacenes activos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const warehouses = await warehouseModel.getByManager(managerId);
    res.json(warehouses);
  } catch (error) {
    console.error('Error obteniendo almacenes por manager:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseModel.deactivateWarehouse(id);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({
      message: 'Almacén desactivado exitosamente',
      warehouse
    });
  } catch (error) {
    console.error('Error desactivando almacén:', error);
    res.status(500).json({ error: error.message });
  }
};

export const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const warehouse = await warehouseModel.activateWarehouse(id);
    
    if (!warehouse) {
      return res.status(404).json({ message: 'Almacén no encontrado' });
    }
    
    res.json({
      message: 'Almacén activado exitosamente',
      warehouse
    });
  } catch (error) {
    console.error('Error activando almacén:', error);
    res.status(500).json({ error: error.message });
  }
};
