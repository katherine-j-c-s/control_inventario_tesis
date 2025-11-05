"use client";

import { useState } from "react";
import { orderAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const initialFormData = {
  company_name: "Simetra S.A.",
  company_address: "",
  responsible_person: "",
  supplier: "",
  contact: "",
  issue_date: new Date().toISOString().split("T")[0],
  delivery_date: "",
  status: false,
  delivery_status: "Pending",
  amount: 0,
  total: 0,
  item_quantity: 0,
  notes: "",
};

const initialProduct = { 
  articulo: "", 
  descripcion: "", 
  cantidad: 1, 
  precio_unitario: 0, 
  importe: 0 
};

export const useOrderForm = ({ onOrderCreated, onClose }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormData);
  const [productos, setProductos] = useState([initialProduct]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotals = (products) => {
    const validProducts = products.filter(p => p.articulo && p.cantidad > 0 && p.precio_unitario > 0);
    const subtotal = validProducts.reduce((sum, p) => sum + (p.importe || 0), 0);
    const totalQuantity = validProducts.reduce((sum, p) => sum + (parseInt(p.cantidad) || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      amount: subtotal,
      total: subtotal,
      item_quantity: totalQuantity
    }));
  };

  const addProducto = () => {
    setProductos(prev => [...prev, { ...initialProduct }]);
  };

  const updateProducto = (index, updatedProduct) => {
    setProductos(prev => {
      const newProducts = prev.map((product, i) => (i === index ? updatedProduct : product));
      calculateTotals(newProducts);
      return newProducts;
    });
  };

  const removeProducto = (index) => {
    if (productos.length > 1) {
      setProductos(prev => {
        const newProducts = prev.filter((_, i) => i !== index);
        calculateTotals(newProducts);
        return newProducts;
      });
    }
  };

  const validateForm = () => {
    if (!formData.company_name || !formData.supplier) {
      setError("Por favor, completa los campos obligatorios de la empresa y proveedor");
      return false;
    }

    if (!formData.issue_date || !formData.delivery_date) {
      setError("Por favor, completa las fechas de emisión y entrega");
      return false;
    }

    const validProductos = productos.filter(p => p.articulo && p.cantidad > 0 && p.precio_unitario > 0);
    if (validProductos.length === 0) {
      setError("Debe agregar al menos un producto válido");
      return false;
    }

    return true;
  };

  const prepareOrderData = () => ({
    supplier: formData.supplier?.trim(),
    status: formData.delivery_status === "Delivered",
    issue_date: formData.issue_date,
    delivery_date: formData.delivery_date,
    amount: parseFloat(formData.amount) || 0,
    total: parseFloat(formData.total) || 0,
    responsible_person: formData.responsible_person?.trim(),
    delivery_status: formData.delivery_status,
    contact: formData.contact?.trim(),
    item_quantity: parseInt(formData.item_quantity) || 0,
    company_name: formData.company_name?.trim(),
    company_address: formData.company_address?.trim(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!user?.id) {
      setError("Debe estar autenticado para crear una orden");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = prepareOrderData();
      
      // Filtrar campos vacíos
      Object.keys(orderData).forEach(key => {
        if (orderData[key] === '' || orderData[key] === undefined) {
          delete orderData[key];
        }
      });

      console.log("Datos de la orden a enviar:", orderData);

      const response = await orderAPI.createOrder(orderData);
      
      if (response.data?.success) {
        setSuccess("✅ Orden de compra creada exitosamente");
        
        if (onOrderCreated) {
          onOrderCreated(response.data.data);
        }

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError("❌ Error al crear la orden: " + (response.data?.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error completo:", error);
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || 'Error del servidor';
        
        if (status === 500) {
          setError(`❌ Error interno del servidor: ${serverMessage}. Verifique que todos los campos estén correctos.`);
        } else if (status === 400) {
          setError(`❌ Datos inválidos: ${serverMessage}`);
        } else {
          setError(`❌ Error ${status}: ${serverMessage}`);
        }
      } else if (error.request) {
        setError('❌ Error de conexión. Verifique su conexión a internet.');
      } else {
        setError('❌ Error inesperado al crear la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    formData,
    productos,
    loading,
    error,
    success,
    handleInputChange,
    addProducto,
    updateProducto,
    removeProducto,
    handleSubmit,
  };
};
