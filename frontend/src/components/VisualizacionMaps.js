'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, History, Warehouse, Route } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useExternalAPIs } from '@/hooks/useExternalAPIs';

const VisualizacionMaps = ({ productId, product }) => {
  const router = useRouter();
  const { googleMapsLoaded } = useExternalAPIs();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [activeView, setActiveView] = useState('historial'); // 'actual', 'historial', 'almacenes'
  const [productMovements, setProductMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Datos reales de Neuquén, Argentina para el TP
  const mockData = {
    movements: [
      {
        id: 1,
        fecha: '2024-01-15',
        desde: 'Almacén Central',
        hasta: 'Almacén Norte',
        ubicacion_desde: { lat: -38.9516, lng: -68.0591 }, // Av. Argentina 1400, Neuquén
        ubicacion_hasta: { lat: -38.9450, lng: -68.0500 }, // Ruta 7 Km 8, Neuquén
        tipo: 'entrada'
      },
      {
        id: 2,
        fecha: '2024-01-20',
        desde: 'Almacén Norte',
        hasta: 'Almacén Sur',
        ubicacion_desde: { lat: -38.9450, lng: -68.0500 }, // Ruta 7 Km 8, Neuquén
        ubicacion_hasta: { lat: -38.9600, lng: -68.0700 }, // Av. Olascoaga 1200, Neuquén
        tipo: 'transferencia'
      },
      {
        id: 3,
        fecha: '2024-01-25',
        desde: 'Almacén Sur',
        hasta: 'Cliente Final',
        ubicacion_desde: { lat: -38.9600, lng: -68.0700 }, // Av. Olascoaga 1200, Neuquén
        ubicacion_hasta: { lat: -38.9550, lng: -68.0650 }, // Av. del Trabajador 800, Neuquén
        tipo: 'salida'
      }
    ],
    warehouses: [
      { id: 1, nombre: 'Almacén Central', lat: -38.9516, lng: -68.0591, capacidad: 1000 }, // Av. Argentina 1400
      { id: 2, nombre: 'Almacén Norte', lat: -38.9450, lng: -68.0500, capacidad: 800 }, // Ruta 7 Km 8
      { id: 3, nombre: 'Almacén Sur', lat: -38.9600, lng: -68.0700, capacidad: 600 } // Av. Olascoaga 1200
    ],
    currentLocation: { lat: -38.9550, lng: -68.0650, nombre: 'Cliente Final - Neuquén' }
  };

  useEffect(() => {
    // Simular carga de datos
    setProductMovements(mockData.movements);
    setWarehouses(mockData.warehouses);
    setCurrentLocation(mockData.currentLocation);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    if (!loading && mapRef.current && googleMapsLoaded) {
      initializeMap();
    }
  }, [loading, activeView, googleMapsLoaded]);

  const initializeMap = () => {
    if (window.google && window.google.maps && mapRef.current) {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 12,
        center: { lat: -34.6037, lng: -58.3816 },
        mapTypeId: 'roadmap'
      });
      setMap(mapInstance);
      renderMapContent();
    } else {
      console.log('Google Maps API no está disponible aún');
    }
  };

  const renderMapContent = () => {
    if (!map) return;

    // Limpiar marcadores anteriores
    const markers = document.querySelectorAll('.map-marker');
    markers.forEach(marker => marker.remove());

    switch (activeView) {
      case 'actual':
        renderCurrentLocation();
        break;
      case 'historial':
        renderMovementHistory();
        break;
      case 'almacenes':
        renderWarehouses();
        break;
    }
  };

  const renderCurrentLocation = () => {
    if (!currentLocation) return;

    const marker = new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: map,
      title: `Ubicación actual: ${currentLocation.nombre}`,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div>
          <h3>📍 Ubicación Actual</h3>
          <p><strong>Producto:</strong> ${product?.nombre || 'Producto'}</p>
          <p><strong>Ubicación:</strong> ${currentLocation.nombre}</p>
          <p><strong>Coordenadas:</strong> ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });

    map.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
    map.setZoom(15);
  };

  const renderMovementHistory = () => {
    if (!productMovements.length) return;

    const path = [];
    const markers = [];

    productMovements.forEach((movement, index) => {
      // Marcador de origen
      const originMarker = new window.google.maps.Marker({
        position: { lat: movement.ubicacion_desde.lat, lng: movement.ubicacion_desde.lng },
        map: map,
        title: `Desde: ${movement.desde}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
        }
      });

      // Marcador de destino
      const destMarker = new window.google.maps.Marker({
        position: { lat: movement.ubicacion_hasta.lat, lng: movement.ubicacion_hasta.lng },
        map: map,
        title: `Hasta: ${movement.hasta}`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });

      markers.push(originMarker, destMarker);
      path.push({ lat: movement.ubicacion_desde.lat, lng: movement.ubicacion_desde.lng });
      path.push({ lat: movement.ubicacion_hasta.lat, lng: movement.ubicacion_hasta.lng });

      // Línea de ruta
      const polyline = new window.google.maps.Polyline({
        path: [
          { lat: movement.ubicacion_desde.lat, lng: movement.ubicacion_desde.lng },
          { lat: movement.ubicacion_hasta.lat, lng: movement.ubicacion_hasta.lng }
        ],
        geodesic: true,
        strokeColor: '#4285F4',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map
      });

      // Info window para el movimiento
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>🔄 Movimiento ${index + 1}</h3>
            <p><strong>Fecha:</strong> ${movement.fecha}</p>
            <p><strong>Desde:</strong> ${movement.desde}</p>
            <p><strong>Hasta:</strong> ${movement.hasta}</p>
            <p><strong>Tipo:</strong> ${movement.tipo}</p>
          </div>
        `
      });

      originMarker.addListener('click', () => {
        infoWindow.open(map, originMarker);
      });
    });

    // Ajustar vista para mostrar toda la ruta
    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);
  };

  const renderWarehouses = () => {
    if (!warehouses.length) return;

    warehouses.forEach(warehouse => {
      const marker = new window.google.maps.Marker({
        position: { lat: warehouse.lat, lng: warehouse.lng },
        map: map,
        title: warehouse.nombre,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/warehouse.png'
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div>
            <h3>🏢 ${warehouse.nombre}</h3>
            <p><strong>Capacidad:</strong> ${warehouse.capacidad} productos</p>
            <p><strong>Coordenadas:</strong> ${warehouse.lat.toFixed(4)}, ${warehouse.lng.toFixed(4)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
    });

    // Ajustar vista para mostrar todos los almacenes
    const bounds = new window.google.maps.LatLngBounds();
    warehouses.forEach(warehouse => {
      bounds.extend({ lat: warehouse.lat, lng: warehouse.lng });
    });
    map.fitBounds(bounds);
  };

  const calculateTotalDistance = () => {
    if (!productMovements.length) return 0;
    
    let totalDistance = 0;
    productMovements.forEach(movement => {
      const distance = calculateDistance(
        movement.ubicacion_desde.lat,
        movement.ubicacion_desde.lng,
        movement.ubicacion_hasta.lat,
        movement.ubicacion_hasta.lng
      );
      totalDistance += distance;
    });
    
    return totalDistance.toFixed(2);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'actual':
        return {
          title: '📍 Ubicación Actual',
          description: 'Producto ubicado en Neuquén, Argentina',
          points: currentLocation ? 1 : 0,
          distance: 'Neuquén, Argentina'
        };
      case 'historial':
        return {
          title: '🔄 Historial de Movimientos',
          description: 'Ruta del producto por Neuquén, Argentina',
          points: productMovements.length * 2,
          distance: `${calculateTotalDistance()} km en Neuquén`
        };
      case 'almacenes':
        return {
          title: '🏢 Ubicaciones de Almacenes',
          description: 'Almacenes en Neuquén, Argentina',
          points: warehouses.length,
          distance: 'Neuquén, Argentina'
        };
      default:
        return { title: '', description: '', points: 0, distance: 'N/A' };
    }
  };

  const viewInfo = getViewDescription();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Visualización en Mapas</h1>
            <p className="text-sm text-muted-foreground">
              {product?.nombre || 'Producto'} - {product?.codigo || 'Sin código'}
            </p>
          </div>
        </div>
        
        {/* Botones de vista */}
        <div className="flex gap-2">
          <Button
            variant={activeView === 'actual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('actual')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Ubicación Actual
          </Button>
          <Button
            variant={activeView === 'historial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('historial')}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Historial
          </Button>
          <Button
            variant={activeView === 'almacenes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('almacenes')}
            className="flex items-center gap-2"
          >
            <Warehouse className="h-4 w-4" />
            Almacenes
          </Button>
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Cargando datos...</p>
            </div>
          </div>
        )}
        
        {!googleMapsLoaded && !loading && (
          <div className="absolute inset-0 bg-gray-100 flex flex-col">
            {/* Header del mapa */}
            <div className="bg-white border-b p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-800">Google Maps - Neuquén, Argentina</span>
              </div>
              <div className="text-xs text-gray-500">
                Modo Demo - Mapa Interactivo
              </div>
            </div>
            
            {/* Mapa de Google Maps embebido */}
            <div className="flex-1 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d-68.0591!3d-38.9516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzA1LjYiUyA2OMKwMDMnMzIuOCJX!5e0!3m2!1ses!2sar!4v1234567890&q=Av.+Argentina+1400,+Neuquén,+Argentina"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Neuquén, Argentina - Almacén Central"
              ></iframe>
              
              {/* Overlay con información de ubicaciones */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {activeView === 'actual' && '📍 Ubicación Actual'}
                  {activeView === 'historial' && '🔄 Historial de Movimientos'}
                  {activeView === 'almacenes' && '🏢 Ubicaciones de Almacenes'}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {activeView === 'actual' && 'Producto ubicado en Neuquén, Argentina'}
                  {activeView === 'historial' && 'Ruta del producto por Neuquén'}
                  {activeView === 'almacenes' && 'Almacenes en Neuquén, Argentina'}
                </p>
                
                {/* Lista de ubicaciones */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Almacén Central - Av. Argentina 1400</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Almacén Norte - Ruta 7 Km 8</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Almacén Sur - Av. Olascoaga 1200</span>
                  </div>
                </div>
              </div>

              {/* Botón de navegación */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <p className="text-sm text-gray-800 mb-2">
                  <strong>🗺️ Navega por Neuquén</strong>
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  Usa el mapa para explorar las ubicaciones reales
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d-68.0591!3d-38.9516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzA1LjYiUyA2OMKwMDMnMzIuOCJX!5e0!3m2!1ses!2sar!4v1234567890&q=Av.+Argentina+1400,+Neuquén,+Argentina';
                      }
                    }}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Central
                  </button>
                  <button 
                    onClick={() => {
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d-68.0500!3d-38.9450!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU2JzQyLjAiUyA2OMKwMDMnMDAuMCJX!5e0!3m2!1ses!2sar!4v1234567890&q=Ruta+7+Km+8,+Neuquén,+Argentina';
                      }
                    }}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Norte
                  </button>
                  <button 
                    onClick={() => {
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        iframe.src = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d-68.0700!3d-38.9600!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzM2LjAiUyA2OMKwMDQnMTIuMCJX!5e0!3m2!1ses!2sar!4v1234567890&q=Av.+Olascoaga+1200,+Neuquén,+Argentina';
                      }
                    }}
                    className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                  >
                    Sur
                  </button>
                </div>
              </div>

              {/* Información de configuración */}
              <div className="absolute bottom-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-sm">
                <p className="text-sm text-yellow-800 mb-1">
                  <strong>🗺️ Mapa Interactivo</strong>
                </p>
                <p className="text-xs text-yellow-600 mb-2">
                  Navega por Neuquén usando Google Maps embebido
                </p>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => {
                      window.open('https://www.google.com/maps/search/Av.+Argentina+1400,+Neuquén,+Argentina', '_blank');
                    }}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Abrir en Maps
                  </button>
                  <button 
                    onClick={() => {
                      window.open('https://www.google.com/maps/search/Ruta+7+Km+8,+Neuquén,+Argentina', '_blank');
                    }}
                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Ver Norte
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>TP:</strong> Demuestra integración con Google Maps
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Información del mapa */}
      <div className="bg-white border-t p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{viewInfo.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Descripción</p>
                <p>{viewInfo.description}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Puntos en el mapa</p>
                <p>{viewInfo.points}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Distancia total</p>
                <p>{viewInfo.distance}</p>
              </div>
            </div>
            
            {activeView === 'historial' && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Leyenda del mapa - Neuquén:</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Punto de origen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Punto de destino</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-blue-500"></div>
                    <span>Ruta del movimiento</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <strong>📍 Ubicaciones reales:</strong> Av. Argentina, Ruta 7, Av. Olascoaga - Neuquén, Argentina
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VisualizacionMaps;
