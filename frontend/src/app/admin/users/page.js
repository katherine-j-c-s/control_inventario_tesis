'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { userAPI } from '@/lib/api';
import Layout from '@/components/layouts/Layout';
import { useRouter } from 'next/navigation';

function UsersAdminContent() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'edit', 'role', 'permissions'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userData) => {
    setSelectedUser(userData);
    setModalType('edit');
    setShowModal(true);
  };

  const handleChangeRole = (userData) => {
    setSelectedUser(userData);
    setModalType('role');
    setShowModal(true);
  };

  const handleChangePermissions = (userData) => {
    setSelectedUser(userData);
    setModalType('permissions');
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await userAPI.deleteUser(userId);
      setSuccess('Usuario eliminado exitosamente');
      fetchUsers();
    } catch (error) {
      setError('Error al eliminar usuario');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType('');
  };

  if (!user || !isAdmin()) {
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
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Administrar Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona usuarios, roles y permisos del sistema
          </p>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md"
            >
              {error}
              <button
                onClick={() => setError('')}
                className="float-right text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md"
            >
              {success}
              <button
                onClick={() => setSuccess('')}
                className="float-right text-green-400 hover:text-green-600"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-gray-600">Cargando usuarios...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Información
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permisos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userData, index) => (
                    <motion.tr
                      key={userData.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {userData.foto && (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/uploads/${userData.foto}`}
                              alt=""
                            />
                          )}
                          <div className={userData.foto ? "ml-4" : ""}>
                            <div className="text-sm font-medium text-gray-900">
                              {userData.nombre} {userData.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              {userData.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">DNI: {userData.dni}</div>
                        <div className="text-sm text-gray-500">{userData.puesto_laboral}</div>
                        <div className="text-sm text-gray-500">
                          {userData.edad} años - {userData.genero}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userData.rol === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          {userData.permisos.entrega && (
                            <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mr-1">
                              Entrega
                            </span>
                          )}
                          {userData.permisos.movimiento && (
                            <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mr-1">
                              Movimiento
                            </span>
                          )}
                          {userData.permisos.egreso && (
                            <span className="inline-flex px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full mr-1">
                              Egreso
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(userData)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleChangeRole(userData)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                          >
                            Rol
                          </button>
                          <button
                            onClick={() => handleChangePermissions(userData)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Permisos
                          </button>
                          {userData.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(userData.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <UserModal
            user={selectedUser}
            type={modalType}
            onClose={closeModal}
            onSuccess={() => {
              setSuccess('Usuario actualizado exitosamente');
              fetchUsers();
              closeModal();
            }}
            onError={setError}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}

function UserModal({ user, type, onClose, onSuccess, onError }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === 'role') {
      setFormData({ rol: user.rol });
    } else if (type === 'permissions') {
      setFormData({ permisos: { ...user.permisos } });
    } else {
      setFormData({ ...user });
    }
  }, [user, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'role') {
        await userAPI.updateUserRole(user.id, formData.rol);
      } else if (type === 'permissions') {
        await userAPI.updateUserPermissions(user.id, formData.permisos);
      } else {
        await userAPI.updateUser(user.id, formData);
      }
      onSuccess();
    } catch (error) {
      onError('Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'role': return 'Cambiar Rol';
      case 'permissions': return 'Gestionar Permisos';
      default: return 'Editar Usuario';
    }
  };

  return (
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {getModalTitle()}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <select
                value={formData.rol || ''}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="input-field mt-1"
                required
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          {type === 'permissions' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Permisos
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permisos?.entrega || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      permisos: {
                        ...formData.permisos,
                        entrega: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Entrega de productos</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permisos?.movimiento || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      permisos: {
                        ...formData.permisos,
                        movimiento: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Movimiento de inventario</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permisos?.egreso || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      permisos: {
                        ...formData.permisos,
                        egreso: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Egreso de productos</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function UsersAdminPage() {
  return (
    <AuthProvider>
      <UsersAdminContent />
    </AuthProvider>
  );
}
