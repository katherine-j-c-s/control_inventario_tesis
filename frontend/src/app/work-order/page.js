"use client";

import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import WorkOrderActions from "./WorkOrderActions";
import WorkOrderHeader from "./components/WorkOrderHeader";
import WorkOrderTable from "./components/WorkOrderTable";
import FormPO from "./FormPO";
import { useWorkOrders } from "./components/useWorkOrders";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const WorkOrder = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  
  const {
    workOrders,
    loadingData,
    error,
    success,
    currentView,
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    handleViewChange,
    handleRefresh,
    handleApprove,
    handleReject,
  } = useWorkOrders();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  const handleCreateNew = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleFormSubmit = (formData) => {
    console.log('Nueva solicitud:', formData);
    setShowForm(false);
    
    // Si la creación fue exitosa, refrescar la lista
    if (formData && formData.success) {
      handleRefresh();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  if (showForm) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Nueva Solicitud de Materiales
                </h1>
                <p className="text-muted-foreground">
                  Complete el formulario para solicitar materiales
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleFormClose}
              className="h-10 px-4"
            >
              Volver a la Lista
            </Button>
          </div>
          <FormPO onSubmit={handleFormSubmit} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <WorkOrderHeader />

        {/* Alertas */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Acciones */}
        <WorkOrderActions
          currentView={currentView}
          onViewChange={handleViewChange}
          onRefresh={handleRefresh}
          onCreateNew={handleCreateNew}
          loading={loadingData}
          totalCount={totalCount}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
          rejectedCount={rejectedCount}
        />

        {/* Tabla de solicitudes */}
        <WorkOrderTable
          workOrders={workOrders}
          currentView={currentView}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </Layout>
  );
};

const WorkOrderPage = () => {
  return (
    <AuthProvider>
      <WorkOrder />
    </AuthProvider>
  );
};

export default WorkOrderPage;