"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ProductInfo = ({ product, cantidad, onCantidadChange, disabled }) => {
  if (!product) return null;

  return (
    <div className="space-y-4">
      {/* Información del producto */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="font-semibold text-lg">{product.nombre}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-muted-foreground">
          <div>
            Código:{" "}
            <span className="font-medium text-foreground">
              {product.codigo}
            </span>
          </div>
          <div>
            Categoría:{" "}
            <span className="font-medium text-foreground">
              {product.categoria}
            </span>
          </div>
          <div>
            Stock Actual:{" "}
            <span className="font-medium text-foreground">
              {product.stockActual} {product.unidadMedida}
            </span>
          </div>
          <div>
            Ubicación:{" "}
            <span className="font-medium text-foreground">
              {product.ubicacion}
            </span>
          </div>
        </div>
      </div>

      {/* Campo de cantidad */}
      <div className="space-y-2">
        <Label htmlFor="cantidad">
          Cantidad a Egresar <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cantidad"
          type="number"
          min="1"
          max={product.stockActual}
          placeholder="Ingrese la cantidad"
          value={cantidad}
          onChange={(e) => onCantidadChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-sm text-muted-foreground">
          Stock disponible: {product.stockActual} {product.unidadMedida}
        </p>
      </div>
    </div>
  );
};

export default ProductInfo;
