"use client";

import React from 'react';
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const ReceiptsTable = ({ receipts, onVerify, onView }) => {
  const { theme } = useTheme();
  const getStatusBadge = (status, verificationStatus) => {
    if (verificationStatus) {
      return (
        <Badge variant="default" className="bg-primary">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verificado
        </Badge>
      );
    // } else if (status === 'pending') {
    //   return (
    //     <Badge variant="secondary" className="bg-yellow-500">
    //       <Clock className="w-3 h-3 mr-1" />
    //       Pendiente
    //     </Badge>
    //   );
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          No Verificado
        </Badge>
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-foreground">ID</TableHead>
            <TableHead className="text-foreground">Almacén</TableHead>
            <TableHead className="text-foreground">Cantidad</TableHead>
            <TableHead className="text-foreground">Fecha de Entrada</TableHead>
            <TableHead className="text-foreground">Estado</TableHead>
            <TableHead className="text-foreground">Orden ID</TableHead>
            {/* <TableHead className="text-foreground">Producto ID</TableHead> */}
            <TableHead className="text-foreground">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receipts && receipts.length > 0 ? (
            receipts.map((receipt) => (
              <TableRow key={receipt.receipt_id} className="border-border hover:bg-muted/50">
                <TableCell className="font-medium text-foreground">
                  {receipt.receipt_id}
                </TableCell>
                <TableCell className="text-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium">{receipt.warehouse_name || 'Sin almacén'}</span>
                    {receipt.warehouse_location && (
                      <span className="text-xs text-muted-foreground">{receipt.warehouse_location}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{receipt.quantity_products || 'N/A'}</TableCell>
                <TableCell className="text-foreground">{formatDate(receipt.entry_date)}</TableCell>
                <TableCell>
                  {getStatusBadge(receipt.status, receipt.verification_status)}
                </TableCell>
                <TableCell className="text-foreground">{receipt.order_id || 'N/A'}</TableCell>
                {/* <TableCell className="text-foreground">{receipt.product_id || 'N/A'}</TableCell> */}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(receipt)}
                      className="border-border hover:bg-muted"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {/* {!receipt.verification_status && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onVerify(receipt.receipt_id)}
                        className="bg-primary hover:bg-primary-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verificar
                      </Button>
                    )} */}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-border">
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No hay remitos disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReceiptsTable;
