"use client";

import { useState, useEffect } from "react";
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
import { Eye, Pencil, Trash2, FileText, Search, Loader2 } from "lucide-react";
import CardViewOrder from "./CardViewOrder";
import CardEditOrder from "./CardEditOrder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { orderAPI } from "@/lib/api";

const TableOrders = () => {
  // Estados para filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  
  // Estados para los modales
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Estados para datos y carga
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getAllOrders();
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        setError("Error al cargar las órdenes");
      }
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setError("Error al cargar las órdenes. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary" className="bg-primary-300 hover:bg-primary-600">
            Pendiente
          </Badge>
        );
      case "In Transit":
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
            En Tránsito
          </Badge>
        );
      case "Delivered":
        return (
          <Badge variant="default" className="bg-primary-500 hover:bg-primary-600">
            Entregado
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge variant="destructive">
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Pendiente"}</Badge>;
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
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.order_id === updatedOrder.order_id ? updatedOrder : order
    ));
    loadOrders(); // Recargar para asegurar datos actualizados
  };

  const handleDelete = async (order) => {
    const confirmMessage = `¿Estás seguro de eliminar la orden #${order.order_id}?\n\nProveedor: ${order.supplier}\nTotal: $${order.total}\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      try {
        setLoading(true);
        const response = await orderAPI.deleteOrder(order.order_id);
        
        if (response.data && response.data.success) {
          setOrders(prev => prev.filter(o => o.order_id !== order.order_id));
          alert(`✅ Orden #${order.order_id} eliminada exitosamente`);
        } else {
          throw new Error(response.data?.message || "Error al eliminar la orden");
        }
      } catch (err) {
        console.error("Error eliminando orden:", err);
        
        if (err.response) {
          const status = err.response.status;
          const message = err.response.data?.message || 'Error del servidor';
          
          if (status === 404) {
            alert("❌ La orden no fue encontrada. Puede que ya haya sido eliminada.");
          } else if (status === 403) {
            alert("❌ No tienes permisos para eliminar esta orden.");
          } else {
            alert(`❌ Error ${status}: ${message}`);
          }
        } else {
          alert("❌ Error de conexión. Verifica tu conexión a internet.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Obtener proveedores únicos
  const suppliers = ['all', ...new Set(orders.map(order => order.supplier).filter(Boolean))];

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      order.order_id.toString().includes(searchLower) ||
      (order.supplier && order.supplier.toLowerCase().includes(searchLower));
    const matchesStatus = selectedStatus === 'all' || order.delivery_status === selectedStatus;
    const matchesSupplier = selectedSupplier === 'all' || order.supplier === selectedSupplier;
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
                <SelectItem value="Pending">Pendiente</SelectItem>
                <SelectItem value="In Transit">En Tránsito</SelectItem>
                <SelectItem value="Delivered">Entregado</SelectItem>
                <SelectItem value="Cancelled">Cancelado</SelectItem>
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
        <div className="rounded-md hidden md:block">
          <div className="w-full overflow-x-auto">
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
                {loading ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando órdenes...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className="border-border">
                    <TableCell colSpan={8} className="text-center py-8 text-destructive">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.order_id} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        #{order.order_id}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.supplier || "N/A"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(order.issue_date)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(order.delivery_date)}
                      </TableCell>
                      <TableCell className="text-foreground text-center">
                        <span className="font-semibold">{order.item_quantity || 0}</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.delivery_status)}
                      </TableCell>
                      <TableCell className="text-foreground text-right font-mono">
                        {formatCurrency(order.total || 0)}
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
        </div>

        {/* Vista móvil */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            <div className="text-center text-muted-foreground py-6">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Cargando órdenes...
            </div>
          ) : error ? (
            <p className="text-center text-destructive py-6">{error}</p>
          ) : filteredOrders && filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.order_id}
                className="border border-border rounded-lg p-4 bg-muted/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Orden</p>
                    <p className="text-xl font-semibold text-foreground">
                      #{order.order_id}
                    </p>
                  </div>
                  {getStatusBadge(order.delivery_status)}
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground">Proveedor</p>
                  <p className="font-medium">{order.supplier || "N/A"}</p>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Emisión</dt>
                    <dd className="font-medium">
                      {formatDate(order.issue_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Entrega</dt>
                    <dd className="font-medium">
                      {formatDate(order.delivery_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Artículos</dt>
                    <dd className="font-semibold">{order.item_quantity || 0}</dd>
                  </div>
                  <div className="text-right">
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-mono font-semibold">
                      {formatCurrency(order.total || 0)}
                    </dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleView(order)}
                  >
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(order)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(order)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">
              No hay órdenes de compra disponibles
            </p>
          )}
        </div>
        
        {/* Footer con información */}
        <p className="mt-4 text-sm text-muted-foreground">
          Mostrando {filteredOrders.length} de {orders.length} órdenes de compra
        </p>
      </CardContent>

      {/* Modal para ver detalles de la orden */}
      <CardViewOrder 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        orderData={selectedOrder}
      />

      {/* Modal para editar orden */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold">
              Editar Orden de Compra #{selectedOrder?.order_id}
            </DialogTitle>
          </DialogHeader>
          <CardEditOrder
            orderData={selectedOrder}
            onClose={() => setIsEditModalOpen(false)}
            onOrderUpdated={handleOrderUpdated}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TableOrders;
