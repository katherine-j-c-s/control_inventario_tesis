import React from "react";
import TableWorkOrder from "../TableWorkOrder";

const WorkOrderTable = ({ 
  workOrders, 
  currentView, 
  onApprove, 
  onReject 
}) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'all': return 'Todas las Solicitudes';
      case 'pending': return 'Solicitudes Pendientes';
      case 'approved': return 'Solicitudes Aprobadas';
      case 'rejected': return 'Solicitudes Rechazadas';
      default: return 'Solicitudes';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow dark:shadow-2xl">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">
          {getViewTitle()}
        </h2>
        <p className="text-muted-foreground">
          {workOrders.length} solicitud{workOrders.length !== 1 ? 'es' : ''} encontrada{workOrders.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="p-4">
        <TableWorkOrder
          workOrders={workOrders}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>
    </div>
  );
};

export default WorkOrderTable;
