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

const AddProduct = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    cantidad: "",
    precio: "",
    categoria: "",
    descripcion: "",
    unidad: "",
    stockMinimo: "",
    stockActual: "",
    ubicacion: "",
    codigoQr: "",
    activo: "",
  });

  const categorias = ["Electrónicos", "Ropa", "Hogar", "Deportes", "Libros", "Herramientas", "Alimentación", "Otros"];
  const unidades = ["Unidad", "Kilogramo", "Gramo", "Litro", "Metro", "Caja", "Paquete", "Docena"];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Datos a guardar:", formData);
    onClose();
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
                  ) : key === "unidad" ? (
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
                      type={["cantidad", "precio", "stockMinimo", "stockActual"].includes(key) ? "number" : "text"}
                      className="col-span-3 placeholder:text-gray-500"
                      placeholder={key}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardContent className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave}>Guardar Producto</Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default AddProduct;
