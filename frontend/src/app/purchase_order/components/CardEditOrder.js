"use client";

import { useState, useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import FormField from "./FormField";
import { orderAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

const CardEditOrder = ({ orderData, onClose, onOrderUpdated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    company_address: "",
    responsible_person: "",
    supplier: "",
    contact: "",
    issue_date: "",
    delivery_date: "",
    delivery_status: "Pending",
    amount: 0,
    total: 0,
    item_quantity: 0,
    notes: "",
  });

  // Cargar datos de la orden al montar el componente
  useEffect(() => {
    if (orderData) {
      setFormData({
        company_name: orderData.company_name || "",
        company_address: orderData.company_address || "",
        responsible_person: orderData.responsible_person || "",
        supplier: orderData.supplier || "",
        contact: orderData.contact || "",
        issue_date: orderData.issue_date ? orderData.issue_date.split('T')[0] : "",
        delivery_date: orderData.delivery_date ? orderData.delivery_date.split('T')[0] : "",
        delivery_status: orderData.delivery_status || "Pending",
        amount: orderData.amount || 0,
        total: orderData.total || 0,
        item_quantity: orderData.item_quantity || 0,
        notes: orderData.notes || "",
      });
    }
  }, [orderData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.supplier?.trim()) {
      setError("El proveedor es obligatorio");
      return false;
    }

    if (!formData.issue_date) {
      setError("La fecha de emisión es obligatoria");
      return false;
    }

    if (!formData.delivery_date) {
      setError("La fecha de entrega es obligatoria");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user || !user.id) {
      setError("Debe estar autenticado para editar una orden");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        supplier: formData.supplier?.trim(),
        status: formData.delivery_status === "Delivered",
        issue_date: formData.issue_date,
        delivery_date: formData.delivery_date,
        amount: parseFloat(formData.amount) || 0,
        total: parseFloat(formData.total) || 0,
        responsible_person: formData.responsible_person?.trim(),
        delivery_status: formData.delivery_status,
        contact: formData.contact?.trim(),
        item_quantity: parseInt(formData.item_quantity) || 0,
        company_name: formData.company_name?.trim(),
        company_address: formData.company_address?.trim(),
        notes: formData.notes?.trim(),
      };

      // Filtrar campos vacíos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.log("Datos a actualizar:", updateData);

      const response = await orderAPI.updateOrder(orderData.order_id, updateData);
      
      if (response.data && response.data.success) {
        setSuccess("✅ Orden actualizada exitosamente");

        if (onOrderUpdated) {
          onOrderUpdated(response.data.data);
        }

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError("❌ Error al actualizar la orden: " + (response.data?.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error actualizando orden:", error);
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || 'Error del servidor';
        
        if (status === 500) {
          setError(`❌ Error interno del servidor: ${serverMessage}`);
        } else if (status === 400) {
          setError(`❌ Datos inválidos: ${serverMessage}`);
        } else if (status === 404) {
          setError(`❌ Orden no encontrada`);
        } else {
          setError(`❌ Error ${status}: ${serverMessage}`);
        }
      } else if (error.request) {
        setError('❌ Error de conexión. Verifique su conexión a internet.');
      } else {
        setError('❌ Error inesperado al actualizar la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay datos de orden para editar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      {user && (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Editando como:</strong> {user.nombre} {user.apellido} | <strong>Orden ID:</strong> #{orderData.order_id}
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Empresa */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Datos de la Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Nombre de la Empresa" 
                  id="company_name" 
                  value={formData.company_name} 
                  onChange={(e) => handleInputChange("company_name", e.target.value)} 
                />
                <FormField 
                  label="Domicilio" 
                  id="company_address" 
                  className="md:col-span-2" 
                  value={formData.company_address} 
                  onChange={(e) => handleInputChange("company_address", e.target.value)} 
                  placeholder="Dirección completa" 
                />
                <FormField 
                  label="Responsable" 
                  id="responsible_person" 
                  className="md:col-span-2" 
                  value={formData.responsible_person} 
                  onChange={(e) => handleInputChange("responsible_person", e.target.value)} 
                  placeholder="Nombre del responsable" 
                />
              </div>
            </div>

            <Separator />

            {/* Proveedor */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Datos del Proveedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Nombre del Proveedor" 
                  id="supplier" 
                  required 
                  value={formData.supplier} 
                  onChange={(e) => handleInputChange("supplier", e.target.value)} 
                  placeholder="Nombre del proveedor" 
                />
                <FormField 
                  label="Contacto" 
                  id="contact" 
                  value={formData.contact} 
                  onChange={(e) => handleInputChange("contact", e.target.value)} 
                  placeholder="Teléfono o email" 
                />
              </div>
            </div>

            <Separator />

            {/* Fechas y Estado */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Información de la Orden</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Fecha de Emisión" 
                  id="issue_date" 
                  required 
                  type="date" 
                  value={formData.issue_date} 
                  onChange={(e) => handleInputChange("issue_date", e.target.value)} 
                />
                <FormField 
                  label="Fecha de Entrega" 
                  id="delivery_date" 
                  required 
                  type="date" 
                  value={formData.delivery_date} 
                  onChange={(e) => handleInputChange("delivery_date", e.target.value)} 
                />
                <FormField label="Estado de Entrega" id="delivery_status" required>
                  <Select value={formData.delivery_status} onValueChange={(value) => handleInputChange("delivery_status", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pendiente</SelectItem>
                      <SelectItem value="In Transit">En Tránsito</SelectItem>
                      <SelectItem value="Delivered">Entregado</SelectItem>
                      <SelectItem value="Cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </div>

            <Separator />

            {/* Totales */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Totales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Cantidad de Items" 
                  id="item_quantity"
                  type="number" 
                  min="0" 
                  value={formData.item_quantity} 
                  onChange={(e) => handleInputChange("item_quantity", parseInt(e.target.value) || 0)} 
                />
                <FormField 
                  label="Monto" 
                  id="amount"
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={(e) => handleInputChange("amount", parseFloat(e.target.value) || 0)} 
                />
                <FormField 
                  label="Total" 
                  id="total"
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.total} 
                  onChange={(e) => handleInputChange("total", parseFloat(e.target.value) || 0)} 
                />
              </div>
            </div>

            <Separator />

            {/* Observaciones */}
            <FormField label="Observaciones" id="notes">
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Notas adicionales sobre la orden..."
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2 w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Actualizar Orden
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CardEditOrder;
