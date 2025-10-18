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
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-border rounded-lg bg-card">
      <FormField
        label="Artículo"
        id={`articulo-${index}`}
        required
        className="md:col-span-2"
        value={product.articulo || ""}
        onChange={(e) => handleChange("articulo", e.target.value)}
        placeholder="Nombre del artículo"
      />

      <FormField
        label="Descripción"
        id={`descripcion-${index}`}
        className="md:col-span-2"
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
        value={product.precio_unitario || ""}
        onChange={(e) => handleChange("precio_unitario", e.target.value)}
        placeholder="0.00"
      />

      <FormField label="Importe">
        <div className="flex items-center h-9 px-3 bg-muted rounded-md">
          <span className="text-sm font-semibold">
            ${(product.importe || 0).toFixed(2)}
          </span>
        </div>
      </FormField>

      <div className="flex items-end md:col-span-1">
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
  const [formData, setFormData] = useState({
    // Datos de la empresa que compra
    nombre_empresa: "Simetra S.A.",
    cuit: "",
    domicilio_empresa: "",
    responsable: "",
    
    // Datos del proveedor
    nombre_proveedor: "",
    direccion_proveedor: "",
    
    // Fechas y tiempos
    fecha_emision: new Date().toISOString().split("T")[0],
    fecha_entrega: "",
    tiempo_entrega_estimado: "",
    
    // Estado y montos
    estado: "Pendiente",
    subtotal: 0,
    bono: 0,
    total: 0,
    observaciones: "",
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
    setProductos((prev) => prev.map((product, i) => (i === index ? updatedProduct : product)));
  };

  const removeProducto = (index) => {
    if (productos.length > 1) {
      setProductos((prev) => prev.filter((_, i) => i !== index));
    }
  };


  const validateForm = () => {
    if (!formData.nombre_empresa || !formData.cuit || !formData.nombre_proveedor) {
      setError("Por favor, completa los campos obligatorios de la empresa y proveedor");
      return false;
    }

    if (!formData.fecha_emision || !formData.fecha_entrega) {
      setError("Por favor, completa las fechas de emisión y entrega");
      return false;
    }

    const validProductos = productos.filter(
      (p) => p.articulo && p.cantidad > 0 && p.precio_unitario > 0
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

    setLoading(true);
    setError(null);

    try {
      // Aquí iría la llamada al API
      const orderData = {
        ...formData,
        productos: productos.filter((p) => p.articulo && p.cantidad > 0),
      };

      console.log("Datos de la orden a enviar:", orderData);

      // Simulación de guardado exitoso
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess("✅ Orden de compra creada exitosamente");

      if (onOrderCreated) {
        onOrderCreated();
      }

      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      setError("❌ Error al guardar la orden. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
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
                <FormField label="Nombre de la Empresa" id="nombre_empresa" required value={formData.nombre_empresa} onChange={(e) => handleInputChange("nombre_empresa", e.target.value)} />
                <FormField label="CUIT" id="cuit" required value={formData.cuit} onChange={(e) => handleInputChange("cuit", e.target.value)} placeholder="XX-XXXXXXXX-X" />
                <FormField label="Domicilio" id="domicilio_empresa" required className="md:col-span-2" value={formData.domicilio_empresa} onChange={(e) => handleInputChange("domicilio_empresa", e.target.value)} placeholder="Dirección completa" />
                <FormField label="Responsable" id="responsable" required className="md:col-span-2" value={formData.responsable} onChange={(e) => handleInputChange("responsable", e.target.value)} placeholder="Nombre del responsable" />
              </div>
            </div>

            <Separator />

            {/* Proveedor */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Datos del Proveedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Nombre del Proveedor" id="nombre_proveedor" required value={formData.nombre_proveedor} onChange={(e) => handleInputChange("nombre_proveedor", e.target.value)} placeholder="Nombre del proveedor" />
                <FormField label="Dirección del Proveedor" id="direccion_proveedor" required value={formData.direccion_proveedor} onChange={(e) => handleInputChange("direccion_proveedor", e.target.value)} placeholder="Dirección completa" />
              </div>
            </div>

            <Separator />

            {/* Fechas y Estado */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Información de la Orden</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Fecha de Emisión" id="fecha_emision" required type="date" value={formData.fecha_emision} onChange={(e) => handleInputChange("fecha_emision", e.target.value)} />
                <FormField label="Fecha de Entrega" id="fecha_entrega" required type="date" value={formData.fecha_entrega} onChange={(e) => handleInputChange("fecha_entrega", e.target.value)} />
                <FormField label="Tiempo Estimado" id="tiempo_entrega_estimado" value={formData.tiempo_entrega_estimado} onChange={(e) => handleInputChange("tiempo_entrega_estimado", e.target.value)} placeholder="Ej: 5-7 días" />
                <FormField label="Estado" id="estado" required>
                  <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En Tránsito">En Tránsito</SelectItem>
                      <SelectItem value="Entregado">Entregado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
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
                <FormField 
                  label="Subtotal" 
                  id="subtotal"
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.subtotal} 
                  onChange={(e) => handleInputChange("subtotal", parseFloat(e.target.value) || 0)} 
                  placeholder="0.00" 
                />
                <FormField 
                  label="Bono / Descuento" 
                  id="bono" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.bono} 
                  onChange={(e) => handleInputChange("bono", parseFloat(e.target.value) || 0)} 
                  placeholder="0.00" 
                />
                <FormField 
                  label="Total" 
                  id="total"
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.total} 
                  onChange={(e) => handleInputChange("total", parseFloat(e.target.value) || 0)} 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <Separator />

            {/* Observaciones */}
            <FormField label="Observaciones" id="observaciones">
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                placeholder="Notas adicionales sobre la orden..."
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-2">
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
