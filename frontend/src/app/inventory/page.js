'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';

function InventoryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Datos de ejemplo para productos petroleros
  const sampleProducts = [
    {
      id: 1,
      nombre: 'Aceite Motor 5W-30',
      codigo: 'AM5W30001',
      categoria: 'Lubricantes',
      descripcion: 'Aceite sintético para motores de alta performance',
      unidad_medida: 'Litros',
      precio_unitario: 45.99,
      stock_minimo: 50,
      stock_actual: 120,
      ubicacion: 'Almacén A - Estante 1',
      activo: true
    },
    {
      id: 2,
      nombre: 'Gasolina Premium 95',
      codigo: 'GP95001',
      categoria: 'Combustibles',
      descripcion: 'Gasolina premium octanaje 95',
      unidad_medida: 'Litros',
      precio_unitario: 1.25,
      stock_minimo: 1000,
      stock_actual: 8500,
      ubicacion: 'Tanque Principal T1',
      activo: true
    },
    {
      id: 3,
      nombre: 'Diesel Ultra Bajo Azufre',
      codigo: 'DUBA001',
      categoria: 'Combustibles',
      descripcion: 'Diesel con contenido ultra bajo de azufre',
      unidad_medida: 'Litros',
      precio_unitario: 1.15,
      stock_minimo: 1500,
      stock_actual: 12000,
      ubicacion: 'Tanque Principal T2',
      activo: true
    },
    {
      id: 4,
      nombre: 'Grasa Multipropósito',
      codigo: 'GM001',
      categoria: 'Lubricantes',
      descripcion: 'Grasa para uso industrial multipropósito',
      unidad_medida: 'Kilogramos',
      precio_unitario: 8.50,
      stock_minimo: 25,
      stock_actual: 15,
      ubicacion: 'Almacén B - Estante 3',
      activo: true
    },
    {
      id: 5,
      nombre: 'Aditivo Anticongelante',
      codigo: 'AA001',
      categoria: 'Aditivos',
      descripcion: 'Aditivo anticongelante para sistemas de refrigeración',
      unidad_medida: 'Litros',
      precio_unitario: 12.75,
      stock_minimo: 30,
      stock_actual: 45,
      ubicacion: 'Almacén A - Estante 5',
      activo: true
    }
  ];

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Simular carga de productos
    setProducts(sampleProducts);
  }, [user, router, loading]);

  const categories = ['all', 'Combustibles', 'Lubricantes', 'Aditivos'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory && product.activo;
  });

  const getStockStatus = (product) => {
    if (product.stock_actual <= product.stock_minimo) {
      return { status: 'low', color: 'bg-red-100 text-red-800', text: 'Stock Bajo' };
    } else if (product.stock_actual <= product.stock_minimo * 1.5) {
      return { status: 'medium', color: 'bg-yellow-100 text-yellow-800', text: 'Stock Medio' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', text: 'Stock Bueno' };
    }
  };

  const generateQRData = (product) => {
    return JSON.stringify({
      id: product.id,
      codigo: product.codigo,
      nombre: product.nombre,
      stock: product.stock_actual,
      ubicacion: product.ubicacion
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Inventario de Productos
            </h1>
            <p className="mt-2 text-gray-600">
              Gestiona el inventario de productos petroleros
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Agregar Producto
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="flex space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProducts.map((product, index) => {
            const stockStatus = getStockStatus(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.nombre}
                    </h3>
                    <p className="text-sm text-gray-500">{product.codigo}</p>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Categoría:</span>
                    <span className="text-sm font-medium">{product.categoria}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock Actual:</span>
                    <span className="text-sm font-medium">
                      {product.stock_actual} {product.unidad_medida}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stock Mínimo:</span>
                    <span className="text-sm font-medium">
                      {product.stock_minimo} {product.unidad_medida}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precio:</span>
                    <span className="text-sm font-medium">
                      ${product.precio_unitario}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ubicación:</span>
                    <span className="text-sm font-medium">{product.ubicacion}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowQRModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                  >
                    Ver QR
                  </button>
                  
                  <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors">
                    Editar
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500 text-lg">
              No se encontraron productos que coincidan con los filtros
            </div>
          </motion.div>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-8 bg-white w-full max-w-md mx-4 rounded-lg shadow-lg"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Código QR - {selectedProduct.nombre}
                </h3>
                
                <div className="flex justify-center mb-4">
                  <QRCode
                    value={generateQRData(selectedProduct)}
                    size={200}
                    level="M"
                  />
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Código:</strong> {selectedProduct.codigo}</p>
                  <p><strong>Stock:</strong> {selectedProduct.stock_actual} {selectedProduct.unidad_medida}</p>
                  <p><strong>Ubicación:</strong> {selectedProduct.ubicacion}</p>
                </div>
                
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedProduct(null);
                  }}
                  className="btn-primary w-full"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal Placeholder */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative p-8 bg-white w-full max-w-md mx-4 rounded-lg shadow-lg"
            >
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Agregar Producto
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Esta funcionalidad se implementará próximamente con formularios completos para agregar nuevos productos al inventario.
                </p>
                
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-primary w-full"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function InventoryPage() {
  return (
    <AuthProvider>
      <InventoryContent />
    </AuthProvider>
  );
}
