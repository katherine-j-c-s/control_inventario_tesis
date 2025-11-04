import React from "react";
import { FileText } from "lucide-react";

const WorkOrderHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Solicitudes de Materiales
        </h1>
        <p className="text-muted-foreground">
          Gestione las solicitudes de materiales para obras específicas
        </p>
      </div>
    </div>
  );
};

export default WorkOrderHeader;
