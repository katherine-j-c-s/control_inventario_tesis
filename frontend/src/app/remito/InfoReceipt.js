import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  MapPin,
  Package,
  XCircle,
} from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";

const InfoReceipt = ({ receipt }) => {
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

  const getStatusBadge = (status, verified) => {
    if (verified) {
      return (
        <Badge className="bg-primary-600 text-primary-foreground border-primary-200">
          Verificado
        </Badge>
      );
    }
    if (status === "Pending") {
      return <Badge className="bg-gray-500 text-white ">Pendiente</Badge>;
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
        {status}
      </Badge>
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center">
          <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <Hash className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <span className="text-sm font-medium text-foreground">
                ID del Remito:
              </span>
              <span className="text-sm text-muted-foreground">
                #{receipt.receipt_id}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <span className="text-sm font-medium text-foreground">
                Almacén:
              </span>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground font-medium break-words">
                  {receipt.warehouse_name || "Sin almacén"}
                </span>
                {receipt.warehouse_location && (
                  <span className="text-xs text-muted-foreground break-words">
                    {receipt.warehouse_location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <Package className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <span className="text-sm font-medium text-foreground">
                Cantidad de Productos:
              </span>
              <span className="text-sm text-muted-foreground">
                {receipt.quantity_products}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <span className="text-sm font-medium text-foreground">
                Fecha de Entrada:
              </span>
              <span className="text-sm text-muted-foreground break-words">
                {formatDate(receipt.entry_date)}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-sm font-medium text-foreground">
                Estado:
              </span>
              {getStatusBadge(receipt.status, receipt.verification_status)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <span className="text-sm font-medium text-foreground">
                Verificación:
              </span>
              {receipt.verification_status ? (
                <div className="flex items-center text-primary dark:text-primary-400">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Verificado</span>
                </div>
              ) : (
                <div className="flex items-center text-destructive">
                  <XCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">No Verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfoReceipt;
