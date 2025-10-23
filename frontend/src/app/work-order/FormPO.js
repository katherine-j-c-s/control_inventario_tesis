"use client";

import React, { useState } from "react";
import GeneralInfoForm from "./components/GeneralInfoForm";
import ProductForm from "./components/ProductForm";
import FormActions from "./components/FormActions";

const FormPO = ({ onSubmit }) => {
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
    if (!formData.solicitante.trim()) {
      alert("El solicitante es obligatorio");
      return false;
    }
    if (!formData.obra) {
      alert("La obra es obligatoria");
      return false;
    }
    if (!formData.fecha_requerida) {
      alert("La fecha requerida es obligatoria");
      return false;
    }

    for (let i = 0; i < productos.length; i++) {
      const producto = productos[i];
      if (!producto.nombre.trim()) {
        alert(`El nombre del producto ${i + 1} es obligatorio`);
        return false;
      }
      if (!producto.cantidad || producto.cantidad <= 0) {
        alert(`La cantidad del producto ${i + 1} es obligatoria`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Simular envío de datos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const solicitudData = {
        ...formData,
        productos: productos.map((p) => ({
          nombre: p.nombre,
          cantidad: parseInt(p.cantidad),
          unidad: p.unidad,
          observaciones: p.observaciones,
        })),
        total_productos: productos.length,
        fecha_solicitud: new Date().toISOString().split("T")[0],
        prioridad: "Media", // Por defecto
        estado: "Pendiente",
      };

      if (onSubmit) {
        onSubmit(solicitudData);
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
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Error al enviar la solicitud. Inténtelo de nuevo.");
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