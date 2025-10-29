"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import WorkOrderInfo from "./components/WorkOrderInfo";
import WorkOrderProducts from "./components/WorkOrderProducts";
import WorkOrderSummary from "./components/WorkOrderSummary";

const WorkOrderModal = ({ isOpen, onClose, workOrder }) => {
  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center">
              <FileText className="w-6 h-6 mr-2 text-primary" />
              Solicitud #{workOrder.id}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <WorkOrderInfo workOrder={workOrder} />
          <WorkOrderProducts workOrder={workOrder} />
          <WorkOrderSummary workOrder={workOrder} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkOrderModal;
