"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


import {
  X,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";
import { receiptAPI } from "@/lib/api";
import CardProductsSection from "@/components/CardProductsSection";
import InfoReceipt from "./InfoReceipt";

const ReceiptModal = ({ isOpen, onClose, receipt, onVerify }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && receipt) {
      loadReceiptProducts();
    }
  }, [isOpen, receipt]);

  const loadReceiptProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await receiptAPI.getReceiptWithProducts(
        receipt.receipt_id
      );
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setError("Error al cargar los productos del remito");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No disponible";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

 
 

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-card border-border w-[95vw] sm:w-full">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-foreground flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
              <span className="break-words">Detalles del Remito #{receipt.receipt_id}</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del remito */}
          <InfoReceipt receipt={receipt} />

          {/* productos del remito  */}

          <CardProductsSection
            productos={products.map((p) => ({
              nombre: p.product_name,
              cantidad: p.quantity,
              precio: p.product_price,
              total: p.quantity * p.product_price,
            }))}
          />
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      ID de Orden:
                    </span>
                    <span className="text-sm text-muted-foreground">
                      #{receipt.order_id || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      Total de Productos:
                    </span>
                    <span className="text-sm text-muted-foreground font-semibold">
                      {receipt.quantity_products}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      Fecha de Creación:
                    </span>
                    <span className="text-sm text-muted-foreground break-words">
                      {formatDate(receipt.entry_date)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-border">
          <div className="flex space-x-2">
            {selectedProducts.size > 0 && (
              <Button
                variant="outline"
                onClick={() => setSelectedProducts(new Set())}
                className="text-muted-foreground w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Limpiar Selección
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cerrar
            </Button>
            {!receipt.verification_status && (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                onClick={() => onVerify && onVerify(receipt.receipt_id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verificar Remito
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptModal;
