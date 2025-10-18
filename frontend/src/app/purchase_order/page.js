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
import { PlusCircle } from "lucide-react";
import TableOrders from "./components/TableOrders";
import CardLoadNewOrder from "./components/CardLoadNewOrder";

const PurchaseOrderContent = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrderCreated = () => {
    // Aquí podrías recargar la lista de órdenes
    console.log("Orden creada exitosamente");
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
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Generar Informe
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
          <TableOrders />
        </motion.div>
      </div>

      {/* Modal para Nueva Orden */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
            onClose={() => setIsModalOpen(false)}
            onOrderCreated={handleOrderCreated}
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
