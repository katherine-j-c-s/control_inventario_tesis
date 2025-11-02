import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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

  updateProfile: (userData, file) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && userData[key] !== null) {
        formData.append(key, userData[key]);
      }
    });
    if (file) {
      formData.append('foto', file);
    }
    return api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

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

export const receiptAPI = {
  getAllReceipts: () => {
    return api.get('/receipts');
  },

  getUnverifiedReceipts: () => {
    return api.get('/receipts/unverified');
  },

  getVerifiedReceipts: () => {
    return api.get('/receipts/verified');
  },

  getReceiptsByStatus: (status) => {
    return api.get(`/receipts/status/${status}`);
  },

  getReceiptsStatistics: () => {
    return api.get('/receipts/statistics');
  },

  verifyReceipt: (id) => {
    return api.put(`/receipts/verify/${id}`);
  },

  getReceiptWithProducts: (id) => {
    return api.get(`/receipts/${id}`);
  },

  createReceipt: (receiptData) => {
    return api.post('/receipts', receiptData);
  },

  uploadReceiptFile: (fileData) => {
    return api.post('/receipts/upload', fileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getWarehouses: () => {
    return api.get('/warehouses');
  },
};

export const orderAPI = {
  getOrderById: (id) => {
    return api.get(`/orders/${id}`);
  },

  getAllOrders: () => {
    return api.get('/orders');
  },

  createOrder: (orderData) => {
    return api.post('/orders', orderData);
  },

  updateOrder: (id, orderData) => {
    return api.put(`/orders/${id}`, orderData);
  },

  deleteOrder: (id) => {
    return api.delete(`/orders/${id}`);
  },

  getStatistics: () => {
    return api.get('/orders/statistics');
  },

  getOrderProducts: (id) => {
    return api.get(`/orders/${id}/products`);
  },

  // Generar informe PDF de una orden
  // Retorna un blob que debe ser manejado para descargar el archivo
  generateOrderReport: async (id) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_URL}/order-report/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al generar el informe: ${response.statusText}`);
    }

    return response.blob();
  },
};

export const projectAPI = {
  getAllProjects: () => {
    return api.get('/projects');
  },

  getProjectById: (id) => {
    return api.get(`/projects/${id}`);
  },

  getProjectsByStatus: (status) => {
    return api.get(`/projects/status/${status}`);
  },

  createProject: (projectData) => {
    return api.post('/projects', projectData);
  },

  updateProject: (id, projectData) => {
    return api.put(`/projects/${id}`, projectData);
  },

  deleteProject: (id) => {
    return api.delete(`/projects/${id}`);
  },
};

export const workOrderAPI = {
  getAllWorkOrders: () => {
    return api.get('/work-orders');
  },

  getWorkOrderById: (id) => {
    return api.get(`/work-orders/${id}`);
  },

  getWorkOrdersByStatus: (status) => {
    return api.get(`/work-orders/status/${status}`);
  },

  createWorkOrder: (workOrderData) => {
    return api.post('/work-orders', workOrderData);
  },

  updateWorkOrder: (id, workOrderData) => {
    return api.put(`/work-orders/${id}`, workOrderData);
  },

  deleteWorkOrder: (id) => {
    return api.delete(`/work-orders/${id}`);
  },
};

export const productAPI = {
  getAllProducts: () => {
    return api.get('/productos');
  },

  getProductById: (id) => {
    return api.get(`/productos/${id}`);
  },

  getProductByCode: async (code) => {
    const products = await api.get('/productos');
    return products.data.find(p => p.codigo === code);
  },

  // Nuevo método para procesar egreso de producto (resta cantidad del stock)
  processProductOutput: (productId, cantidad) => {
    return api.post(`/productos/${productId}/egreso`, { cantidad });
  },
};

export const movementAPI = {
  getAllMovements: () => {
    return api.get('/movements');
  },

  getMovementById: (id) => {
    return api.get(`/movements/${id}`);
  },

  createMovement: (movementData) => {
    return api.post('/movements', movementData);
  },

  updateMovement: (id, movementData) => {
    return api.put(`/movements/${id}`, movementData);
  },

  deleteMovement: (id) => {
    return api.delete(`/movements/${id}`);
  },
};

export default api;
