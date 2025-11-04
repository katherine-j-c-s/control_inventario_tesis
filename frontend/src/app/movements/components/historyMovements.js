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
  Map
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();
  const [localHistory, setLocalHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredMovements, setFilteredMovements] = useState([]);

  // 30 días de retención del historial
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Cargar y sincronizar historial desde localStorage
  useEffect(() => {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem('movementsHistory')) || [];
    
    // Crear un objeto para evitar duplicados basado en el ID
    const historyMap = {};
    
    // Agregar movimientos almacenados primero
    stored.forEach(item => {
      if (now - item.timestamp < THIRTY_DAYS) {
        historyMap[item.id] = item;
      }
    });
    
    // Agregar nuevos movimientos
    movements.forEach(item => {
      const itemWithTimestamp = {
        ...item,
        timestamp: item.timestamp || Date.now()
      };
      if (now - itemWithTimestamp.timestamp < THIRTY_DAYS) {
        historyMap[item.id] = itemWithTimestamp;
      }
    });
    
    // Ordenar por fecha descendente y limitar a 200 registros
    const combined = Object.values(historyMap)
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

                  {/* Fila inferior: Usuario, fecha y botón de mapa */}
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
                    </div>
                  </div>

                  {/* Botón de visualizar en mapa */}
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/movements/visualizacion/${movement.id}`)}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Map className="h-3 w-3" />
                      Visualizar en Maps
                    </Button>
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
    </Card>
  );
};

export default HistoryMovements;
