"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { productAPI, receiptAPI } from "@/lib/api";

const ProductFilters = ({ onFiltersChange, disabled }) => {
  const [filters, setFilters] = useState({
    codigo: "",
    nombre: "",
    warehouse_id: "all",
  });

  const [warehouses, setWarehouses] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);

  // Cargar almacenes al montar el componente
  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    setIsLoadingWarehouses(true);
    try {
      const response = await receiptAPI.getWarehouses();
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error cargando almacenes:", error);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onFiltersChange(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      codigo: "",
      nombre: "",
      warehouse_id: "all",
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.codigo.trim() !== "" || 
    filters.nombre.trim() !== "" || 
    filters.warehouse_id !== "all";

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Filtros de Búsqueda</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Filtro por Código */}
        <div className="space-y-2">
          <Label htmlFor="filterCodigo" className="text-sm">
            Código del Producto
          </Label>
          <Input
            id="filterCodigo"
            placeholder="Ej: PROD-001"
            value={filters.codigo}
            onChange={(e) => handleFilterChange("codigo", e.target.value)}
            disabled={disabled}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Filtro por Nombre */}
        <div className="space-y-2">
          <Label htmlFor="filterNombre" className="text-sm">
            Nombre del Producto
          </Label>
          <Input
            id="filterNombre"
            placeholder="Ej: Tornillo, Cable, etc."
            value={filters.nombre}
            onChange={(e) => handleFilterChange("nombre", e.target.value)}
            disabled={disabled}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* Filtro por Almacén */}
        <div className="space-y-2">
          <Label htmlFor="filterWarehouse" className="text-sm">
            Almacén
          </Label>
          <Select
            value={filters.warehouse_id}
            onValueChange={(value) => handleFilterChange("warehouse_id", value)}
            disabled={disabled || isLoadingWarehouses}
          >
            <SelectTrigger id="filterWarehouse">
              <SelectValue placeholder="Todos los almacenes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los almacenes</SelectItem>
              {warehouses.map((warehouse) => (
                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                  {warehouse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={disabled || !hasActiveFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSearch}
          disabled={disabled}
        >
          <Search className="h-4 w-4 mr-1" />
          Buscar Productos
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Filtros activos:</span>{" "}
          {filters.codigo && `Código: "${filters.codigo}" `}
          {filters.nombre && `Nombre: "${filters.nombre}" `}
          {filters.warehouse_id !== "all" && 
            `Almacén: ${warehouses.find(w => w.id.toString() === filters.warehouse_id)?.name || "Seleccionado"}`
          }
        </div>
      )}
    </div>
  );
};

export default ProductFilters;

