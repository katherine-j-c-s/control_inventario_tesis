"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import CardProductsSection from "@/components/CardProductsSection";
import DatesOrderCard from "./DatesOrderCard";
import CompanyData from "@/components/CardCompanyData";
import { orderAPI } from "@/lib/api";

export default function CardViewOrder({ isOpen, onClose, orderData }) {
  const [productos, setProductos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(null);

  // Fetch products when dialog opens and orderData changes
  useEffect(() => {
    if (isOpen && orderData?.order_id) {
      fetchOrderProducts();
    }
  }, [isOpen, orderData?.order_id]);

  const fetchOrderProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductsError(null);
      const response = await orderAPI.getOrderProducts(orderData.order_id);
      
      if (response.data.success) {
        // Transform the data to match the expected format for CardProductsSection
        const transformedProducts = response.data.data.map(product => ({
          nombre: product.name || product.nombre,
          cantidad: product.quantity || 1,
          precio: parseFloat(product.unit_price || 0),
          total: parseFloat(product.total || 0)
        }));
        setProductos(transformedProducts);
      } else {
        setProductsError("No se pudieron cargar los productos");
        setProductos([]);
      }
    } catch (error) {
      console.error("Error fetching order products:", error);
      setProductsError("Error al cargar los productos de la orden");
      setProductos([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (!orderData) return null;


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
          {loadingProducts ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando productos...</span>
                </div>
              </CardContent>
            </Card>
          ) : productsError ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{productsError}</p>
                  <Button 
                    variant="outline" 
                    onClick={fetchOrderProducts}
                    className="mt-4"
                  >
                    Reintentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : productos.length > 0 ? (
            <CardProductsSection productos={productos} />
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay productos asociados a esta orden</p>
                </div>
              </CardContent>
            </Card>
          )}

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
