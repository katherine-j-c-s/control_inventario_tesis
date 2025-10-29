import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const AddProduct = ({ isOpen, onClose, onProductAdded }) => {
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

  const categorias = ["Electrónicos", "Ropa", "Hogar", "Deportes", "Libros", "Herramientas", "Alimentación", "Otros"];
  const unidades = ["Unidad", "Kilogramo", "Gramo", "Litro", "Metro", "Caja", "Paquete", "Docena"];

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

  const createProduct = async (productData) => {
    try {
      const response = await api.post('/productos', productData);
      return response.data;
    } catch (error) {
      // Manejar errores de axios
      if (error.response) {
        // El servidor respondió con un código de error
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Error al crear el producto';
        throw new Error(errorMessage);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
      } else {
        // Algo más pasó
        throw new Error(error.message || 'Error inesperado al crear el producto');
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

      const newProduct = await createProduct(productData);
      
      toast.success('Producto creado exitosamente');
      
      // Resetear el formulario
      setFormData({
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

      // Notificar al componente padre si se proporciona la función
      if (onProductAdded) {
        onProductAdded(newProduct);
      }

      onClose();
    } catch (error) {
      console.error('Error creando producto:', error);
      toast.error(error.message || 'Error al crear el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="sr-only">Agregar Nuevo Producto</DialogTitle>

        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <DialogDescription className="mb-4">
              Completa los campos para añadir un item al inventario.
            </DialogDescription>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor={key} className="text-right capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Label>
                  {key === "descripcion" ? (
                    <Textarea
                      id={key}
                      value={value}
                      onChange={handleChange}
                      className="col-span-3 placeholder:text-gray-500"
                      placeholder={key}
                    />
                  ) : key === "categoria" ? (
                    <Select value={value} onValueChange={(val) => handleSelectChange(key, val)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : key === "unidad_medida" ? (
                    <Select value={value} onValueChange={(val) => handleSelectChange(key, val)}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona unidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {unidades.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={key}
                      value={value}
                      onChange={handleChange}
                      type={["precio_unitario", "stock_minimo", "stock_actual"].includes(key) ? "number" : "text"}
                      className="col-span-3 placeholder:text-gray-500"
                      placeholder={key.replace(/_/g, ' ')}
                      step={key === "precio_unitario" ? "0.01" : "1"}
                      min={key.includes("stock") || key === "precio_unitario" ? "0" : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardContent className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AddProduct;
