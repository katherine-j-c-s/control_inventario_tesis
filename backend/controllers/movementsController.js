import AppDataSource from '../database.js';

const getAllMovements = async (req, res) => {
    try {
        // Verificar que AppDataSource esté inicializado
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Usar SQL directo para obtener información relacionada
        const { pool } = await import('../db.js');
        
        const query = `
            SELECT 
                m.movement_id,
                m.movement_type,
                m.date,
                m.quantity,
                m.product_id,
                m.status,
                m.user_id,
                m.ubicacion_actual,
                m.estanteria_actual,
                p.nombre as product_name,
                u.nombre as user_name
            FROM movements m
            LEFT JOIN products p ON m.product_id = p.id AND p.activo = true
            LEFT JOIN users u ON m.user_id = u.id
            ORDER BY m.date DESC, m.movement_id DESC
            LIMIT 200;
        `;
        
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error obteniendo movimientos:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
                'product_id', 'status', 'user_id', 'ubicacion_actual',
                'estanteria_actual'
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
            ubicacion_actual,
            estanteria_actual
        } = req.body;

        // Usar SQL directo ya que la tabla no tiene todos los campos que el modelo espera
        const { pool } = await import('../db.js');
        
        const query = `
            INSERT INTO movements (
                movement_type, date, quantity, product_id, status, user_id, ubicacion_actual, estanteria_actual
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        
        const values = [
            movement_type,
            date,
            quantity,
            product_id,
            status,
            user_id,
            ubicacion_actual || null,
            estanteria_actual || null
        ];
        
        const { rows } = await pool.query(query, values);
        res.status(201).json({ message: 'Movimiento creado exitosamente', movement: rows[0] });
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
