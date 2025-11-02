"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

const MOTIVOS_EGRESO = [
  "Devolución",
  "Uso interno", 
  "Pérdida",
  "Robo",
  "Vencimiento",
];

const EgresoForm = ({ formData, onChange, disabled, productInfo }) => {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Detalles del Egreso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="motivo">
            Motivo del Egreso <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.motivo}
            onValueChange={(value) => handleChange("motivo", value)}
            disabled={disabled}
          >
            <SelectTrigger id="motivo">
              <SelectValue placeholder="Seleccione el motivo" />
            </SelectTrigger>
            <SelectContent>
              {MOTIVOS_EGRESO.map((motivo) => (
                <SelectItem key={motivo} value={motivo}>
                  {motivo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="space-y-2">
        <Label htmlFor="ubicacionActual">
          Ubicación Actual del Producto
        </Label>
        <div className="bg-muted/50 border border-input rounded-md px-3 py-2 text-sm">
          {productInfo?.ubicacion || "No especificada"}
        </div>
        <p className="text-xs text-muted-foreground">
          Esta es la ubicación actual del producto en el inventario
        </p>
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha">
            Fecha <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fecha"
            type="date"
            value={formData.fecha}
            onChange={(e) => handleChange("fecha", e.target.value)}
            disabled={disabled}
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
              onChange={(e) => handleChange("hora", e.target.value)}
              disabled={disabled}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Responsable */}
      <div className="space-y-2">
        <Label htmlFor="responsable">
          Responsable del Egreso <span className="text-red-500">*</span>
        </Label>
        <Input
          id="responsable"
          placeholder="Nombre del responsable"
          value={formData.responsable}
          onChange={(e) => handleChange("responsable", e.target.value)}
          disabled={disabled}
        />
      </div>

    </div>
  );
};

export default EgresoForm;
