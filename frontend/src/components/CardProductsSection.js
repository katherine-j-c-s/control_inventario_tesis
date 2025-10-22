import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Package } from "lucide-react";
import { Separator } from "./ui/separator";

const CardProductsSection = ({ productos }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };
  return (
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
  );
};

export default CardProductsSection;
