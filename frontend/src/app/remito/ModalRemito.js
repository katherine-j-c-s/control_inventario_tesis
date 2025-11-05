"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadReceipt from "./LoadReceipt";

const ModalRemito = ({ isOpen, onClose, onReceiptCreated }) => {
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Cargar Remito</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          <LoadReceipt 
            onClose={handleClose}
            onReceiptCreated={onReceiptCreated} 
          />
        </div>
      </div>
    </div>
  );
};

export default ModalRemito;
