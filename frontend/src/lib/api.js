import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  register: (userData, file) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    if (file) {
      formData.append('foto', file);
    }
    return api.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  getProfile: () => {
    return api.get('/auth/profile');
  },
};

// Funciones de gestión de usuarios
export const userAPI = {
  getUsers: () => {
    return api.get('/users');
  },

  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },

  updateUser: (id, userData, file) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        formData.append(key, userData[key]);
      }
    });
    if (file) {
      formData.append('foto', file);
    }
    return api.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateUserRole: (id, rol) => {
    return api.patch(`/users/${id}/role`, { rol });
  },

  updateUserPermissions: (id, permisos) => {
    return api.patch(`/users/${id}/permissions`, { permisos });
  },

  deleteUser: (id) => {
    return api.delete(`/users/${id}`);
  },
};

// Funciones de gestión de roles
export const roleAPI = {
  getRoles: () => {
    return api.get('/roles');
  },

  createRole: (roleData) => {
    return api.post('/roles', roleData);
  },

  updateRole: (id, roleData) => {
    return api.put(`/roles/${id}`, roleData);
  },

  deleteRole: (id) => {
    return api.delete(`/roles/${id}`);
  },

  assignRoleToUser: (userId, roleId) => {
    return api.post('/roles/assign', { userId, roleId });
  },

  removeRoleFromUser: (userId, roleId) => {
    return api.post('/roles/remove', { userId, roleId });
  },

  getUserRoles: (userId) => {
    return api.get(`/roles/user/${userId}`);
  },

  getUsersByRole: (roleId) => {
    return api.get(`/roles/${roleId}/users`);
  },
};

export default api;
