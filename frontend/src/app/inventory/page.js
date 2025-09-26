'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layouts/Layout';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { DataTableDemo } from './inventaryTable';

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
        {/*  Table */}
        <DataTableDemo 
          products={filteredProducts}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
       </div>
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
