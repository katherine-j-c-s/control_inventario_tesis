"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  ChevronUp 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductsTable = ({ products, onSelectProduct, isLoading, selectedProductId }) => {
  const [sortField, setSortField] = useState("nombre");
  const [sortDirection, setSortDirection] = useState("asc");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Cargando productos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <Package className="h-16 w-16 text-muted-foreground/40" />
            <div>
              <h3 className="font-semibold text-lg">No se encontraron productos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Intente ajustar los filtros de búsqueda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "string") {
      return aValue.localeCompare(bValue) * modifier;
    }
    return (aValue - bValue) * modifier;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Sin stock
        </Badge>
      );
    }
    if (stock < 10) {
      return (
        <Badge variant="warning" className="gap-1 bg-yellow-500 hover:bg-yellow-600">
          <AlertCircle className="h-3 w-3" />
          Bajo stock
        </Badge>
      );
    }
    return (
      <Badge variant="success" className="gap-1 bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Disponible
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Productos Encontrados ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("codigo")}
                >
                  Código <SortIcon field="codigo" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("nombre")}
                >
                  Nombre <SortIcon field="nombre" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("categoria")}
                >
                  Categoría <SortIcon field="categoria" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("stock_actual")}
                >
                  Stock <SortIcon field="stock_actual" />
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map((product) => (
                <TableRow 
                  key={product.id}
                  className={`
                    ${selectedProductId === product.id ? "bg-primary/10" : ""}
                    ${product.stock_actual === 0 ? "opacity-50" : ""}
                  `}
                >
                  <TableCell className="font-mono text-sm">
                    {product.codigo}
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.nombre}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.stock_actual} {product.unidad_medida}
                  </TableCell>
                  <TableCell>{getStockBadge(product.stock_actual)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={selectedProductId === product.id ? "default" : "outline"}
                      onClick={() => onSelectProduct(product)}
                      disabled={product.stock_actual === 0}
                    >
                      {selectedProductId === product.id ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Seleccionado
                        </>
                      ) : (
                        "Seleccionar"
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;

