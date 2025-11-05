import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import React from "react";

const DatesOrderCard = ({ orderData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };
  const getStatusText = (status) => {
    const statusMap = {
      Pending: "Pendiente",
      "In Transit": "En Tránsito",
      Delivered: "Entregado",
      Cancelled: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: "bg-gray-500 text-white",
      "In Transit": "bg-blue-500 text-white",
      Delivered: "bg-gray-500 text-white",
      Cancelled: "bg-gray-500 text-white",
    };
    return statusConfig[status] || "bg-gray-500 text-white";
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Datos de la Orden
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ID:</span>
            <span className="font-medium">#{orderData.order_id}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fecha de Emisión:
            </span>
            <span className="font-medium">
              {formatDate(orderData.issue_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Fecha de Entrega:
            </span>
            <span className="font-medium">
              {formatDate(orderData.delivery_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Cantidad de Artículos:
            </span>
            <span className="font-medium">{orderData.item_quantity || 0}</span>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Estado de Entrega:
            </span>
            <Badge className={getStatusBadge(orderData.delivery_status)}>
              {getStatusText(orderData.delivery_status)}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Proveedor:</span>
            <span className="font-medium">{orderData.supplier || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Encargado de la orden:
            </span>
            <span className="font-medium">
              {orderData.responsible_person || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Contacto:</span>
            <span className="font-medium">{orderData.contact || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(orderData.total || 0)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatesOrderCard;
