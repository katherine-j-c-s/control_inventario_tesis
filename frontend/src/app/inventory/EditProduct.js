import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

const EditProduct = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    categoria: "",
    descripcion: "",
    unidad_medida: "",
    precio_unitario: "",
    stock_minimo: "",
    stock_actual: "",
    ubicacion: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const categorias = ["Electricidad", "Construcción", "General", "Pinturas", "Ferreteria"];
  const unidades = ["Unidad", "Kilogramo", "Gramo", "Litro", "Metro", "Caja", "Paquete", "Docena"];

  // Cargar datos del producto cuando se abre el modal
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        nombre: product.nombre || "",
        codigo: product.codigo || "",
        categoria: product.categoria || "",
        descripcion: product.descripcion || "",
        unidad_medida: product.unidad_medida || "",
        precio_unitario: product.precio_unitario?.toString() || "",
        stock_minimo: product.stock_minimo?.toString() || "",
        stock_actual: product.stock_actual?.toString() || "",
        ubicacion: product.ubicacion || "",
      });
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['nombre', 'codigo', 'categoria', 'unidad_medida', 'precio_unitario', 'stock_minimo', 'stock_actual', 'ubicacion'];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`El campo ${field.replace(/_/g, ' ')} es requerido`);
        return false;
      }
    }

    if (parseFloat(formData.precio_unitario) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return false;
    }

    if (parseInt(formData.stock_minimo) < 0 || parseInt(formData.stock_actual) < 0) {
      toast.error('Los stocks no pueden ser negativos');
      return false;
    }

    return true;
  };

  const updateProduct = async (productData) => {
    try {
      const response = await api.put(`/productos/${product.id}`, productData);
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Error al actualizar el producto';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        throw new Error(error.message || 'Error inesperado al actualizar el producto');
      }
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const productData = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock_minimo: parseInt(formData.stock_minimo),
        stock_actual: parseInt(formData.stock_actual),
      };

      const updatedProduct = await updateProduct(productData);
      
      toast.success('Producto actualizado exitosamente');

      // Notificar al componente padre
      if (onProductUpdated) {
        onProductUpdated(updatedProduct);
      }

      onClose();
    } catch (error) {
      console.error('Error actualizando producto:', error);
      toast.error(error.message || 'Error al actualizar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogDescription>
          Modifica los campos del producto.
        </DialogDescription>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre del producto"
            />
          </div>

          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Código único"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría *</Label>
            <Select value={formData.categoria} onValueChange={(val) => handleSelectChange("categoria", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unidad de Medida */}
          <div className="space-y-2">
            <Label htmlFor="unidad_medida">Unidad de Medida *</Label>
            <Select value={formData.unidad_medida} onValueChange={(val) => handleSelectChange("unidad_medida", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona unidad" />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio Unitario */}
          <div className="space-y-2">
            <Label htmlFor="precio_unitario">Precio Unitario *</Label>
            <Input
              id="precio_unitario"
              value={formData.precio_unitario}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>

          {/* Stock Mínimo */}
          <div className="space-y-2">
            <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
            <Input
              id="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleChange}
              type="number"
              min="0"
              placeholder="0"
            />
          </div>

          {/* Stock Actual */}
          <div className="space-y-2">
            <Label htmlFor="stock_actual">Stock Actual *</Label>
            <Input
              id="stock_actual"
              value={formData.stock_actual}
              onChange={handleChange}
              type="number"
              min="0"
              placeholder="0"
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-2">
            <Label htmlFor="ubicacion">Ubicación *</Label>
            <Input
              id="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Almacén A, Estante 3"
            />
          </div>

          {/* Descripción - Ocupa 2 columnas */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada del producto (opcional)"
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Actualizando..." : "Actualizar Producto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProduct;

