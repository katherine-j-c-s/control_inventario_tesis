"use client";

// modal para ver los detalles de los remitos 

import React, { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  XCircle,
  FileText,
  User,
  Hash
} from "lucide-react";
import { receiptAPI } from "@/lib/api";

const ReceiptModal = ({ isOpen, onClose, receipt, onVerify }) => {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && receipt) {
      loadReceiptProducts();
    }
  }, [isOpen, receipt]);

  const loadReceiptProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await receiptAPI.getReceiptWithProducts(receipt.receipt_id);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error al cargar los productos del remito');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, verified) => {
    if (verified) {
      return <Badge className="bg-primary-600 text-primary-foreground border-primary-200">Verificado</Badge>;
    }
    if (status === 'Pending') {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
  };

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              Detalles del Remito #{receipt.receipt_id}
            </DialogTitle>
            
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General del Remito */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">ID del Remito:</span>
                    <span className="text-sm text-muted-foreground">#{receipt.receipt_id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Almacén:</span>
                    <span className="text-sm text-muted-foreground">#{receipt.warehouse_id}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Cantidad de Productos:</span>
                    <span className="text-sm text-muted-foreground">{receipt.quantity_products}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Fecha de Entrada:</span>
                    <span className="text-sm text-muted-foreground">{formatDate(receipt.entry_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Estado:</span>
                    {getStatusBadge(receipt.status, receipt.verification_status)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Verificación:</span>
                    {receipt.verification_status ? (
                      <div className="flex items-center text-primary-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">Verificado</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">No Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos del Remito */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Productos del Remito
                {loading && (
                  <div className="ml-2 w-4 h-4 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="w-8 h-8 animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cargando productos...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadReceiptProducts}
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No hay productos registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-foreground">ID Producto</TableHead>
                        <TableHead className="text-foreground">Nombre</TableHead>
                        <TableHead className="text-foreground">Categoría</TableHead>
                        <TableHead className="text-foreground">Cantidad</TableHead>
                        <TableHead className="text-foreground">Unidad</TableHead>
                        <TableHead className="text-foreground">Precio Unit.</TableHead>
                        <TableHead className="text-foreground">Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product, index) => (
                        <TableRow key={product.product_id || index} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground">
                            #{product.product_id}
                          </TableCell>
                          <TableCell className="text-foreground font-medium">
                            {product.product_name}
                          </TableCell>
                          <TableCell className="text-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {product.product_category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-foreground font-semibold">
                            {product.quantity}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {product.product_unit}
                          </TableCell>
                          <TableCell className="text-foreground">
                            ${product.product_price}
                          </TableCell>
                          <TableCell className="text-foreground text-sm">
                            {product.product_description || 'Sin descripción'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <User className="w-5 h-5 mr-2" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">ID de Orden:</span>
                    <span className="text-sm text-muted-foreground">#{receipt.order_id || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">ID de Producto Principal:</span>
                    <span className="text-sm text-muted-foreground">#{receipt.product_id || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Total de Productos:</span>
                    <span className="text-sm text-muted-foreground font-semibold">{receipt.quantity_products}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">Fecha de Creación:</span>
                    <span className="text-sm text-muted-foreground">{formatDate(receipt.entry_date)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          {!receipt.verification_status && (
            <Button 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={() => onVerify && onVerify(receipt.receipt_id)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verificar Remito
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
