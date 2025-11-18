import AppDataSource from '../database.js';

const getAllProjects = async (req, res) => {
    try {
        const projectRepository = AppDataSource.getRepository('Project');
        const projects = await projectRepository.find({
            select: ['project_id', 'admin_id', 'name', 'description', 'ubicacion', 'estado', 'created_at', 'updated_at']
        });
        res.json(projects);
    } catch (error) {
        console.error('Error obteniendo proyectos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const projectRepository = AppDataSource.getRepository('Project');
        const project = await projectRepository.findOne({
            where: { project_id: parseInt(id) },
            select: ['project_id', 'admin_id', 'name', 'description', 'ubicacion', 'estado', 'created_at', 'updated_at']
        });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error obteniendo proyecto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const createProject = async (req, res) => {
    try {
        const { admin_id, name, description, ubicacion, estado } = req.body;
        const projectRepository = AppDataSource.getRepository('Project');

        const project = projectRepository.create({ admin_id, name, description, ubicacion, estado: estado || 'activo' });
        await projectRepository.save(project);

        res.status(201).json({ message: 'Proyecto creado exitosamente', project });
    } catch (error) {
        console.error('Error creando proyecto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const projectRepository = AppDataSource.getRepository('Project');

        const project = await projectRepository.findOne({ where: { project_id: parseInt(id) } });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await projectRepository.update({ project_id: parseInt(id) }, updateData);
        
        // Obtener el proyecto actualizado
        const updatedProject = await projectRepository.findOne({ 
            where: { project_id: parseInt(id) },
            select: ['project_id', 'admin_id', 'name', 'description', 'ubicacion', 'estado', 'created_at', 'updated_at']
        });
        
        res.json({ message: 'Proyecto actualizado exitosamente', project: updatedProject });
    } catch (error) {
        console.error('Error actualizando proyecto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const projectRepository = AppDataSource.getRepository('Project');

        const project = await projectRepository.findOne({ where: { project_id: parseInt(id) } });
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        await projectRepository.delete(id);
        res.json({ message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando proyecto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getProjectsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const projectRepository = AppDataSource.getRepository('Project');
        
        const projects = await projectRepository.find({
            where: { estado: status },
            select: ['project_id', 'admin_id', 'name', 'description', 'ubicacion', 'estado', 'created_at', 'updated_at']
        });
        
        res.json(projects);
    } catch (error) {
        console.error('Error obteniendo proyectos por estado:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectsByStatus
};