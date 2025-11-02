"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { productAPI } from "@/lib/api";

const ProductSearch = ({ onProductFound, onError, disabled }) => {
  const [codigo, setCodigo] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!codigo.trim()) {
      onError("Por favor ingrese un código de producto");
      return;
    }

    setIsSearching(true);
    onError(null);

    try {
      const product = await productAPI.getProductByCode(codigo);
      
      if (product) {
        onProductFound({
          id: product.id,
          nombre: product.nombre,
          codigo: product.codigo,
          categoria: product.categoria,
          stockActual: product.stock_actual,
          ubicacion: product.ubicacion,
          unidadMedida: product.unidad_medida,
          precioUnitario: product.precio_unitario,
        });
      } else {
        onError("No se encontró el producto con ese código");
        onProductFound(null);
      }
    } catch (err) {
      console.error("Error buscando producto:", err);
      onError("Error al buscar el producto. Verifique la conexión.");
      onProductFound(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="codigoProducto">
          Código del Producto <span className="text-red-500">*</span>
        </Label>
        <Input
          id="codigoProducto"
          placeholder="Ej: PROD-001"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          disabled={disabled || isSearching}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      <div className="flex items-end">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleSearch}
          disabled={disabled || isSearching || !codigo.trim()}
        >
          {isSearching ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar Producto
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductSearch;
