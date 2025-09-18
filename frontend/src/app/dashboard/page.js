'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

function DashboardContent() {
  const { user, loading, isAdmin, hasPermission } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    productosStock: 0,
    alertasStock: 0
  });

  useEffect(() => {
    if (loading) return; // Esperar a que termine de cargar
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Aquí podrías hacer llamadas a la API para obtener estadísticas
    // Por ahora usamos datos de ejemplo
    setStats({
      totalUsuarios: 15,
      totalProductos: 250,
      productosStock: 230,
      alertasStock: 5
    });
  }, [user, router, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user.nombre} {user.apellido}
          </h1>
          <p className="mt-2 text-gray-600">
            Panel de control del sistema de inventario
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin() && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Total Usuarios</h3>
                  <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
                </div>
                <div className="text-blue-200">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-r from-green-500 to-green-600 text-white"
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Total Productos</h3>
                <p className="text-3xl font-bold">{stats.totalProductos}</p>
              </div>
              <div className="text-green-200">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">En Stock</h3>
                <p className="text-3xl font-bold">{stats.productosStock}</p>
              </div>
              <div className="text-yellow-200">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-r from-red-500 to-red-600 text-white"
          >
            <div className="flex items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">Alertas Stock</h3>
                <p className="text-3xl font-bold">{stats.alertasStock}</p>
              </div>
              <div className="text-red-200">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isAdmin() && (
              <>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="flex items-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                >
                  <svg className="w-8 h-8 text-primary-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Administrar Usuarios</h3>
                    <p className="text-sm text-gray-600">Gestionar usuarios y permisos</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/admin/roles')}
                  className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <svg className="w-8 h-8 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Gestión de Roles</h3>
                    <p className="text-sm text-gray-600">Crear roles y asignar permisos</p>
                  </div>
                </button>
              </>
            )}

            <button
              onClick={() => router.push('/inventory')}
              className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <svg className="w-8 h-8 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Ver Inventario</h3>
                <p className="text-sm text-gray-600">Consultar productos disponibles</p>
              </div>
            </button>

            {hasPermission('entrega') && (
              <button
                onClick={() => router.push('/movements/delivery')}
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Entregas</h3>
                  <p className="text-sm text-gray-600">Gestionar entregas de productos</p>
                </div>
              </button>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nuevo usuario registrado: María García
                </p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Producto actualizado: Aceite Motor 5W-30
                </p>
                <p className="text-xs text-gray-500">Hace 4 horas</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Alerta de stock bajo: Gasolina Premium
                </p>
                <p className="text-xs text-gray-500">Hace 6 horas</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
