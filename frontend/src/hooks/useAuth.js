import { useState, useEffect, useContext, createContext } from 'react';
import { authAPI } from '@/lib/api';
import { rolesConfig } from '@/lib/roles';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        try {
          // Si hay token, pedimos el perfil actualizado al servidor
          const response = await authAPI.getProfile();
          const freshUser = response.data;
          
          // Actualizamos el estado y localStorage con la info fresca
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));

        } catch (error) {
          // Si el token es inválido o expiró, limpiamos todo
          console.error("Token inválido, cerrando sesión:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
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

