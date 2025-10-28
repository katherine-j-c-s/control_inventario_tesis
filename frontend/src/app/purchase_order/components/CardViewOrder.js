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
  Car,
} from "lucide-react";
import CardProductsSection from "@/components/CardProductsSection";
import DatesOrderCard from "./DatesOrderCard";
import CompanyData from "@/components/CardCompanyData";

export default function CardViewOrder({ isOpen, onClose, orderData }) {
  if (!orderData) return null;


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
          <CompanyData orderData={orderData} />

          {/* Datos de la orden  */}
          <DatesOrderCard orderData={orderData}/>
          {/* Productos */}

          <CardProductsSection productos={productos} />

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
                {orderData.notes ||
                  "Esta orden de compra debe ser entregada en el horario de 9:00 a 18:00 hs. Los productos deben venir embalados y etiquetados correctamente. Cualquier inconveniente comunicarse con el encargado de la orden."}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
