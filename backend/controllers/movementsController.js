import AppDataSource from '../database.js';

const getAllMovements = async (req, res) => {
    try {
        const movementRepository = AppDataSource.getRepository('Movements');
        const movements = await movementRepository.find({
            select: [
                'movement_id', 'movement_type', 'date', 'quantity',
                'product_id', 'status', 'user_id', 'ubicacionactual',
                'motivo', 'destinatario', 'observaciones', 'created_at', 'updated_at'
            ]
        });
        res.json(movements);
    } catch (error) {
        console.error('Error obteniendo movimientos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const getMovementById = async (req, res) => {
    try {
        const { id } = req.params;
        const movementRepository = AppDataSource.getRepository('Movements');
        const movement = await movementRepository.findOne({
            where: { movement_id: parseInt(id) },
            select: [
                'movement_id', 'movement_type', 'date', 'quantity',
                'product_id', 'status', 'user_id', 'ubicacionactual',
                'motivo', 'destinatario', 'observaciones', 'created_at', 'updated_at'
            ]
        });

        if (!movement) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        res.json(movement);
    } catch (error) {
        console.error('Error obteniendo movimiento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const createMovement = async (req, res) => {
    try {
        const { 
            movement_type, 
            date, 
            quantity, 
            product_id, 
            status, 
            user_id, 
            ubicacionactual,
            motivo,
            destinatario,
            observaciones
        } = req.body;

        const movementRepository = AppDataSource.getRepository('Movements');

        const movement = movementRepository.create({
            movement_type, 
            date, 
            quantity, 
            product_id, 
            status, 
            user_id, 
            ubicacionactual,
            motivo,
            destinatario,
            observaciones
        });

        await movementRepository.save(movement);
        res.status(201).json({ message: 'Movimiento creado exitosamente', movement });
    } catch (error) {
        console.error('Error creando movimiento:', error);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

const updateMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const movementRepository = AppDataSource.getRepository('Movements');

        const movement = await movementRepository.findOne({ where: { movement_id: parseInt(id) } });
        if (!movement) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        await movementRepository.update(id, updateData);
        res.json({ message: 'Movimiento actualizado exitosamente', movement });
    } catch (error) {
        console.error('Error actualizando movimiento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const deleteMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const movementRepository = AppDataSource.getRepository('Movements');

        const movement = await movementRepository.findOne({ where: { movement_id: parseInt(id) } });
        if (!movement) {
            return res.status(404).json({ message: 'Movimiento no encontrado' });
        }

        await movementRepository.delete(id);
        res.json({ message: 'Movimiento eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando movimiento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export {
    getAllMovements,
    getMovementById,
    createMovement,
    updateMovement,
    deleteMovement
};
