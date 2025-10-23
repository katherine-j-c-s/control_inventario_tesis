import { useState, useEffect } from "react";

export const useWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('all');

  // Datos de ejemplo para demostración
  const mockData = [
    {
      id: 1,
      solicitante: "Juan Pérez",
      obra: "Armado de Pozo - Sede Central",
      fecha_solicitud: "2024-01-15",
      fecha_requerida: "2024-01-20",
      prioridad: "Alta",
      estado: "Pendiente",
      total_productos: 3,
      productos: [
        { nombre: "Cemento Portland", cantidad: 50, unidad: "bolsa" },
        { nombre: "Ladrillos cerámicos", cantidad: 1000, unidad: "unidad" },
        { nombre: "Arena gruesa", cantidad: 5, unidad: "m³" },
      ],
      observaciones: "Materiales necesarios para la primera fase del proyecto",
    },
    {
      id: 2,
      solicitante: "María González",
      obra: "Construcción Edificio A - Sede Norte",
      fecha_solicitud: "2024-01-14",
      fecha_requerida: "2024-01-18",
      prioridad: "Media",
      estado: "Aprobada",
      total_productos: 2,
      productos: [
        { nombre: "Acero de construcción", cantidad: 200, unidad: "kg" },
        { nombre: "Alambre de amarre", cantidad: 10, unidad: "rollo" },
      ],
      observaciones: "Refuerzos para estructura",
    },
    {
      id: 3,
      solicitante: "Carlos López",
      obra: "Remodelación Oficinas - Sede Sur",
      fecha_solicitud: "2024-01-13",
      fecha_requerida: "2024-01-25",
      prioridad: "Baja",
      estado: "Rechazada",
      total_productos: 1,
      productos: [
        { nombre: "Pintura blanca", cantidad: 20, unidad: "litro" },
      ],
      observaciones: "Pintura para oficinas",
    },
    {
      id: 4,
      solicitante: "Ana Martínez",
      obra: "Armado de Pozo - Sede Central",
      fecha_solicitud: "2024-01-12",
      fecha_requerida: "2024-01-22",
      prioridad: "Urgente",
      estado: "Pendiente",
      total_productos: 4,
      productos: [
        { nombre: "Tubos de PVC", cantidad: 100, unidad: "metro" },
        { nombre: "Codos 90°", cantidad: 20, unidad: "unidad" },
        { nombre: "Cemento hidráulico", cantidad: 30, unidad: "bolsa" },
        { nombre: "Arena fina", cantidad: 3, unidad: "m³" },
      ],
      observaciones: "Sistema de drenaje para el pozo",
    },
  ];

  const handleError = (error) => {
    console.error('Error:', error);
    setError(error.response?.data?.error || 'Error al procesar la solicitud');
    setSuccess(null);
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleGetAll = async () => {
    setLoadingData(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkOrders(mockData);
      setCurrentView('all');
      showSuccess('Solicitudes cargadas correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGetPending = async () => {
    setLoadingData(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pending = mockData.filter(order => order.estado === 'Pendiente');
      setWorkOrders(pending);
      setCurrentView('pending');
      showSuccess('Solicitudes pendientes cargadas');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGetApproved = async () => {
    setLoadingData(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const approved = mockData.filter(order => order.estado === 'Aprobada');
      setWorkOrders(approved);
      setCurrentView('approved');
      showSuccess('Solicitudes aprobadas cargadas');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGetRejected = async () => {
    setLoadingData(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const rejected = mockData.filter(order => order.estado === 'Rechazada');
      setWorkOrders(rejected);
      setCurrentView('rejected');
      showSuccess('Solicitudes rechazadas cargadas');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleViewChange = (view) => {
    switch (view) {
      case 'all':
        handleGetAll();
        break;
      case 'pending':
        handleGetPending();
        break;
      case 'approved':
        handleGetApproved();
        break;
      case 'rejected':
        handleGetRejected();
        break;
      default:
        handleGetAll();
    }
  };

  const handleRefresh = () => {
    handleViewChange(currentView);
  };

  const handleApprove = async (orderId) => {
    setLoadingData(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, estado: 'Aprobada' } : order
      ));
      showSuccess('Solicitud aprobada exitosamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReject = async (orderId) => {
    setLoadingData(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, estado: 'Rechazada' } : order
      ));
      showSuccess('Solicitud rechazada');
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingData(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    handleGetAll();
  }, []);

  const totalCount = mockData.length;
  const pendingCount = mockData.filter(order => order.estado === 'Pendiente').length;
  const approvedCount = mockData.filter(order => order.estado === 'Aprobada').length;
  const rejectedCount = mockData.filter(order => order.estado === 'Rechazada').length;

  return {
    workOrders,
    loadingData,
    error,
    success,
    currentView,
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    handleViewChange,
    handleRefresh,
    handleApprove,
    handleReject,
  };
};
