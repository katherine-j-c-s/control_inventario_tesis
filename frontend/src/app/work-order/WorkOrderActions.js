"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Plus, RefreshCw } from "lucide-react";

const WorkOrderActions = ({ 
  currentView, 
  onViewChange, 
  onRefresh, 
  onCreateNew, 
  loading, 
  error, 
  success,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount 
}) => {
  const views = [
    { key: 'all', label: 'Todas', count: totalCount },
    { key: 'pending', label: 'Pendientes', count: pendingCount },
    { key: 'approved', label: 'Aprobadas', count: approvedCount },
    { key: 'rejected', label: 'Rechazadas', count: rejectedCount },
  ];

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          {views.map((view) => (
            <Button
              key={view.key}
              variant={currentView === view.key ? "default" : "outline"}
              onClick={() => onViewChange(view.key)}
              className="h-9 px-4"
              disabled={loading}
            >
              {view.label}
              <Badge 
                variant="secondary" 
                className="ml-2 bg-muted text-muted-foreground"
              >
                {view.count}
              </Badge>
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
            className="h-9 px-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={onCreateNew}
            className="h-9 px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderActions;
