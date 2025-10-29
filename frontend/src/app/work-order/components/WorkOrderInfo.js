import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, User, Calendar } from "lucide-react";
import { formatDate } from "./formatters";
import StatusBadge from "./StatusBadge";

const WorkOrderInfo = ({ workOrder }) => {
  if (!workOrder) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-primary" />
          Información de la Solicitud
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Solicitante
            </label>
            <p className="text-foreground mt-1">{workOrder.solicitante}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Obra
            </label>
            <p className="text-foreground mt-1">{workOrder.obra}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de Solicitud
            </label>
            <p className="text-foreground mt-1">{formatDate(workOrder.fecha_solicitud)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha Requerida
            </label>
            <p className="text-foreground mt-1">{formatDate(workOrder.fecha_requerida)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Estado</label>
            <div className="mt-1">
              <StatusBadge status={workOrder.estado} />
            </div>
          </div>
        </div>
        {workOrder.observaciones && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Observaciones</label>
            <p className="text-foreground mt-1 p-3 bg-muted/50 rounded-lg">
              {workOrder.observaciones}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkOrderInfo;
