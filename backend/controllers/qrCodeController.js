import { qrCodeModel } from '../models/qrCodeModel.js';

export const getAll = async (req, res) => {
  try {
    const qrCodes = await qrCodeModel.getAll();
    res.json(qrCodes);
  } catch (error) {
    console.error('Error obteniendo códigos QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeModel.getById(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error obteniendo código QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const qrCode = await qrCodeModel.create(req.body);
    res.status(201).json({
      message: 'Código QR creado exitosamente',
      qrCode
    });
  } catch (error) {
    console.error('Error creando código QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeModel.update(id, req.body);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado' });
    }
    
    res.json({
      message: 'Código QR actualizado exitosamente',
      qrCode
    });
  } catch (error) {
    console.error('Error actualizando código QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeModel.delete(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado' });
    }
    
    res.json({
      message: 'Código QR eliminado exitosamente',
      qrCode
    });
  } catch (error) {
    console.error('Error eliminando código QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const qrCodes = await qrCodeModel.getByProduct(productId);
    res.json(qrCodes);
  } catch (error) {
    console.error('Error obteniendo códigos QR por producto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByQrData = async (req, res) => {
  try {
    const { qrData } = req.params;
    const qrCode = await qrCodeModel.getByQrData(qrData);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado o inactivo' });
    }
    
    res.json(qrCode);
  } catch (error) {
    console.error('Error obteniendo código QR por datos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveQrCodes = async (req, res) => {
  try {
    const qrCodes = await qrCodeModel.getActiveQrCodes();
    res.json(qrCodes);
  } catch (error) {
    console.error('Error obteniendo códigos QR activos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeModel.deactivateQrCode(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado' });
    }
    
    res.json({
      message: 'Código QR desactivado exitosamente',
      qrCode
    });
  } catch (error) {
    console.error('Error desactivando código QR:', error);
    res.status(500).json({ error: error.message });
  }
};

export const activate = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCode = await qrCodeModel.activateQrCode(id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'Código QR no encontrado' });
    }
    
    res.json({
      message: 'Código QR activado exitosamente',
      qrCode
    });
  } catch (error) {
    console.error('Error activando código QR:', error);
    res.status(500).json({ error: error.message });
  }
};
