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
          // 1. Validamos la sesión. La respuesta ya incluye los permisos del usuario actual.
          const profileResponse = await authAPI.getProfile();
          const freshUser = profileResponse.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));

          // 2. [CORRECCIÓN] Si el usuario es admin, CARGAMOS ADICIONALMENTE el mapa de todos los roles.
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
          // Limpiamos todo en caso de error
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
      const response = await authAPI.register(userData, file);
      const { user: newUser, token: userToken } = response.data;
      
      setUser(newUser);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error en registro:', error);
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

