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
    getReceiptById
}