'use client';

import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI, roleAPI } from '@/lib/api';
import { allRoutes } from '@/lib/roles';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rolePermissions, setRolePermissions] = useState({});

  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          const profileResponse = await authAPI.getProfile();
          const freshUser = profileResponse.data;
          console.log('Usuario cargado desde API:', freshUser);
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));

          if (freshUser.rol === 'admin') {
            const rolesResponse = await roleAPI.getRoles();
            const rolesFromDB = rolesResponse.data;
            
            const dynamicRolesConfig = rolesFromDB.reduce((acc, role) => {
              const allowedRouteKeys = Object.entries(role.permisos || {})
                .filter(([, hasAccess]) => hasAccess)
                .map(([key]) => key);
              
              acc[role.nombre] = {
                name: role.nombre,
                routes: allowedRouteKeys.map(key => allRoutes[key]).filter(Boolean)
              };
              return acc;
            }, {});
            
            setRolePermissions(dynamicRolesConfig);
          }
        } catch (error) {
          console.error("Token inválido o error de sesión:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setRolePermissions({});
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, token: userToken } = response.data;
      
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (userData, file) => {
    try {
      console.log('=== INICIO REGISTRO FRONTEND ===');
      console.log('Datos del usuario:', userData);
      console.log('Archivo:', file);
      console.log('URL de la API:', 'http://localhost:5001/api/auth/register');
      
      const response = await authAPI.register(userData, file);
      console.log('Respuesta del servidor:', response.data);
      
      const { user: newUser, token: userToken } = response.data;
      
      setUser(newUser);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('Registro exitoso');
      return { success: true, user: newUser };
    } catch (error) {
      console.error('=== ERROR EN REGISTRO FRONTEND ===');
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('===============================');
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserData = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const refreshUser = async () => {
    try {
      const profileResponse = await authAPI.getProfile();
      const freshUser = profileResponse.data;
      console.log('Usuario refrescado desde API:', freshUser);
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return { success: true, user: freshUser };
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      return { success: false, error: error.message };
    }
  };

  const isAdmin = () => {
    return user?.rol === 'admin';
  };

  const hasPermission = (permission) => {
    return user?.rol === 'admin' || user?.permisos?.[permission] === true;
  };

  const value = {
    user,
    loading,
    rolePermissions,
    login,
    register,
    logout,
    updateUserData,
    refreshUser,
    isAdmin,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

