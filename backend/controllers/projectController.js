import { projectModel } from '../models/projectModel.js';

export const getAll = async (req, res) => {
  try {
    const projects = await projectModel.getAll();
    res.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getById(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const project = await projectModel.create(req.body);
    res.status(201).json({
      message: 'Proyecto creado exitosamente',
      project
    });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.update(id, req.body);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.json({
      message: 'Proyecto actualizado exitosamente',
      project
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.delete(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    res.json({
      message: 'Proyecto eliminado exitosamente',
      project
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const projects = await projectModel.getByStatus(status);
    res.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos por estado:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const projects = await projectModel.getByManager(managerId);
    res.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos por manager:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveProjects = async (req, res) => {
  try {
    const projects = await projectModel.getActiveProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error obteniendo proyectos activos:', error);
    res.status(500).json({ error: error.message });
  }
};
