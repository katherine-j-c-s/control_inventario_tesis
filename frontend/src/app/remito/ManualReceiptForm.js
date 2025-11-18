"use client";

import React, { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProductRow from "./ProductRow";
import { receiptAPI } from "@/lib/api";

const ManualReceiptForm = ({ onClose, onReceiptCreated }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Fecha actual por defecto
    warehouse_id: "",
    orderNumber: "",
    status: "Pending",
    verifier: "",
  });

  const [products, setProducts] = useState([
    { id: "", name: "", quantity: 1, price: 0 }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  React.useEffect(() => {
    loadWarehouses();
  }, []);

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
    if (!formData.date || !formData.warehouse_id || !formData.orderNumber) {
      setError("Por favor, completa todos los campos obligatorios del remito");
      return false;
    }

    const validProducts = products.filter(product =>
      product.id && product.name && product.quantity > 0
    );

    if (validProducts.length === 0) {
      setError("Debe agregar al menos un producto válido");
      return false;
    }

    const hasInvalidProducts = products.some(product =>
      product.id && product.name && product.quantity > 0 &&
      (!product.id || !product.name || product.quantity <= 0)
    );

    if (hasInvalidProducts) {
      setError("Todos los productos deben tener ID, nombre y cantidad válidos");
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

      console.log("Datos del remito a enviar:", receiptData);

      const response = await receiptAPI.createReceipt(receiptData);

      if (response.data.success) {
        setSuccess(`✅ ${response.data.message}`);

        if (onReceiptCreated) {
          onReceiptCreated();
        }

        setTimeout(() => {
          setFormData({
            date: new Date().toISOString().split('T')[0],
            warehouse_id: "",
            orderNumber: "",
            status: "Pending",
            verifier: "",
          });
          setProducts([{ id: "", name: "", quantity: 1, price: 0 }]);
          setSuccess(null);
          if (onClose) onClose();
        }, 3000);
      } else {
        setError("Error al guardar el remito. Inténtalo de nuevo.");
      }

    } catch (error) {
      console.error("Error al guardar el remito:", error);
      const errorMessage = error.response?.data?.error || "Error al guardar el remito. Inténtalo de nuevo.";
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription >{success}</AlertDescription>
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
                  Número de Orden/Código *
                </Label>
                <Input
                  id="orderNumber"
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange("orderNumber", e.target.value)}
                  placeholder="Ej: REM-2024-001"
                  className="w-full"
                  required
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Remito
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ManualReceiptForm;

