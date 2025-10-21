"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRightLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  CheckCircle,
  Save,
  X,
  AlertCircle,
} from "lucide-react";


const MoveProduct = ({ onClose, onMovementCreated, currentUser }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    codigoProducto: "",
    ubicacionOrigen: "",
    estanteriaOrigen: "",
    ubicacionDestino: "",
    fecha: new Date().toISOString().split("T")[0], // Fecha actual
    hora: new Date().toTimeString().split(" ")[0].substring(0, 5), // Hora actual HH:MM
    responsable: "",
    aprobadoPor: currentUser?.nombre || currentUser?.name || "", // Usuario actual
    observaciones: "",
  });

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [productInfo, setProductInfo] = useState(null);

  // Lista de ubicaciones disponibles (esto debería venir de una API)
  const ubicaciones = [
    "Almacén Central",
    "Almacén Secundario",
    "Oficina Piso 1",
    "Oficina Piso 2",
    "Sala de Servidores",
    "Deposito A",
    "Deposito B",
    "En Tránsito",
  ];

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar errores al escribir
    if (error) setError(null);
  };

  // Buscar producto por código (simulado, aquí iría la llamada a la API)
  const handleSearchProduct = async () => {
    if (!formData.codigoProducto.trim()) {
      setError("Por favor ingrese un código de producto");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setTimeout(() => {
        // Simulación de datos del producto
        setProductInfo({
          nombre: "Laptop Dell Inspiron 15",
          codigo: formData.codigoProducto,
          ubicacionActual: "Almacén Central",
          estanteria: "A1",
          cantidad: 5,
        });

        // Pre-llenar ubicación origen y estantería
        setFormData((prev) => ({
          ...prev,
          ubicacionOrigen: "Almacén Central",
          estanteriaOrigen: "A1",
        }));

        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError("No se encontró el producto con ese código");
      setProductInfo(null);
      setIsLoading(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.codigoProducto.trim()) {
      setError("El código del producto es requerido");
      return false;
    }
    if (!formData.ubicacionOrigen) {
      setError("La ubicación de origen es requerida");
      return false;
    }
    if (!formData.estanteriaOrigen.trim()) {
      setError("La estantería de origen es requerida");
      return false;
    }
    if (!formData.ubicacionDestino) {
      setError("La ubicación de destino es requerida");
      return false;
    }
    if (formData.ubicacionOrigen === formData.ubicacionDestino) {
      setError("La ubicación de origen y destino no pueden ser la misma");
      return false;
    }
    if (!formData.fecha) {
      setError("La fecha es requerida");
      return false;
    }
    if (!formData.hora) {
      setError("La hora es requerida");
      return false;
    }
    if (!formData.responsable.trim()) {
      setError("El responsable del movimiento es requerido");
      return false;
    }
    if (!formData.aprobadoPor.trim()) {
      setError("La persona que aprueba es requerida");
      return false;
    }
    return true;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Movimiento registrado exitosamente");

      // Notificar al componente padre
      if (onMovementCreated) {
        onMovementCreated({
          id: Date.now(),
          producto: productInfo?.nombre || formData.codigoProducto,
          tipo: "transferencia",
          cantidad: 1,
          origen: `${formData.ubicacionOrigen} - Est. ${formData.estanteriaOrigen}`,
          destino: formData.ubicacionDestino,
          usuario: formData.responsable,
          timestamp: new Date(`${formData.fecha}T${formData.hora}`).getTime(),
          observaciones: formData.observaciones,
          aprobadoPor: formData.aprobadoPor,
        });
      }

      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          resetForm();
        }
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al registrar el movimiento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData({
      codigoProducto: "",
      ubicacionOrigen: "",
      estanteriaOrigen: "",
      ubicacionDestino: "",
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toTimeString().split(" ")[0].substring(0, 5),
      responsable: "",
      aprobadoPor: currentUser?.nombre || currentUser?.name || "", // Mantener usuario actual
      observaciones: "",
    });
    setProductInfo(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="mt-4">
        <CardContent className="space-y-6">
          {/* Alertas */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Sección: Información del Producto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5 text-primary" />
              <span>Información del Producto</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="codigoProducto">
                  Código del Producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codigoProducto"
                  placeholder="Ej: PROD-001"
                  value={formData.codigoProducto}
                  onChange={(e) =>
                    handleInputChange("codigoProducto", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleSearchProduct}
                  disabled={isLoading || !formData.codigoProducto.trim()}
                >
                  Buscar Producto
                </Button>
              </div>
            </div>

            {/* Información del producto encontrado */}
            {productInfo && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-semibold text-lg">{productInfo.nombre}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                  <p>
                    Código:{" "}
                    <span className="font-medium text-foreground">
                      {productInfo.codigo}
                    </span>
                  </p>
                  <p>
                    Ubicación Actual:{" "}
                    <span className="font-medium text-foreground">
                      {productInfo.ubicacionActual}
                    </span>
                  </p>
                  <p>
                    Estantería:{" "}
                    <span className="font-medium text-foreground">
                      {productInfo.estanteria}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sección: Ubicaciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Ubicaciones</span>
            </div>

            {/* Ubicación Actual (Origen) */}
            <div className=" rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-sm">Ubicación Actual (Origen)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ubicacionOrigen">
                    Ubicación <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.ubicacionOrigen}
                    onValueChange={(value) =>
                      handleInputChange("ubicacionOrigen", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="ubicacionOrigen">
                      <SelectValue placeholder="Seleccione ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {ubicaciones.map((ubicacion) => (
                        <SelectItem key={ubicacion} value={ubicacion}>
                          {ubicacion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estanteriaOrigen">
                    Estantería <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="estanteriaOrigen"
                    placeholder="Ej: A1, B2, C3..."
                    value={formData.estanteriaOrigen}
                    onChange={(e) =>
                      handleInputChange("estanteriaOrigen", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Ubicación Destino */}
            <div className="space-y-2">
              <Label htmlFor="ubicacionDestino">
                Ubicación Destino <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.ubicacionDestino}
                onValueChange={(value) =>
                  handleInputChange("ubicacionDestino", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="ubicacionDestino">
                  <SelectValue placeholder="Seleccione ubicación destino" />
                </SelectTrigger>
                <SelectContent>
                  {ubicaciones.map((ubicacion) => (
                    <SelectItem key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sección: Fecha y Hora */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Fecha y Hora del Movimiento</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange("fecha", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">
                  Hora <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => handleInputChange("hora", e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Responsables */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5 text-primary" />
              <span>Responsables</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsable">
                  Responsable del Movimiento{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="responsable"
                  placeholder="Nombre del responsable"
                  value={formData.responsable}
                  onChange={(e) =>
                    handleInputChange("responsable", e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aprobadoPor">
                  Aprobado Por <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                  <Input
                    id="aprobadoPor"
                    placeholder="Usuario actual"
                    value={formData.aprobadoPor}
                    onChange={(e) =>
                      handleInputChange("aprobadoPor", e.target.value)
                    }
                    disabled={isLoading}
                    className="pl-10 "
                  />
                </div>
                
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <Textarea
              id="observaciones"
              placeholder="Ingrese cualquier observación adicional sobre el movimiento..."
              value={formData.observaciones}
              onChange={(e) =>
                handleInputChange("observaciones", e.target.value)
              }
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            disabled={isLoading}
          >
            Limpiar
          </Button>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Movimiento
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MoveProduct;
