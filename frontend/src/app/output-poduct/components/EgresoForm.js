"use client";

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
import { Clock } from "lucide-react";

const MOTIVOS_EGRESO = [
  "Devolución",
  "Uso interno", 
  "Mantenimiento",
  "Pérdida",
  "Robo",
  "Vencimiento",
];

const UBICACIONES_DESTINO = [
  "Cliente Externo",
  "Sucursal Norte",
  "Sucursal Sur", 
  "Almacén Temporal",
  "Área de Mantenimiento",
  "Oficina Central",
  "En Tránsito",
  "Fuera del Sistema",
];

const EgresoForm = ({ formData, onChange, disabled }) => {
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

        <div className="space-y-2">
          <Label htmlFor="destinatario">
            Destinatario <span className="text-red-500">*</span>
          </Label>
          <Input
            id="destinatario"
            placeholder="Nombre del destinatario"
            value={formData.destinatario}
            onChange={(e) => handleChange("destinatario", e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ubicacionDestino">
          Ubicación de Destino <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.ubicacionDestino}
          onValueChange={(value) => handleChange("ubicacionDestino", value)}
          disabled={disabled}
        >
          <SelectTrigger id="ubicacionDestino">
            <SelectValue placeholder="Seleccione la ubicación de destino" />
          </SelectTrigger>
          <SelectContent>
            {UBICACIONES_DESTINO.map((ubicacion) => (
              <SelectItem key={ubicacion} value={ubicacion}>
                {ubicacion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Observaciones */}
      <div className="space-y-2">
        <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
        <Textarea
          id="observaciones"
          placeholder="Ingrese cualquier observación adicional sobre el egreso..."
          value={formData.observaciones}
          onChange={(e) => handleChange("observaciones", e.target.value)}
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
};

export default EgresoForm;
