"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layouts/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PlusCircle, FileText } from "lucide-react";
import TableOrders from "./components/TableOrders";
import CardLoadNewOrder from "./components/CardLoadNewOrder";
import GenerateReportComponent from "./components/GenerateReportComponent";

const PurchaseOrderContent = () => {
  const { user } = useAuth();
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOrderCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenNewOrderModal = () => {
    setIsNewOrderModalOpen(true);
  };

  const handleCloseNewOrderModal = () => {
    setIsNewOrderModalOpen(false);
  };

  const handleOpenGenerateReportModal = () => {
    setIsGenerateReportModalOpen(true);
  };

  const handleCloseGenerateReportModal = () => {
    setIsGenerateReportModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
              <p className="mt-1 text-muted-foreground">
                Gestiona y visualiza las órdenes de compra.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenNewOrderModal}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
              </Button>
              <Button 
                variant="outline" 
                onClick={handleOpenGenerateReportModal}
              >
                <FileText className="mr-2 h-4 w-4" /> Generar Informe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <TableOrders key={refreshKey} />
        </motion.div>
      </div>

      {/* Modal para Nueva Orden */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Crear Nueva Orden de Compra
            </DialogTitle>
            <DialogDescription>
              Completa los datos para generar una nueva orden de compra
            </DialogDescription>
          </DialogHeader>
          <CardLoadNewOrder
            onClose={handleCloseNewOrderModal}
            onOrderCreated={handleOrderCreated}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Generar Informe */}
      <Dialog open={isGenerateReportModalOpen} onOpenChange={setIsGenerateReportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Generar Informe de Orden de Compra
            </DialogTitle>
            <DialogDescription>
              Busca una orden por su ID y genera un informe en formato PDF
            </DialogDescription>
          </DialogHeader>
          <GenerateReportComponent
            onClose={handleCloseGenerateReportModal}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default function PurchaseOrder() {
  return (
    <AuthProvider>
      <PurchaseOrderContent />
    </AuthProvider>
  );
}