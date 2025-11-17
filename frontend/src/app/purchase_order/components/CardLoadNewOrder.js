"use client";

import { useState } from "react";
import { Plus, Save, X, DollarSign } from "lucide-react";
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

const ProductRowOrder = ({ product, index, onUpdate, onRemove }) => {
  const handleChange = (field, value) => {
    const updatedProduct = { ...product, [field]: value };
    
    // Calcular importe automáticamente
    if (field === "cantidad" || field === "precio_unitario") {
      const cantidad = field === "cantidad" ? parseFloat(value) || 0 : parseFloat(product.cantidad) || 0;
      const precio = field === "precio_unitario" ? parseFloat(value) || 0 : parseFloat(product.precio_unitario) || 0;
      updatedProduct.importe = cantidad * precio;
    }
    
    onUpdate(index, updatedProduct);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 border border-border rounded-lg bg-card">
      <FormField
        label="Artículo"
        id={`articulo-${index}`}
        required
        className="sm:col-span-3"
        value={product.articulo || ""}
        onChange={(e) => handleChange("articulo", e.target.value)}
        placeholder="Nombre del artículo"
      />

      <FormField
        label="Descripción"
        id={`descripcion-${index}`}
        className="sm:col-span-3"
        value={product.descripcion || ""}
        onChange={(e) => handleChange("descripcion", e.target.value)}
        placeholder="Descripción del artículo"
      />

      <FormField
        label="Cantidad"
        id={`cantidad-${index}`}
        required
        type="number"
        min="1"
        className="sm:col-span-2"
        value={product.cantidad || ""}
        onChange={(e) => handleChange("cantidad", e.target.value)}
        placeholder="0"
      />

      <FormField
        label="Precio Unit."
        id={`precio-${index}`}
        required
        type="number"
        min="0"
        step="0.01"
        className="sm:col-span-2"
        value={product.precio_unitario || ""}
        onChange={(e) => handleChange("precio_unitario", e.target.value)}
        placeholder="0.00"
      />

      <FormField label="Importe" className="sm:col-span-1">
        <div className="flex items-center h-9 px-3 bg-muted rounded-md">
          <span className="text-sm font-semibold">
            ${(product.importe || 0).toFixed(2)}
          </span>
        </div>
      </FormField>

      <div className="flex items-end sm:col-span-1">
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

const CardLoadNewOrder = ({ onClose, onOrderCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Datos de la empresa que compra
    company_name: "Simetra S.A.",
    company_address: "",
    responsible_person: "",
    
    // Datos del proveedor
    supplier: "",
    contact: "",
    
    // Fechas y tiempos
    issue_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    
    // Estado y montos
    status: false,
    delivery_status: "Pending",
    amount: 0,
    total: 0,
    item_quantity: 0,
    notes: "",
  });

  const [productos, setProductos] = useState([
    { articulo: "", descripcion: "", cantidad: 1, precio_unitario: 0, importe: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addProducto = () => {
    setProductos((prev) => [
      ...prev,
      { articulo: "", descripcion: "", cantidad: 1, precio_unitario: 0, importe: 0 },
    ]);
  };

  const updateProducto = (index, updatedProduct) => {
    setProductos((prev) => {
      const newProducts = prev.map((product, i) => (i === index ? updatedProduct : product));
      
      // Calcular totales automáticamente
      const validProducts = newProducts.filter(p => p.articulo && p.cantidad > 0 && p.precio_unitario > 0);
      const subtotal = validProducts.reduce((sum, p) => sum + (p.importe || 0), 0);
      const totalQuantity = validProducts.reduce((sum, p) => sum + (parseInt(p.cantidad) || 0), 0);
      
      // Actualizar formData con los nuevos totales
      setFormData(prev => ({
        ...prev,
        amount: subtotal,
        total: subtotal,
        item_quantity: totalQuantity
      }));
      
      return newProducts;
    });
  };

  const removeProducto = (index) => {
    if (productos.length > 1) {
      setProductos((prev) => {
        const newProducts = prev.filter((_, i) => i !== index);
        
        // Recalcular totales después de eliminar
        const validProducts = newProducts.filter(p => p.articulo && p.cantidad > 0 && p.precio_unitario > 0);
        const subtotal = validProducts.reduce((sum, p) => sum + (p.importe || 0), 0);
        const totalQuantity = validProducts.reduce((sum, p) => sum + (parseInt(p.cantidad) || 0), 0);
        
        setFormData(prev => ({
          ...prev,
          amount: subtotal,
          total: subtotal,
          item_quantity: totalQuantity
        }));
        
        return newProducts;
      });
    }
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

    // Validar que la fecha de entrega sea posterior a la de emisión
    if (new Date(formData.delivery_date) <= new Date(formData.issue_date)) {
      setError("La fecha de entrega debe ser posterior a la fecha de emisión");
      return false;
    }

    const validProductos = productos.filter(
      (p) => p.articulo?.trim() && p.cantidad > 0 && p.precio_unitario > 0
    );

    if (validProductos.length === 0) {
      setError("Debe agregar al menos un producto válido");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Verificar autenticación
    if (!user || !user.id) {
      setError("Debe estar autenticado para crear una orden");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar datos según el modelo Order del backend
      const orderData = {
        supplier: formData.supplier.trim(),
        status: formData.delivery_status === "Delivered",
        issue_date: formData.issue_date,
        delivery_date: formData.delivery_date,
        amount: parseFloat(formData.amount) || 0,
        total: parseFloat(formData.total) || 0,
        responsible_person: formData.responsible_person?.trim() || null,
        delivery_status: formData.delivery_status || "Pending",
        contact: formData.contact?.trim() || null,
        item_quantity: parseInt(formData.item_quantity) || 0,
        company_name: formData.company_name?.trim() || null,
        company_address: formData.company_address?.trim() || null,
        notes: formData.notes?.trim() || null,
      };

      // Solo filtrar campos que son explícitamente undefined o string vacío
      Object.keys(orderData).forEach(key => {
        if (orderData[key] === '' || orderData[key] === undefined) {
          orderData[key] = null;
        }
      });

      console.log("Datos de la orden a enviar:", orderData);

      const response = await orderAPI.createOrder(orderData);
      
      if (response.data && response.data.success) {
        setSuccess("✅ Orden de compra creada exitosamente");

        // Resetear formulario
        setFormData({
          company_name: "Simetra S.A.",
          company_address: "",
          responsible_person: "",
          supplier: "",
          contact: "",
          issue_date: new Date().toISOString().split("T")[0],
          delivery_date: "",
          status: false,
          delivery_status: "Pending",
          amount: 0,
          total: 0,
          item_quantity: 0,
          notes: "",
        });

        // Resetear productos
        setProductos([
          { articulo: "", descripcion: "", cantidad: 1, precio_unitario: 0, importe: 0 },
        ]);

        if (onOrderCreated) {
          onOrderCreated(response.data.data);
        }

        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError("❌ Error al crear la orden: " + (response.data?.message || "Error desconocido"));
      }
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || 'Error del servidor';
        
        if (status === 500) {
          setError(`❌ Error interno del servidor: ${serverMessage}. Verifique que todos los campos estén correctos.`);
        } else if (status === 400) {
          setError(`❌ Datos inválidos: ${serverMessage}`);
        } else {
          setError(`❌ Error ${status}: ${serverMessage}`);
        }
      } else if (error.request) {
        setError('❌ Error de conexión. Verifique su conexión a internet.');
      } else {
        setError('❌ Error inesperado al crear la orden');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información del usuario */}
      {user && (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>Creando orden como:</strong> {user.nombre} {user.apellido}
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

      {!user && (
        <Alert variant="destructive">
          <AlertDescription>Debe estar autenticado para crear una orden de compra</AlertDescription>
        </Alert>
      )}

      {user && (
        <Alert className="border-blue-500 bg-blue-50">
          <AlertDescription className="text-blue-700">
            ℹ️ Los totales se calculan automáticamente basándose en los productos agregados
          </AlertDescription>
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
                <FormField label="Nombre de la Empresa" id="company_name" required value={formData.company_name} onChange={(e) => handleInputChange("company_name", e.target.value)} />
                <FormField label="Domicilio" id="company_address" required className="md:col-span-2" value={formData.company_address} onChange={(e) => handleInputChange("company_address", e.target.value)} placeholder="Dirección completa" />
                <FormField label="Responsable" id="responsible_person" required className="md:col-span-2" value={formData.responsible_person} onChange={(e) => handleInputChange("responsible_person", e.target.value)} placeholder="Nombre del responsable" />
              </div>
            </div>

            <Separator />

            {/* Proveedor */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Datos del Proveedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre del Proveedor" id="supplier" required value={formData.supplier} onChange={(e) => handleInputChange("supplier", e.target.value)} placeholder="Nombre del proveedor" />
                <FormField label="Contacto" id="contact" value={formData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} placeholder="Teléfono o email" />
              </div>
            </div>

            <Separator />

            {/* Fechas y Estado */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Información de la Orden</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Fecha de Emisión" id="issue_date" required type="date" value={formData.issue_date} onChange={(e) => handleInputChange("issue_date", e.target.value)} />
                <FormField label="Fecha de Entrega" id="delivery_date" required type="date" value={formData.delivery_date} onChange={(e) => handleInputChange("delivery_date", e.target.value)} />
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
          </CardContent>
        </Card>

        {/* Productos y Totales */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold">Productos y Totales</CardTitle>
              <Button type="button" onClick={addProducto} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Producto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lista de productos */}
            <div className="space-y-4">
              {productos.map((producto, index) => (
                <ProductRowOrder
                  key={index}
                  product={producto}
                  index={index}
                  onUpdate={updateProducto}
                  onRemove={removeProducto}
                />
              ))}
            </div>

            <Separator />

            {/* Totales */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Resumen de Totales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Cantidad de Items">
                  <div className="flex items-center h-9 px-3 bg-muted rounded-md">
                    <span className="text-sm font-semibold">
                      {formData.item_quantity} items
                    </span>
                  </div>
                </FormField>
                <FormField label="Monto">
                  <div className="flex items-center h-9 px-3 bg-muted rounded-md">
                    <span className="text-sm font-semibold">
                      ${(formData.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </FormField>
                <FormField label="Total">
                  <div className="flex items-center h-9 px-3 bg-muted rounded-md">
                    <span className="text-sm font-semibold">
                      ${(formData.total || 0).toFixed(2)}
                    </span>
                  </div>
                </FormField>
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Orden
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CardLoadNewOrder;
