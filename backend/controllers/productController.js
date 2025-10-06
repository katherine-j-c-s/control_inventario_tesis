const bcrypt = require('bcryptjs');
const AppDataSource = require('../database');

const getAllProducts = async (req, res) => {
    try {
        const productRepository = AppDataSource.getRepository('Product');
        const products = await productRepository.find({
            where: { activo: true },
            select: [
                'id', 'nombre', 'codigo', 'categoria',
                'descripcion', 'unidad_medida', 'precio_unitario',
                'stock_minimo', 'stock_actual', 'ubicacion', 'qr_code',
                'activo', 'created_at', 'updated_at'
            ]
        });
        res.json(products);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }

}


const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const productRepository = AppDataSource.getRepository('Product');
        const product = await productRepository.findOne({
            where: { id: parseInt(id), activo: true },
            select: [
                'id', 'nombre', 'codigo', 'categoria',
                'descripcion', 'unidad_medida', 'precio_unitario',
                'stock_minimo', 'stock_actual', 'ubicacion', 'qr_code',
                'activo', 'created_at', 'updated_at'
            ]
        });
        res.json(product);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const productRepository = AppDataSource.getRepository('Product');
        const product = await productRepository.findOne({
            where: { id: parseInt(id), activo: true },
        });
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        await productRepository.update(id, updateData);
        res.json({ message: 'Producto actualizado exitosamente', product });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productRepository = AppDataSource.getRepository('Product');
        const product = await productRepository.findOne({
            where: { id: parseInt(id), activo: true },
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }

}

const createProduct = async (req, res) => {
    try {
        const { nombre, codigo, categoria, descripcion, unidad_medida, precio_unitario, stock_minimo, stock_actual, ubicacion, qr_code } = req.body;
        const productRepository = AppDataSource.getRepository('Product');
        const product = await productRepository.create({ nombre, codigo, categoria, descripcion, unidad_medida, precio_unitario, stock_minimo, stock_actual, ubicacion, qr_code });
        await productRepository.save(product);
        res.status(201).json({ message: 'Producto creado exitosamente', product });
    }
    catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}


module.exports = {
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProduct
}