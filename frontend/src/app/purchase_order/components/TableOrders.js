"use client";

import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Pencil, Trash2, FileText, Search } from "lucide-react";
import CardViewOrder from "./CardViewOrder";

const TableOrders = () => {
  // Estados para filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  
  // Estados para el modal de visualización
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Datos de ejemplo
  const [orders] = useState([
    {
      id: 1,
      proveedor: "Proveedor ABC",
      fecha_emision: "2025-10-15",
      fecha_entrega: "2025-10-25",
      cantidad_articulos: 15,
      estado_entrega: "Pendiente",
      total: 15000.50,
      encargado: "Juan Pérez",
      contacto: "+54 11 1234-5678",
    },
    {
      id: 2,
      proveedor: "Distribuidora XYZ",
      fecha_emision: "2025-10-14",
      fecha_entrega: "2025-10-24",
      cantidad_articulos: 32,
      estado_entrega: "En Tránsito",
      total: 28500.00,
      encargado: "María González",
      contacto: "+54 11 2345-6789",
    },
    {
      id: 3,
      proveedor: "Importaciones DEF",
      fecha_emision: "2025-10-13",
      fecha_entrega: "2025-10-20",
      cantidad_articulos: 48,
      estado_entrega: "Entregado",
      total: 42300.75,
      encargado: "Carlos Rodríguez",
      contacto: "+54 11 3456-7890",
    },
    {
      id: 4,
      proveedor: "Proveedor ABC",
      fecha_emision: "2025-10-12",
      fecha_entrega: "2025-10-22",
      cantidad_articulos: 20,
      estado_entrega: "Cancelado",
      total: 19800.00,
      encargado: "Ana Martínez",
      contacto: "+54 11 4567-8901",
    },
    {
      id: 5,
      proveedor: "Suministros GHI",
      fecha_emision: "2025-10-11",
      fecha_entrega: "2025-10-21",
      cantidad_articulos: 28,
      estado_entrega: "En Tránsito",
      total: 33750.25,
      encargado: "Luis Fernández",
      contacto: "+54 11 5678-9012",
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pendiente":
        return (
          <Badge variant="secondary" className="bg-primary-500 hover:bg-primary-600">
            Pendiente
          </Badge>
        );
      case "En Tránsito":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            En Tránsito
          </Badge>
        );
      case "Entregado":
        return (
          <Badge variant="default" className="bg-primary-500 hover:bg-primary-600">
            Entregado
          </Badge>
        );
      case "Cancelado":
        return (
          <Badge variant="destructive">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEdit = (order) => {
    console.log('Editar orden:', order);
    alert(`Editar orden #${order.id}`);
  };

  const handleDelete = (order) => {
    console.log('Eliminar orden:', order);
    if (confirm(`¿Estás seguro de eliminar la orden #${order.id}?`)) {
      alert(`Orden #${order.id} eliminada`);
    }
  };

  // Obtener proveedores únicos
  const suppliers = ['all', ...new Set(orders.map(order => order.proveedor).filter(Boolean))];

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.id.toString().includes(searchLower) ||
      order.proveedor.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === 'all' || order.estado_entrega === selectedStatus;
    const matchesSupplier = selectedSupplier === 'all' || order.proveedor === selectedSupplier;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          {/* Título y botón exportar */}
          

          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado de Entrega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="En Tránsito">En Tránsito</SelectItem>
                <SelectItem value="Entregado">Entregado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Proveedor" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier === 'all' ? 'Todos los Proveedores' : supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md ">
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="text-foreground">ID</TableHead>
                <TableHead className="text-foreground">Proveedor</TableHead>
                <TableHead className="text-foreground">Fecha Emisión</TableHead>
                <TableHead className="text-foreground">Fecha Entrega</TableHead>
                <TableHead className="text-foreground text-center">Cant. Artículos</TableHead>
                <TableHead className="text-foreground">Estado Entrega</TableHead>
                <TableHead className="text-foreground text-right">Total</TableHead>
                <TableHead className="text-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="border-border hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">
                      #{order.id}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.proveedor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(order.fecha_emision)}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatDate(order.fecha_entrega)}
                    </TableCell>
                    <TableCell className="text-foreground text-center">
                      <span className="font-semibold">{order.cantidad_articulos}</span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.estado_entrega)}
                    </TableCell>
                    <TableCell className="text-foreground text-right font-mono">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(order)}
                          className="border-border hover:bg-muted"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(order)}
                          className="border-border hover:bg-muted"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(order)}
                          className="border-border hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-border">
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No hay órdenes de compra disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Footer con información */}
        <div className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredOrders.length} de {orders.length} órdenes de compra
        </div>
      </CardContent>

      {/* Modal para ver detalles de la orden */}
      <CardViewOrder 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        orderData={selectedOrder}
      />
    </Card>
  );
};

export default TableOrders;
