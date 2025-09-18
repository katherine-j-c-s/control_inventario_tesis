'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { userAPI, roleAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { useRouter } from 'next/navigation';

function RolesAdminContent() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newRole, setNewRole] = useState({
    nombre: '',
    descripcion: '',
    permisos: {
      entrega: false,
      movimiento: false,
      egreso: false,
      admin_usuarios: false,
      admin_roles: false
    }
  });

  useEffect(() => {
    if (loading) return;
    if (!user || !isAdmin()) return;

    fetchData();
  }, [user, loading, isAdmin]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [rolesResponse, usersResponse] = await Promise.all([
        roleAPI.getRoles(),
        userAPI.getUsers()
      ]);
      
      setRoles(rolesResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await roleAPI.createRole(newRole);
      setSuccess('Rol creado exitosamente');
      setShowRoleModal(false);
      setNewRole({
        nombre: '',
        descripcion: '',
        permisos: {
          entrega: false,
          movimiento: false,
          egreso: false,
          admin_usuarios: false,
          admin_roles: false
        }
      });
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al crear rol');
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await roleAPI.updateRole(editingRole.id, newRole);
      setSuccess('Rol actualizado exitosamente');
      setShowRoleModal(false);
      setEditingRole(null);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar rol');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este rol?')) return;
    
    try {
      await roleAPI.deleteRole(roleId);
      setSuccess('Rol eliminado exitosamente');
      fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const fetchUserRoles = async (userId) => {
    try {
      const response = await roleAPI.getUserRoles(userId);
      setUserRoles(response.data);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
    }
  };

  const handleSelectUser = (userData) => {
    setSelectedUser(userData);
    fetchUserRoles(userData.id);
  };

  const handleAssignRole = async (roleId) => {
    if (!selectedUser) return;
    
    try {
      await roleAPI.assignRoleToUser(selectedUser.id, roleId);
      setSuccess('Rol asignado exitosamente');
      fetchUserRoles(selectedUser.id);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al asignar rol');
    }
  };

  const handleRemoveRole = async (roleId) => {
    if (!selectedUser) return;
    
    try {
      await roleAPI.removeRoleFromUser(selectedUser.id, roleId);
      setSuccess('Rol removido exitosamente');
      fetchUserRoles(selectedUser.id);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al remover rol');
    }
  };

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setNewRole({
      nombre: '',
      descripcion: '',
      permisos: {
        entrega: false,
        movimiento: false,
        egreso: false,
        admin_usuarios: false,
        admin_roles: false
      }
    });
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setNewRole({
      nombre: role.nombre,
      descripcion: role.descripcion,
      permisos: { ...role.permisos }
    });
    setShowRoleModal(true);
  };

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">No hay usuario autenticado</p>
          <button onClick={() => router.push('/login')} className="btn-primary mt-4">
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Acceso denegado. Solo administradores pueden acceder.</p>
          <p className="text-gray-600">Tu rol actual: {user?.rol}</p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary mt-4">
            Volver al Dashboard
          </button>
        </div>
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
            Gestión de Roles y Usuarios
          </h1>
          <p className="mt-2 text-gray-600">
            Administra roles del sistema y asigna permisos a usuarios
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

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gestión de Roles
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Asignación de Roles
            </button>
          </nav>
        </div>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Roles del Sistema</h2>
              <button
                onClick={openCreateRoleModal}
                className="btn-primary"
              >
                + Crear Rol
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role, index) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">{role.descripcion}</p>
                      {role.es_sistema && (
                        <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mt-2">
                          Sistema
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-700">Permisos:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permisos).map(([key, value]) => (
                        value && (
                          <span key={key} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            {key.replace('_', ' ')}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!role.es_sistema && (
                      <>
                        <button
                          onClick={() => openEditRoleModal(role)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Users List */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seleccionar Usuario
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((userData) => (
                  <button
                    key={userData.id}
                    onClick={() => handleSelectUser(userData)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedUser?.id === userData.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{userData.nombre} {userData.apellido}</div>
                    <div className="text-sm text-gray-500">{userData.email}</div>
                    <div className="text-sm text-gray-500">Rol actual: {userData.rol}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Role Assignment */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gestionar Roles
                {selectedUser && (
                  <span className="text-sm font-normal text-gray-600">
                    - {selectedUser.nombre} {selectedUser.apellido}
                  </span>
                )}
              </h3>

              {selectedUser ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Roles Asignados:</h4>
                    <div className="space-y-2">
                      {userRoles.length > 0 ? (
                        userRoles.map((role) => (
                          <div key={role.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                            <span className="text-sm font-medium">{role.nombre}</span>
                            <button
                              onClick={() => handleRemoveRole(role.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remover
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No tiene roles asignados</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Roles Disponibles:</h4>
                    <div className="space-y-2">
                      {roles
                        .filter(role => !userRoles.some(ur => ur.id === role.id))
                        .map((role) => (
                          <div key={role.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{role.nombre}</span>
                              <p className="text-xs text-gray-500">{role.descripcion}</p>
                            </div>
                            <button
                              onClick={() => handleAssignRole(role.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Asignar
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Selecciona un usuario para gestionar sus roles</p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Role Modal */}
      <AnimatePresence>
        {showRoleModal && (
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
                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
              </h3>

              <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    value={newRole.nombre}
                    onChange={(e) => setNewRole({ ...newRole, nombre: e.target.value })}
                    className="input-field mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={newRole.descripcion}
                    onChange={(e) => setNewRole({ ...newRole, descripcion: e.target.value })}
                    className="input-field mt-1"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permisos
                  </label>
                  <div className="space-y-2">
                    {Object.entries(newRole.permisos).map(([key, value]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNewRole({
                            ...newRole,
                            permisos: {
                              ...newRole.permisos,
                              [key]: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingRole ? 'Actualizar' : 'Crear'} Rol
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function RolesAdminPage() {
  return (
    <AuthProvider>
      <RolesAdminContent />
    </AuthProvider>
  );
}
