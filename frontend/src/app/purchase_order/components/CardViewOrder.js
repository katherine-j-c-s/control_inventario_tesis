"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Building2,
  Calendar,
  Package,
  User,
  Phone,
  DollarSign,
  FileText,
  Truck,
} from "lucide-react";

export default function CardViewOrder({ isOpen, onClose, orderData }) {
  if (!orderData) return null;

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: "bg-yellow-500 text-white",
      "In Transit": "bg-blue-500 text-white",
      Delivered: "bg-green-500 text-white",
      Cancelled: "bg-red-500 text-white",
    };
    return statusConfig[status] || "bg-gray-500 text-white";
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

  // Datos de ejemplo de productos (esto vendría del backend)
  const productos = [
    {
      nombre: "Producto 1",
      cantidad: 5,
      precio: 3000.1,
      total: 15000.5,
    },
    {
      nombre: "Producto 2",
      cantidad: 3,
      precio: 2500.0,
      total: 7500.0,
    },
    {
      nombre: "Producto 3",
      cantidad: 7,
      precio: 1500.0,
      total: 10500.0,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingCart className="h-6 w-6" /> Detalles de la Orden de Compra
          </DialogTitle>
          <DialogDescription>Orden #{orderData.order_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Datos de la Empresa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Datos de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-semibold text-lg">{orderData.company_name || "Simetra S.A."}</p>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Dirección: {orderData.company_address || "Av. Simetra 1234, CABA"}
              </p>
            </CardContent>
          </Card>

          {/* Datos de la Orden */}
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
                  <span className="font-medium">{orderData.responsible_person || "N/A"}</span>
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

          {/* Productos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productos.map((producto, index) => (
                  <div key={index}>
                    <div className="grid grid-cols-4 gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div>
                        <p className="text-xs text-muted-foreground">Producto</p>
                        <p className="font-medium">{producto.nombre}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Cantidad</p>
                        <p className="font-medium">{producto.cantidad}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Precio Unit.</p>
                        <p className="font-medium">
                          {formatCurrency(producto.precio)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-semibold text-primary">
                          {formatCurrency(producto.total)}
                        </p>
                      </div>
                    </div>
                    {index < productos.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {orderData.notes || "Esta orden de compra debe ser entregada en el horario de 9:00 a 18:00 hs. Los productos deben venir embalados y etiquetados correctamente. Cualquier inconveniente comunicarse con el encargado de la orden."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Imprimir Orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
