import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";

const ProductForm = ({ productos, onProductChange, onAddProduct, onRemoveProduct }) => {
  const unidades = [
    "unidad",
    "kg",
    "litro",
    "metro",
    "m²",
    "m³",
    "bolsa",
    "rollo",
    "caja",
    "par",
  ];

  const handleProductChange = (index, field, value) => {
    onProductChange(index, field, value);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-primary" />
          Materiales Solicitados ({productos.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {productos.map((producto, index) => (
          <div
            key={producto.id}
            className="p-4 border border-border rounded-lg bg-muted/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">
                Producto {index + 1}
              </h4>
              {productos.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveProduct(index)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`nombre-${index}`}>Nombre del Producto *</Label>
                <Input
                  id={`nombre-${index}`}
                  value={producto.nombre}
                  onChange={(e) =>
                    handleProductChange(index, "nombre", e.target.value)
                  }
                  placeholder="Ej: Cemento Portland"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`cantidad-${index}`}>Cantidad *</Label>
                <Input
                  id={`cantidad-${index}`}
                  type="number"
                  min="1"
                  value={producto.cantidad}
                  onChange={(e) =>
                    handleProductChange(index, "cantidad", e.target.value)
                  }
                  placeholder="Ej: 50"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`unidad-${index}`}>Unidad *</Label>
                <Select
                  value={producto.unidad}
                  onValueChange={(value) =>
                    handleProductChange(index, "unidad", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidad) => (
                      <SelectItem key={unidad} value={unidad}>
                        {unidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`observaciones-${index}`}>
                Observaciones del Producto
              </Label>
              <Textarea
                id={`observaciones-${index}`}
                value={producto.observaciones}
                onChange={(e) =>
                  handleProductChange(index, "observaciones", e.target.value)
                }
                placeholder="Observaciones específicas del producto..."
                className="w-full"
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={onAddProduct}
          className="w-full h-12 dark:text-blue-200 text-blue-900 border-dashed border-2 border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Otro Producto
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
