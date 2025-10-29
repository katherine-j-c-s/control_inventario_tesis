'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Trash2, 
  Search, 
  ArrowRightLeft, 
  Package, 
  MapPin,
  User,
  Calendar,
  Filter,
  Map as MapIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import MapComponent from '@/components/GoogleMap/MapComponent';
import { productAPI, receiptAPI } from '@/lib/api';
import { geocodeAddress } from '@/lib/geocoding';
import { getGoogleMapsApiKey } from '@/lib/env';

/**
 * Componente moderno de historial de movimientos de productos
 * 
 * Características:
 * - Persistencia en localStorage (últimos 30 días)
 * - Filtrado por tipo de movimiento, producto y fecha
 * - Búsqueda en tiempo real
 * - UI moderna con badges y colores
 * - Información detallada de cada movimiento
 */
const HistoryMovements = ({ movements = [] }) => {
  const [localHistory, setLocalHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [selectedMovement, setSelectedMovement] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [productLocation, setProductLocation] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);

  // 30 días de retención del historial
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Cargar y sincronizar historial desde localStorage
  useEffect(() => {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem('movementsHistory')) || [];
    
    // Crear un mapa para evitar duplicados basado en el ID
    const historyMap = new Map();
    
    // Agregar movimientos almacenados primero
    stored.forEach(item => {
      if (now - item.timestamp < THIRTY_DAYS) {
        historyMap.set(item.id, item);
      }
    });
    
    // Agregar nuevos movimientos
    movements.forEach(item => {
      const itemWithTimestamp = {
        ...item,
        timestamp: item.timestamp || Date.now()
      };
      if (now - itemWithTimestamp.timestamp < THIRTY_DAYS) {
        historyMap.set(item.id, itemWithTimestamp);
      }
    });
    
    // Ordenar por fecha descendente y limitar a 200 registros
    const combined = Array.from(historyMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 200);

    // Guardar en localStorage
    localStorage.setItem('movementsHistory', JSON.stringify(combined));
    setLocalHistory(combined);
  }, [movements]);

  // Filtrar movimientos según búsqueda y tipo
  useEffect(() => {
    let filtered = localHistory;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(movement => movement.tipo === filterType);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(movement =>
        movement.producto?.toLowerCase().includes(search) ||
        movement.origen?.toLowerCase().includes(search) ||
        movement.destino?.toLowerCase().includes(search) ||
        movement.usuario?.toLowerCase().includes(search)
      );
    }

    setFilteredMovements(filtered);
  }, [localHistory, searchTerm, filterType]);

  // Formatear fecha y hora
  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date(timestamp));
  };

  // Formatear fecha relativa (hace X tiempo)
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  // Obtener color del badge según tipo de movimiento
  const getMovementBadge = (tipo) => {
    const badges = {
      'entrada': { variant: 'default', label: 'Entrada', color: 'bg-green-500' },
      'salida': { variant: 'destructive', label: 'Salida', color: 'bg-red-500' },
      'transferencia': { variant: 'secondary', label: 'Transferencia', color: 'bg-blue-500' },
      'ajuste': { variant: 'outline', label: 'Ajuste', color: 'bg-yellow-500' }
    };
    return badges[tipo] || { variant: 'outline', label: tipo, color: 'bg-gray-500' };
  };

  // Limpiar historial
  const clearHistory = () => {
    if (confirm('¿Está seguro de que desea limpiar todo el historial?')) {
      localStorage.removeItem('movementsHistory');
      setLocalHistory([]);
    }
  };

  // Abrir modal del mapa para un movimiento específico
  const handleViewMap = async (movement) => {
    setSelectedMovement(movement);
    setIsMapModalOpen(true);
    setLoadingMap(true);
    setProductLocation(null);

    try {
      // Cargar almacenes
      const warehousesResponse = await receiptAPI.getWarehouses();
      const warehousesData = warehousesResponse.data || [];
      setWarehouses(warehousesData);

      // Intentar obtener información del producto basado en el movimiento
      // Buscar producto por código o nombre
      if (movement.codigoProducto || movement.producto) {
        try {
          const productsResponse = await productAPI.getAllProducts();
          const allProducts = productsResponse.data || [];
          
          // Buscar producto por código primero, luego por nombre
          let product = null;
          if (movement.codigoProducto) {
            product = allProducts.find(p => p.codigo === movement.codigoProducto);
          }
          if (!product && movement.producto) {
            product = allProducts.find(p => 
              p.nombre?.toLowerCase().includes(movement.producto?.toLowerCase()) ||
              p.codigo?.toLowerCase().includes(movement.producto?.toLowerCase())
            );
          }

          if (product) {
            // Usar directamente el atributo ubicacion del producto (prioridad)
            const productUbicacion = product.ubicacion;
            console.log('HistoryMovements: Producto encontrado', {
              product,
              productUbicacion,
              movement,
            });
            
            if (productUbicacion) {
              console.log('HistoryMovements: Producto tiene ubicación:', productUbicacion);
              // Primero intentar encontrar un almacén que coincida exactamente o parcialmente
              const matchingWarehouse = warehousesData.find(w => {
                const ubicacionLower = productUbicacion.toLowerCase().trim();
                return (
                  w.name?.toLowerCase().trim() === ubicacionLower ||
                  w.location?.toLowerCase().trim() === ubicacionLower ||
                  w.address_sector?.toLowerCase().trim() === ubicacionLower ||
                  w.name?.toLowerCase().includes(ubicacionLower) ||
                  w.location?.toLowerCase().includes(ubicacionLower) ||
                  w.address_sector?.toLowerCase().includes(ubicacionLower)
                );
              });

              if (matchingWarehouse && matchingWarehouse.latitude && matchingWarehouse.longitude) {
                // Si encontramos un almacén con coordenadas, usarlas
                const locationData = {
                  lat: matchingWarehouse.latitude,
                  lng: matchingWarehouse.longitude,
                  nombre: product.nombre || movement.producto,
                  direccion: matchingWarehouse.location || matchingWarehouse.address || matchingWarehouse.address_sector || productUbicacion,
                };
                console.log('HistoryMovements: Almacén coincidente encontrado, estableciendo ubicación del producto', locationData);
                setProductLocation(locationData);
              } else {
                // Si no encontramos almacén, intentar geocodificar la ubicación del producto
                const apiKey = getGoogleMapsApiKey();
                if (apiKey && apiKey !== '' && apiKey !== 'undefined') {
                  const coords = await geocodeAddress(productUbicacion, apiKey);
                  if (coords) {
                    const locationData = {
                      ...coords,
                      nombre: product.nombre || movement.producto,
                      direccion: productUbicacion,
                    };
                    console.log('HistoryMovements: Geocodificación exitosa, estableciendo ubicación del producto', locationData);
                    setProductLocation(locationData);
                  } else {
                    console.warn('HistoryMovements: No se pudo geocodificar la ubicación del producto:', productUbicacion);
                  }
                } else {
                  console.warn('API Key de Google Maps no disponible para geocodificar');
                }
              }
            } else {
              // Fallback: si el producto no tiene ubicacion, usar origen o destino del movimiento
              const fallbackUbicacion = movement.origen || movement.destino;
              if (fallbackUbicacion) {
                const matchingWarehouse = warehousesData.find(w => 
                  w.name?.toLowerCase().includes(fallbackUbicacion.toLowerCase()) ||
                  w.location?.toLowerCase().includes(fallbackUbicacion.toLowerCase())
                );

                if (matchingWarehouse && matchingWarehouse.latitude && matchingWarehouse.longitude) {
                  setProductLocation({
                    lat: matchingWarehouse.latitude,
                    lng: matchingWarehouse.longitude,
                    nombre: product.nombre || movement.producto,
                    direccion: matchingWarehouse.location || fallbackUbicacion,
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('HistoryMovements: Error obteniendo información del producto:', error);
        }
      } else {
        console.log('HistoryMovements: No se encontró producto para el movimiento', {
          codigoProducto: movement.codigoProducto,
          producto: movement.producto,
        });
      }

      // Si no se encontró ubicación específica del producto, usar origen o destino
      if (!productLocation && (movement.origen || movement.destino)) {
        const ubicacion = movement.origen || movement.destino;
        const matchingWarehouse = warehousesData.find(w => 
          w.name?.toLowerCase().includes(ubicacion.toLowerCase()) ||
          w.location?.toLowerCase().includes(ubicacion.toLowerCase())
        );

        if (matchingWarehouse && matchingWarehouse.latitude && matchingWarehouse.longitude) {
          setProductLocation({
            lat: matchingWarehouse.latitude,
            lng: matchingWarehouse.longitude,
            nombre: movement.producto || 'Ubicación del movimiento',
            direccion: matchingWarehouse.location || ubicacion,
          });
        }
      }
    } catch (error) {
      console.error('Error cargando datos del mapa:', error);
    } finally {
      setLoadingMap(false);
      console.log('HistoryMovements: Finalizando carga del mapa', {
        productLocation,
        warehousesCount: warehouses.length,
      });
    }
  };

  // Cerrar modal del mapa
  const handleCloseMapModal = () => {
    setIsMapModalOpen(false);
    setSelectedMovement(null);
    setProductLocation(null);
  };

  if (localHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Movimientos
          </CardTitle>
          <CardDescription>No hay movimientos registrados</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Header con título y botón limpiar */}
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Movimientos
              </CardTitle>
              <CardDescription>
                {filteredMovements.length} movimiento{filteredMovements.length !== 1 ? 's' : ''} registrado{filteredMovements.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearHistory}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto, ubicación o usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="salida">Salida</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="ajuste">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {filteredMovements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No se encontraron movimientos con los filtros aplicados</p>
            </div>
          ) : (
            filteredMovements.map((movement) => {
              const badge = getMovementBadge(movement.tipo);
              
              return (
                <div 
                  key={movement.id || movement.timestamp} 
                  className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors border border-border"
                >
                  {/* Fila superior: Producto y badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Package className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {movement.producto || 'Producto sin nombre'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cantidad: <span className="font-medium">{movement.cantidad || 0}</span>
                        </p>
                      </div>
                    </div>
                    <Badge variant={badge.variant} className="flex-shrink-0">
                      {badge.label}
                    </Badge>
                  </div>

                  {/* Fila media: Origen y destino */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{movement.origen || 'N/A'}</span>
                    <ArrowRightLeft className="h-3 w-3" />
                    <span className="font-medium">{movement.destino || 'N/A'}</span>
                  </div>

                  {/* Fila inferior: Usuario, fecha y botón mapa */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{movement.usuario || 'Usuario desconocido'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span title={formatTimestamp(movement.timestamp)}>
                          {getRelativeTime(movement.timestamp)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleViewMap(movement)}
                      >
                        <MapIcon className="h-3 w-3 mr-1" />
                        Ver en Mapa
                      </Button>
                    </div>
                  </div>

                  {/* Observaciones si existen */}
                  {movement.observaciones && (
                    <div className="text-xs text-muted-foreground italic pt-1 border-t border-border/50">
                      {movement.observaciones}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Modal del Mapa */}
      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Mapa de Ubicación - {selectedMovement?.producto || 'Producto'}
            </DialogTitle>
            <DialogDescription>
              Visualización de la ubicación actual del producto y almacenes disponibles
            </DialogDescription>
          </DialogHeader>
          {loadingMap ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <MapComponent
              productLocation={productLocation}
              warehouses={warehouses}
              apiKey={getGoogleMapsApiKey()}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HistoryMovements;
