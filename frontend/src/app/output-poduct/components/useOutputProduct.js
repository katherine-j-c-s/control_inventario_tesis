"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { movementAPI, productAPI } from "@/lib/api";
import { toast } from "sonner";

const useOutputProduct = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    cantidad: "",
    motivo: "",
    destinatario: "",
    ubicacionDestino: "",
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
    responsable: "",
    observaciones: "",
  });

  const [state, setState] = useState({
    isLoading: false,
    error: null,
    success: null,
    productInfo: null,
    currentUser: null,
  });

  // Obtener información del usuario actual
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setState(prev => ({ ...prev, currentUser: user }));
      setFormData(prev => ({
        ...prev,
        responsable: user.nombre || user.name || "",
      }));
    }
  }, []);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
    if (state.error) setState(prev => ({ ...prev, error: null }));
  };

  const setProductInfo = (product) => {
    setState(prev => ({ ...prev, productInfo: product }));
  };

  const setError = (error) => {
    setState(prev => ({ ...prev, error }));
  };

  const validateForm = () => {
    const { productInfo } = state;
    
    if (!productInfo) {
      setError("Debe buscar y seleccionar un producto válido");
      return false;
    }
    
    if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return false;
    }
    
    if (parseInt(formData.cantidad) > productInfo.stockActual) {
      setError(`La cantidad no puede ser mayor al stock disponible (${productInfo.stockActual})`);
      return false;
    }

    const requiredFields = [
      { field: 'motivo', message: 'El motivo del egreso es requerido' },
      { field: 'destinatario', message: 'El destinatario es requerido' },
      { field: 'ubicacionDestino', message: 'La ubicación de destino es requerida' },
      { field: 'fecha', message: 'La fecha es requerida' },
      { field: 'hora', message: 'La hora es requerida' },
      { field: 'responsable', message: 'El responsable es requerido' },
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        setError(message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const movementData = {
        movement_type: "egreso",
        date: `${formData.fecha}T${formData.hora}:00.000Z`,
        quantity: parseInt(formData.cantidad),
        product_id: state.productInfo.id,
        status: "completed",
        user_id: state.currentUser?.id || 1,
        ubicacionactual: formData.ubicacionDestino,
        motivo: formData.motivo,
        destinatario: formData.destinatario,
        observaciones: formData.observaciones,
      };

      // Primero crear el movimiento
      await movementAPI.createMovement(movementData);

      // Luego eliminar el producto de la base de datos
      const productResponse = await productAPI.processProductOutput(state.productInfo.id);
      
      const successMessage = productResponse.data?.message || "Egreso de producto registrado exitosamente";
      setState(prev => ({ ...prev, success: successMessage }));
      toast.success("Egreso registrado correctamente y producto eliminado del inventario");

      setTimeout(() => {
        resetForm();
        router.push("/movements");
      }, 2000);

    } catch (err) {
      console.error("Error registrando egreso:", err);
      
      // Manejar diferentes tipos de errores
      let errorMessage = "Error al registrar el egreso";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      cantidad: "",
      motivo: "",
      destinatario: "",
      ubicacionDestino: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
      responsable: state.currentUser?.nombre || state.currentUser?.name || "",
      observaciones: "",
    });
    setState(prev => ({
      ...prev,
      productInfo: null,
      error: null,
      success: null,
    }));
  };

  return {
    formData,
    state,
    updateFormData,
    setProductInfo,
    setError,
    handleSubmit,
    resetForm,
  };
};

export default useOutputProduct;
