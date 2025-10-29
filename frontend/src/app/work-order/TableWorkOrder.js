"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import WorkOrderModal from "./WorkOrderViewCard";
import StatusBadge from "./components/StatusBadge";
import { formatDate } from "./components/formatters";
import {
  Eye,
  Building2,
  User,
  Calendar,
  Package,
} from "lucide-react";

const TableWorkOrder = ({ workOrders, onApprove, onReject, onView }) => {
  const { theme } = useTheme();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos de ejemplo para demostración
  const mockData = [
    {
      id: 1,
      solicitante: "Juan Pérez",
      obra: "Armado de Pozo - Sede Central",
      fecha_solicitud: "2024-01-15",
      fecha_requerida: "2024-01-20",
      prioridad: "Alta",
      estado: "Pendiente",
      total_productos: 3,
      productos: [
        { nombre: "Cemento Portland", cantidad: 50, unidad: "bolsa" },
        { nombre: "Ladrillos cerámicos", cantidad: 1000, unidad: "unidad" },
        { nombre: "Arena gruesa", cantidad: 5, unidad: "m³" },
      ],
      observaciones: "Materiales necesarios para la primera fase del proyecto",
    },
    {
      id: 2,
      solicitante: "María González",
      obra: "Construcción Edificio A - Sede Norte",
      fecha_solicitud: "2024-01-14",
      fecha_requerida: "2024-01-18",
      prioridad: "Media",
      estado: "Aprobada",
      total_productos: 2,
      productos: [
        { nombre: "Acero de construcción", cantidad: 200, unidad: "kg" },
        { nombre: "Alambre de amarre", cantidad: 10, unidad: "rollo" },
      ],
      observaciones: "Refuerzos para estructura",
    },
    {
      id: 3,
      solicitante: "Carlos López",
      obra: "Remodelación Oficinas - Sede Sur",
      fecha_solicitud: "2024-01-13",
      fecha_requerida: "2024-01-25",
      prioridad: "Baja",
      estado: "Rechazada",
      total_productos: 1,
      productos: [
        { nombre: "Pintura blanca", cantidad: 20, unidad: "litro" },
      ],
      observaciones: "Pintura para oficinas",
    },
  ];

  const data = workOrders || mockData;


  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="w-full border-none">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-foreground font-semibold">ID</TableHead>
              <TableHead className="text-foreground font-semibold">Solicitante</TableHead>
              <TableHead className="text-foreground font-semibold">Obra</TableHead>
              <TableHead className="text-foreground font-semibold">Fecha Solicitud</TableHead>
              <TableHead className="text-foreground font-semibold">Fecha Requerida</TableHead>
              <TableHead className="text-foreground font-semibold">Estado</TableHead>
              <TableHead className="text-foreground font-semibold">Productos</TableHead>
              <TableHead className="text-foreground font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data && data.length > 0 ? (
              data.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-muted/50 dark:hover:bg-muted/20"
                >
                  <TableCell className="font-medium text-foreground">
                    #{order.id}
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {order.solicitante}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="max-w-[200px] truncate" title={order.obra}>
                        {order.obra}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(order.fecha_solicitud)}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(order.fecha_requerida)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.estado} />
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      {order.total_productos} producto{order.total_productos !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(order)}
                        className="h-8 px-3"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      {order.estado === "Pendiente" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApprove && onApprove(order.id)}
                            className="h-8 px-3 text-white hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/20"
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject && onReject(order.id)}
                            className="h-8 px-3 text-white hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900/20"
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No hay solicitudes de materiales disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de detalles */}
      <WorkOrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        workOrder={selectedOrder}
      />
    </>
  );
};

export default TableWorkOrder;
