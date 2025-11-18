"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { workOrderAPI } from "@/lib/api";
import GeneralInfoForm from "./components/GeneralInfoForm";
import ProductForm from "./components/ProductForm";
import FormActions from "./components/FormActions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const FormPO = ({ onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    solicitante: "",
    obra: "",
    fecha_requerida: "",
    observaciones: "",
  });

  const [productos, setProductos] = useState([
    {
      id: 1,
      nombre: "",
      cantidad: "",
      unidad: "unidad",
      observaciones: "",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductChange = (index, field, value) => {
    setProductos((prev) =>
      prev.map((producto, i) =>
        i === index ? { ...producto, [field]: value } : producto
      )
    );
  };

  const addProducto = () => {
    const newId = Math.max(...productos.map((p) => p.id)) + 1;
    setProductos((prev) => [
      ...prev,
      {
        id: newId,
        nombre: "",
        cantidad: "",
        unidad: "unidad",
        observaciones: "",
      },
    ]);
  };

  const removeProducto = (index) => {
    if (productos.length > 1) {
      setProductos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    // Validar campos básicos del formulario
    if (!formData.solicitante.trim()) {
      alert("❌ El solicitante es obligatorio");
      return false;
    }
    
    if (!formData.obra.trim()) {
      alert("❌ La obra es obligatoria");
      return false;
    }
    
    if (!formData.fecha_requerida) {
      alert("❌ La fecha requerida es obligatoria");
      return false;
    }

    // Validar que la fecha requerida no sea en el pasado
    const fechaRequerida = new Date(formData.fecha_requerida);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
    
    if (fechaRequerida < hoy) {
      alert("❌ La fecha requerida no puede ser anterior a hoy");
      return false;
    }

    // Validar productos
    const productosValidos = productos.filter(p => p.nombre.trim());
    
    if (productosValidos.length === 0) {
      alert("❌ Debe agregar al menos un producto");
      return false;
    }

    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      
      // Si el producto tiene nombre, validar que tenga cantidad
      if (producto.nombre.trim()) {
        if (!producto.cantidad || parseInt(producto.cantidad) <= 0) {
          alert(`❌ La cantidad del producto "${producto.nombre}" debe ser mayor a 0`);
          return false;
        }
        
        if (parseInt(producto.cantidad) > 10000) {
          alert(`❌ La cantidad del producto "${producto.nombre}" es demasiado alta (máximo 10,000)`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert("Debe estar autenticado para crear una solicitud");
      return;
    }

    setLoading(true);

    try {
      // Validar que hay productos
      if (!productos || productos.length === 0 || productos.every(p => !p.nombre.trim())) {
        alert("❌ Debe agregar al menos un producto a la solicitud");
        return;
      }

      const workOrderData = {
        project_id: 1, // Por defecto, se puede hacer dinámico después
        descripcion: formData.observaciones || `Solicitud de materiales para ${formData.obra || 'proyecto'}`,
        usuario_id: user.id,
        items: productos
          .filter(p => p.nombre.trim()) // Solo productos con nombre
          .map((p) => ({
            nombre_producto: p.nombre.trim(),
            descripcion: p.observaciones?.trim() || '',
            cantidad: parseInt(p.cantidad) || 1,
          })),
      };

      console.log("Enviando datos al servidor:", workOrderData);

      const response = await workOrderAPI.createWorkOrder(workOrderData);
      
      if (response.data && response.data.success) {
        const workOrder = response.data.workOrder;
        
        // Mostrar mensaje de éxito
        setSuccess(`Solicitud creada exitosamente (ID: ${workOrder.id})`);
        setTimeout(() => setSuccess(null), 5000);
        
        // Llamar callback con los datos creados
        if (onSubmit) {
          onSubmit({
            ...workOrderData,
            id: workOrder.id,
            success: true,
            message: response.data.message
          });
        }

        // Reset form
        setFormData({
          solicitante: "",
          obra: "",
          fecha_requerida: "",
          observaciones: "",
        });
        setProductos([
          {
            id: 1,
            nombre: "",
            cantidad: "",
            unidad: "unidad",
            observaciones: "",
          },
        ]);
      }
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      
      let errorMessage = "Error al crear la solicitud. Inténtelo de nuevo.";
      
      if (error.response) {
        // Error del servidor
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        if (status === 400) {
          errorMessage = `❌ Datos inválidos: ${serverMessage || 'Verifique los campos del formulario'}`;
        } else if (status === 401) {
          errorMessage = "❌ No está autorizado. Inicie sesión nuevamente.";
        } else if (status === 500) {
          errorMessage = "❌ Error interno del servidor. Contacte al administrador.";
        } else {
          errorMessage = `❌ Error ${status}: ${serverMessage || 'Error desconocido'}`;
        }
      } else if (error.request) {
        errorMessage = "❌ Error de conexión. Verifique su conexión a internet.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onSubmit) {
      onSubmit(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mensaje de éxito */}
      {success && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <GeneralInfoForm
        formData={formData}
        onFormChange={handleFormChange}
      />

      <ProductForm
        productos={productos}
        onProductChange={handleProductChange}
        onAddProduct={addProducto}
        onRemoveProduct={removeProducto}
      />

      <FormActions
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </form>
  );
};

export default FormPO;