"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductRow from "./ProductRow";
import { receiptAPI } from "@/lib/api";
import { toast } from "sonner";

const EditReceiptForm = ({ isOpen, onClose, receipt, onReceiptUpdated }) => {
  const [formData, setFormData] = useState({
    date: "",
    warehouse_id: "",
    orderNumber: "",
    status: "Pending",
    verifier: "",
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWarehouses();
      if (receipt) {
        loadReceiptData();
      }
    }
  }, [isOpen, receipt]);

  const loadWarehouses = async () => {
    try {
      const response = await receiptAPI.getWarehouses();
      setWarehouses(response.data);
    } catch (error) {
      console.error("Error cargando almacenes:", error);
      const mockWarehouses = [
        { id: 1, name: "Almacén Principal", location: "Sede Central" },
        { id: 2, name: "Almacén Secundario", location: "Sede Norte" },
        { id: 3, name: "Depósito Sur", location: "Sede Sur" }
      ];
      setWarehouses(mockWarehouses);
    }
  };

  const loadReceiptData = async () => {
    if (!receipt?.receipt_id) return;

    setLoadingReceipt(true);
    setError(null);

    try {
      const response = await receiptAPI.getReceiptWithProducts(receipt.receipt_id);
      const receiptData = response.data;

      // Formatear fecha para el input date
      const entryDate = receiptData.entry_date 
        ? new Date(receiptData.entry_date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        date: entryDate,
        warehouse_id: receiptData.warehouse_id?.toString() || "",
        orderNumber: receiptData.order_id?.toString() || "",
        status: receiptData.status || "Pending",
        verifier: "",
      });

      // Cargar productos del remito
      if (receiptData.products && receiptData.products.length > 0) {
        const formattedProducts = receiptData.products.map((product) => ({
          id: product.product_id?.toString() || product.product_description || "",
          name: product.product_name || "",
          quantity: product.quantity || 1,
          price: product.product_price || 0,
        }));
        setProducts(formattedProducts);
      } else {
        setProducts([{ id: "", name: "", quantity: 1, price: 0 }]);
      }
    } catch (error) {
      console.error("Error cargando datos del remito:", error);
      setError("Error al cargar los datos del remito. Inténtalo de nuevo.");
      toast.error("Error al cargar los datos del remito");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addProduct = () => {
    setProducts(prev => [...prev, { id: "", name: "", quantity: 1, price: 0 }]);
  };

  const updateProduct = (index, updatedProduct) => {
    setProducts(prev => prev.map((product, i) =>
      i === index ? updatedProduct : product
    ));
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!formData.date || !formData.warehouse_id) {
      setError("Por favor, completa todos los campos obligatorios del remito");
      toast.error("Por favor, completa todos los campos obligatorios");
      return false;
    }

    const validProducts = products.filter(product =>
      product.id && product.name && product.quantity > 0
    );

    if (validProducts.length === 0) {
      setError("Debe agregar al menos un producto válido");
      toast.error("Debe agregar al menos un producto válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const validProducts = products.filter(product =>
        product.id && product.name && product.quantity > 0
      );

      const receiptData = {
        warehouse_id: parseInt(formData.warehouse_id),
        entry_date: formData.date,
        order_id: formData.orderNumber ? parseInt(formData.orderNumber) : null,
        status: formData.status,
        products: validProducts.map(product => ({
          name: product.name,
          description: product.id,
          quantity: parseInt(product.quantity),
          unit_price: parseFloat(product.price) || 0
        }))
      };

      const response = await receiptAPI.updateReceipt(receipt.receipt_id, receiptData);

      if (response.data.success) {
        setSuccess(`✅ ${response.data.message || "Remito actualizado correctamente"}`);
        toast.success("Remito actualizado exitosamente");

        if (onReceiptUpdated) {
          onReceiptUpdated();
        }

        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
      } else {
        setError("Error al actualizar el remito. Inténtalo de nuevo.");
        toast.error("Error al actualizar el remito");
      }

    } catch (error) {
      console.error("Error al actualizar el remito:", error);
      const errorMessage = error.response?.data?.error || "Error al actualizar el remito. Inténtalo de nuevo.";
      setError(`❌ ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuccess(null);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogTitle className="text-lg sm:text-2xl flex items-center gap-2">
          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Editar Remito #{receipt?.receipt_id}
        </DialogTitle>
        <DialogDescription>
          Modifica los campos del remito. Los cambios se reflejarán en el inventario.
        </DialogDescription>

        {loadingReceipt ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Cargando datos del remito...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Información del Remito</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">
                        Fecha del Remito *
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warehouse_id" className="text-sm font-medium">
                        Depósito *
                      </Label>
                      <Select
                        value={formData.warehouse_id}
                        onValueChange={(value) => handleInputChange("warehouse_id", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona un depósito" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                              {warehouse.name} - {warehouse.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderNumber" className="text-sm font-medium">
                        Número de Orden/Código
                      </Label>
                      <Input
                        id="orderNumber"
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                        placeholder="Ej: REM-2024-001"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Estado *
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleInputChange("status", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="verifier" className="text-sm font-medium">
                        Verificador/Responsable
                      </Label>
                      <Input
                        id="verifier"
                        type="text"
                        value={formData.verifier}
                        onChange={(e) => handleInputChange("verifier", e.target.value)}
                        placeholder="Nombre del verificador (opcional)"
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Productos</CardTitle>
                    <Button
                      type="button"
                      onClick={addProduct}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {products.map((product, index) => (
                    <ProductRow
                      key={index}
                      product={product}
                      index={index}
                      onUpdate={updateProduct}
                      onRemove={removeProduct}
                    />
                  ))}

                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay productos agregados</p>
                      <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Actualizar Remito
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditReceiptForm;

