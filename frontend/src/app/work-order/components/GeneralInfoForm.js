import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, User, Calendar } from "lucide-react";

const GeneralInfoForm = ({ formData, onFormChange }) => {
  const obras = [
    "Armado de Pozo - Sede Central",
    "Construcción Edificio A - Sede Norte",
    "Remodelación Oficinas - Sede Sur",
    "Instalación Eléctrica - Sede Este",
    "Pavimentación - Sede Oeste",
  ];

  const handleChange = (field, value) => {
    onFormChange(field, value);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="solicitante" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Solicitante *
            </Label>
            <Input
              id="solicitante"
              value={formData.solicitante}
              onChange={(e) => handleChange("solicitante", e.target.value)}
              placeholder="Nombre del solicitante"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obra" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Obra *
            </Label>
            <Select
              value={formData.obra}
              onValueChange={(value) => handleChange("obra", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una obra" />
              </SelectTrigger>
              <SelectContent>
                {obras.map((obra) => (
                  <SelectItem key={obra} value={obra}>
                    {obra}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_requerida" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha Requerida *
            </Label>
            <Input
              id="fecha_requerida"
              type="date"
              value={formData.fecha_requerida}
              onChange={(e) => handleChange("fecha_requerida", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={formData.observaciones}
            onChange={(e) => handleChange("observaciones", e.target.value)}
            placeholder="Observaciones adicionales sobre la solicitud..."
            className="w-full"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoForm;
