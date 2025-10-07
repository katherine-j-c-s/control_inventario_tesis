const { 
  getUnverifiedReceipts, 
  getAllReceipts, 
  verifyReceipt, 
  getVerifiedReceipts, 
  getReceiptsByStatus, 
  getReceiptsStatistics 
} = require('../models/Receipt.js');

async function getUnverified(req, res) {
    try {
        const data = await getUnverifiedReceipts();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAll(req, res) {
    try {
        const data = await getAllReceipts();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function verify(req, res) {
    try {
        const { id } = req.params;
        const data = await verifyReceipt(id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getVerified(req, res) {
    try {
        const data = await getVerifiedReceipts();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getByStatus(req, res) {
    try {
        const { status } = req.params;
        const data = await getReceiptsByStatus(status);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getStatistics(req, res) {
    try {
        const data = await getReceiptsStatistics();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const createReceipt = async (req, res) => {
    try {
        const data = await createReceipt(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const updateReceipt = async (req, res) => {
    try {
        const data = await updateReceipt(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteReceipt = async (req, res) => {
    try {
        const data = await deleteReceipt(req.body);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getReceiptById = async (req, res) => {
    try {
        const { id } = req.params;
        const receiptRepository = AppDataSource.getRepository('Receipt');
        const Receipt = await receiptRepository.findOne({
            where: { id: parseInt(id), activo: true },
            select: [
                'id', 'warehouse_id', 'quantity_products',
                'entry_date', 'verification_status', 'order_id',
                'product_id', 'status'
            ]
        });
        res.json(Receipt);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getReceiptWithProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { pool } = require('../db.js');
        
        const query = `
            SELECT 
                r.receipt_id,
                r.warehouse_id,
                r.entry_date,
                r.verification_status,
                r.order_id,
                r.status,
                rp.product_id,
                rp.quantity,
                p.nombre as product_name,
                p.descripcion as product_description,
                p.categoria as product_category,
                p.unidad_medida as product_unit,
                p.precio_unitario as product_price
            FROM receipts r
            LEFT JOIN receipt_products rp ON r.receipt_id = rp.receipt_id
            LEFT JOIN products p ON rp.product_id = p.id AND p.activo = true
            WHERE r.receipt_id = $1
            ORDER BY p.nombre;
        `;
        
        const { rows } = await pool.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Remito no encontrado' });
        }
        
        const receipt = {
            receipt_id: rows[0].receipt_id,
            warehouse_id: rows[0].warehouse_id,
            quantity_products: 0,
            entry_date: rows[0].entry_date,
            verification_status: rows[0].verification_status,
            order_id: rows[0].order_id,
            status: rows[0].status,
            products: []
        };
        
        rows.forEach(row => {
            if (row.product_id) {
                receipt.products.push({
                    product_id: row.product_id,
                    product_name: row.product_name,
                    product_description: row.product_description,
                    product_category: row.product_category,
                    product_unit: row.product_unit,
                    product_price: row.product_price,
                    quantity: row.quantity
                });
            }
        });
        
        receipt.quantity_products = receipt.products.length;
        
        res.json(receipt);
    } catch (error) {
        console.error('Error obteniendo remito con productos:', error);
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getUnverified,
    getAll,
    verify,
    getVerified,
    getByStatus,
    getStatistics,
    createReceipt,
    updateReceipt,
    deleteReceipt,
    getReceiptById,
    getReceiptWithProducts
}