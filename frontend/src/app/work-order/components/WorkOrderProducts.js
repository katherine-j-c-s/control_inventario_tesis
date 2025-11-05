import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const WorkOrderProducts = ({ workOrder }) => {
  if (!workOrder) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="w-5 h-5 text-primary" />
          Materiales Solicitados ({workOrder.total_productos})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workOrder.productos && workOrder.productos.length > 0 ? (
            workOrder.productos.map((producto, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground text-lg">
                    {producto.nombre}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {producto.cantidad} {producto.unidad}
                  </p>
                  {producto.observaciones && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {producto.observaciones}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {producto.cantidad} {producto.unidad}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkOrderProducts;
