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

        console.log('Datos recibidos:', req.body);

        try {
            // Intentar con TypeORM primero
            const movementRepository = AppDataSource.getRepository('Movements');

            // Crear objeto base con campos requeridos
            const movementData = {
                movement_type, 
                date, 
                quantity, 
                product_id, 
                status, 
                user_id, 
                ubicacionactual: ubicacionactual || null
            };

            // Agregar campos opcionales solo si existen
            if (motivo !== undefined) {
                movementData.motivo = motivo;
            }
            if (destinatario !== undefined) {
                movementData.destinatario = destinatario;
            }
            if (observaciones !== undefined) {
                movementData.observaciones = observaciones;
            }

            console.log('Datos a guardar:', movementData);

            const movement = movementRepository.create(movementData);
            await movementRepository.save(movement);
            
            res.status(201).json({ message: 'Movimiento creado exitosamente', movement });
        } catch (typeormError) {
            console.log('Error con TypeORM, intentando con SQL directo:', typeormError.message);
            
            // Respaldo con SQL directo si TypeORM falla
            const { pool } = await import('../db.js');
            
            const query = `
                INSERT INTO movements (
                    movement_type, date, quantity, product_id, status, user_id, ubicacionactual
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
            `;
            
            const values = [
                movement_type,
                date,
                quantity,
                product_id,
                status,
                user_id,
                ubicacionactual || null
            ];
            
            const { rows } = await pool.query(query, values);
            res.status(201).json({ message: 'Movimiento creado exitosamente', movement: rows[0] });
        }
    } catch (error) {
        console.error('Error creando movimiento:', error);
        console.error('Request body:', req.body);
        console.error('Stack trace:', error.stack);
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
