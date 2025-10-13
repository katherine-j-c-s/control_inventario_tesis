"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


//producto para el remito formulario 
const ProductRow = ({ product, index, onUpdate, onRemove }) => {
  const handleChange = (field, value) => {
    onUpdate(index, { ...product, [field]: value });
  };

  return (
    <div className="flex flex-row justify-between items-center w-full wrap md:flex-row gap-4 p-4 border border-border rounded-lg bg-card">
      <div className="space-y-2">
        <Label htmlFor={`product-id-${index}`} className="text-sm font-medium">
          ID/Código *
        </Label>
        <Input
          id={`product-id-${index}`}
          type="text"
          value={product.id || ""}
          onChange={(e) => handleChange("id", e.target.value)}
          placeholder="Ej: PROD001"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`product-name-${index}`} className="text-sm font-medium">
          Nombre *
        </Label>
        <Input
          id={`product-name-${index}`}
          type="text"
          value={product.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Producto ABC"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`product-quantity-${index}`} className="text-sm font-medium">
          Cantidad *
        </Label>
        <Input
          id={`product-quantity-${index}`}
          type="number"
          min="1"
          value={product.quantity || ""}
          onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 0)}
          placeholder="1"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`product-price-${index}`} className="text-sm font-medium">
          Precio Unitario
        </Label>
        <Input
          id={`product-price-${index}`}
          type="number"
          min="0"
          step="0.01"
          value={product.price || ""}
          onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
          placeholder="0.00"
          className="w-full"
        />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(index)}
          className="w-full h-10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductRow;
