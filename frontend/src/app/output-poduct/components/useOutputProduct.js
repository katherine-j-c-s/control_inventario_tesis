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
    fecha: new Date().toISOString().split("T")[0],
    hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
    responsable: "",
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
        ubicacionactual: state.productInfo.ubicacion || "No especificada",
        motivo: formData.motivo,
      };

      // Primero crear el movimiento
      console.log('📝 Creando movimiento...', movementData);
      await movementAPI.createMovement(movementData);
      console.log('✅ Movimiento creado exitosamente');

      // Luego procesar el egreso del producto (restar cantidad del stock)
      console.log('📦 Procesando egreso del producto...', {
        productId: state.productInfo.id,
        cantidad: parseInt(formData.cantidad)
      });
      const productResponse = await productAPI.processProductOutput(
        state.productInfo.id, 
        parseInt(formData.cantidad)
      );
      console.log('✅ Respuesta del egreso:', productResponse.data);
      
      const productData = productResponse.data;
      let successMessage = "Egreso registrado exitosamente";
      let toastMessage = "Egreso registrado correctamente";

      if (productData?.success && productData.product) {
        const { product } = productData;
        successMessage = productData.message;
        
        if (product.eliminado) {
          // Producto eliminado por stock agotado
          toastMessage = `Egreso registrado - Producto "${product.nombre}" eliminado (stock agotado)`;
        } else {
          // Stock actualizado
          toastMessage = `Egreso registrado - "${product.nombre}": ${product.stock_anterior} → ${product.stock_actual} unidades`;
        }
      }
      
      setState(prev => ({ ...prev, success: successMessage }));
      toast.success(toastMessage);

      setTimeout(() => {
        resetForm();
        router.push("/movements");
      }, 2000);

    } catch (err) {
      console.error("❌ Error en el proceso de egreso:", err);
      
      // Determinar en qué parte del proceso ocurrió el error
      let errorMessage = "Error al registrar el egreso";
      let errorDetails = "";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
        
        // Agregar detalles si están disponibles
        if (errorData.details) {
          errorDetails = ` (${errorData.details})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Determinar si el error fue en el movimiento o en la eliminación del producto
      if (err.config?.url?.includes('/movements')) {
        errorMessage = `Error al crear el movimiento: ${errorMessage}`;
      } else if (err.config?.url?.includes('/egreso')) {
        errorMessage = `Error al eliminar el producto: ${errorMessage}`;
      }

      const fullErrorMessage = errorMessage + errorDetails;
      setError(fullErrorMessage);
      toast.error(fullErrorMessage);
      
      console.error("📊 Detalles del error:", {
        url: err.config?.url,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      cantidad: "",
      motivo: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
      responsable: state.currentUser?.nombre || state.currentUser?.name || "",
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
