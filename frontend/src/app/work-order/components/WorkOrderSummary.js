import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const WorkOrderSummary = ({ workOrder }) => {
  if (!workOrder) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Resumen de la Solicitud
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {workOrder.total_productos}
            </div>
            <div className="text-sm text-muted-foreground">
              Productos Solicitados
            </div>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {workOrder.estado}
            </div>
            <div className="text-sm text-muted-foreground">
              Estado Actual
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderSummary;
