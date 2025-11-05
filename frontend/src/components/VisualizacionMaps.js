'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Warehouse } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useExternalAPIs } from '@/hooks/useExternalAPIs';
import Layout from '@/components/layouts/Layout';
import api from '@/lib/api';

const VisualizacionMaps = ({ productId, product, movement }) => {
  const router = useRouter();
  const { googleMapsLoaded } = useExternalAPIs();
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [activeView, setActiveView] = useState('actual'); // 'actual', 'almacenes'
  const [warehouses, setWarehouses] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentWarehouseName, setCurrentWarehouseName] = useState(null); // Nombre del almacén donde está el producto
  const [selectedWarehouse, setSelectedWarehouse] = useState(null); // Almacén seleccionado en la vista de almacenes
  const [loading, setLoading] = useState(true);
  
  // Referencias para los marcadores (mejores prácticas de Google Maps API)
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);

  // Función helper para obtener estilos de InfoWindow según el tema
  const getInfoWindowStyles = () => {
    // Detectar si está en modo oscuro
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
      // Estilos para modo oscuro (basados en globals.css)
      return {
        container: 'background-color: hsl(230, 15%, 12%) !important; color: hsl(200, 100%, 96%) !important; padding: 12px !important; min-width: 220px !important; border-radius: 8px !important; font-family: system-ui, -apple-system, sans-serif !important; margin: 0 !important;',
        title: 'margin: 0 0 10px 0 !important; font-size: 16px !important; font-weight: 600 !important; color: hsl(200, 100%, 96%) !important;',
        text: 'margin: 6px 0 !important; font-size: 14px !important; color: hsl(200, 100%, 85%) !important; line-height: 1.5 !important;',
        strong: 'color: hsl(200, 100%, 96%) !important; font-weight: 600 !important;',
        coordinates: 'margin: 6px 0 !important; font-size: 12px !important; color: hsl(200, 100%, 75%) !important; font-family: monospace !important; background-color: hsl(230, 15%, 20%) !important; padding: 4px 8px !important; border-radius: 4px !important; display: inline-block !important;'
      };
    } else {
      // Estilos para modo claro (basados en globals.css)
      return {
        container: 'background-color: hsl(0, 0%, 100%) !important; color: hsl(230, 20%, 15%) !important; padding: 12px !important; min-width: 220px !important; border-radius: 8px !important; font-family: system-ui, -apple-system, sans-serif !important; margin: 0 !important;',
        title: 'margin: 0 0 10px 0 !important; font-size: 16px !important; font-weight: 600 !important; color: hsl(230, 20%, 15%) !important;',
        text: 'margin: 6px 0 !important; font-size: 14px !important; color: hsl(230, 20%, 25%) !important; line-height: 1.5 !important;',
        strong: 'color: hsl(230, 20%, 15%) !important; font-weight: 600 !important;',
        coordinates: 'margin: 6px 0 !important; font-size: 12px !important; color: hsl(230, 10%, 40%) !important; font-family: monospace !important; background-color: hsl(230, 15%, 92%) !important; padding: 4px 8px !important; border-radius: 4px !important; display: inline-block !important;'
      };
    }
  };

  // Mapeo de direcciones a coordenadas (fallback si no hay coordenadas en BD)
  const locationMap = {
    'Av. Argentina 1400, Neuquén, Neuquén, Argentina': { lat: -38.9516, lng: -68.0591, nombre: 'Av. Argentina 1400' },
    'Ruta 7 Km 8, Neuquén, Neuquén, Argentina': { lat: -38.9450, lng: -68.0500, nombre: 'Ruta 7 Km 8' },
    'Av. Olascoaga 1200, Neuquén, Neuquén, Argentina': { lat: -38.9600, lng: -68.0700, nombre: 'Av. Olascoaga 1200' },
    'Av. del Trabajador 800, Neuquén, Neuquén, Argentina': { lat: -38.9550, lng: -68.0650, nombre: 'Av. del Trabajador 800' },
    'Av. San Martín 2000, Neuquén, Neuquén, Argentina': { lat: -38.9580, lng: -68.0600, nombre: 'Av. San Martín 2000' }
  };

  // Obtener ubicación actual del movimiento desde la base de datos
  // ubicacion_actual es el nombre del almacén, necesitamos buscar su location
  const getCurrentProductLocation = (warehousesList) => {
    // Prioridad 1: Usar ubicacion_actual del movimiento (nombre del almacén)
    const movementLocationName = movement?.ubicacion_actual;
    
    if (movementLocationName && warehousesList && warehousesList.length > 0) {
      // Buscar el almacén por nombre
      const warehouse = warehousesList.find(w => w.nombre === movementLocationName);
      
      if (warehouse) {
        // Guardar el nombre del almacén para mostrarlo en la descripción
        setCurrentWarehouseName(movementLocationName);
        
        // Si tiene coordenadas directas, usarlas
        if (warehouse.lat && warehouse.lng) {
          return {
            lat: warehouse.lat,
            lng: warehouse.lng,
            nombre: warehouse.address || warehouse.location || movementLocationName
          };
        }
        
        // Buscar en el mapeo usando el address del almacén (para Google Maps)
        const address = warehouse.direccion || warehouse.address || ''; // address es para coordenadas
        const mappedLocation = locationMap[address];
        if (mappedLocation) {
          return {
            ...mappedLocation,
            nombre: address
          };
        }
        
        // Si no hay mapeo ni coordenadas, usar coordenadas por defecto
        return {
          lat: -38.9516,
          lng: -68.0591,
          nombre: address || movementLocationName
        };
      }
    }
    
    // Si no se encontró el almacén, limpiar el nombre
    setCurrentWarehouseName(null);
    
    // Fallback: Si no hay ubicacion_actual en el movimiento, usar product.ubicacion
    if (product?.ubicacion) {
      const mappedLocation = locationMap[product.ubicacion];
      if (mappedLocation) {
        return mappedLocation;
      }
      return {
        lat: -38.9516,
        lng: -68.0591,
        nombre: product.ubicacion
      };
    }
    
    // Último fallback
    return { lat: -38.9516, lng: -68.0591, nombre: 'Ubicación no especificada' };
  };

  useEffect(() => {
    // Cargar datos de almacenes desde la API
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar almacenes desde la API
        const warehousesResponse = await api.get('/warehouses');
        const warehousesFromAPI = warehousesResponse.data || [];
        
        // Convertir almacenes de la API al formato que necesita el mapa
        // Usar address para Google Maps y coordenadas si están disponibles
        const warehousesWithCoords = warehousesFromAPI.map(warehouse => {
          // Prioridad 1: Usar coordenadas de la base de datos
          if (warehouse.latitude && warehouse.longitude) {
            return {
              id: warehouse.id,
              nombre: warehouse.name,
              lat: parseFloat(warehouse.latitude),
              lng: parseFloat(warehouse.longitude),
              capacidad: warehouse.capacity || 0,
              direccion: warehouse.address || '', // address es para Google Maps
              location: warehouse.location || '' // location es para mostrar
            };
          }
          
          // Prioridad 2: Buscar en el mapeo de direcciones usando address
          const address = warehouse.address || '';
          const coords = locationMap[address];
          
          if (coords) {
            return {
              id: warehouse.id,
              nombre: warehouse.name,
              lat: coords.lat,
              lng: coords.lng,
              capacidad: warehouse.capacity || 0,
              direccion: address,
              location: warehouse.location || ''
            };
          }
          
          // Prioridad 3: Fallback a coordenadas por defecto
          return {
            id: warehouse.id,
            nombre: warehouse.name,
            lat: -38.9516,
            lng: -68.0591,
            capacidad: warehouse.capacity || 0,
            direccion: address,
            location: warehouse.location || ''
          };
        });
        
        // Eliminar duplicados por ID para evitar almacenes repetidos
        const uniqueWarehouses = warehousesWithCoords.reduce((acc, warehouse) => {
          // Verificar si ya existe un almacén con el mismo ID
          if (!acc.find(w => w.id === warehouse.id)) {
            acc.push(warehouse);
          }
          return acc;
        }, []);
        
        setWarehouses(uniqueWarehouses);
        // Pasar la lista de almacenes para buscar el almacén por nombre
        setCurrentLocation(getCurrentProductLocation(warehousesWithCoords));
      } catch (error) {
        console.error('Error cargando datos:', error);
        // Si falla la API, dejar warehouses vacío y solo mostrar la ubicación del movimiento
        setWarehouses([]);
        setCurrentLocation(getCurrentProductLocation([]));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [productId, product, movement]);

  useEffect(() => {
    if (!loading && mapRef.current && googleMapsLoaded && !map) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, googleMapsLoaded, map]);

  useEffect(() => {
    // Solo renderizar si el mapa es una instancia válida y hay datos
    if (map && window.google && window.google.maps && (map instanceof window.google.maps.Map) && currentLocation) {
      // Pequeño delay para asegurar que el mapa esté completamente inicializado
      const timer = setTimeout(() => {
        renderMapContent();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [map, activeView, currentLocation, warehouses, selectedWarehouse]);

  // Limpiar marcadores cuando el componente se desmonte
  useEffect(() => {
    return () => {
      clearMarkers();
    };
  }, []);

  const initializeMap = () => {
    if (window.google && window.google.maps && mapRef.current && !map) {
      try {
        // Configuración del mapa según mejores prácticas de Google Maps JavaScript API
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          zoom: 11, // Zoom más amplio para ver Neuquén completo
          center: { lat: -38.9516, lng: -68.0591 }, // Centro en Neuquén Capital
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false, // Mostrar controles por defecto
          zoomControl: true,
          mapTypeControl: true,
          scaleControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          gestureHandling: 'cooperative', // Requiere Ctrl+scroll para hacer zoom
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        
        // Verificar que la instancia sea válida antes de guardarla
        if (mapInstance instanceof window.google.maps.Map) {
          setMap(mapInstance);
          
          // Agregar listener para cuando el mapa esté completamente cargado
          window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
            console.log('Mapa de Google Maps inicializado correctamente');
          });
        } else {
          console.error('Error: La instancia del mapa no es válida');
        }
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
      }
    } else if (!window.google || !window.google.maps) {
      console.warn('Google Maps API no está disponible aún');
    }
  };

  const renderMapContent = () => {
    // Verificar que el mapa sea una instancia válida de Google Maps
    if (!map || !window.google || !window.google.maps || !(map instanceof window.google.maps.Map)) {
      return;
    }
    
    if (!currentLocation) return;

    // Limpiar marcadores anteriores correctamente (mejores prácticas de Google Maps API)
    clearMarkers();

    switch (activeView) {
      case 'actual':
        renderCurrentLocation();
        break;
      case 'almacenes':
        renderWarehouses();
        break;
    }
  };

  // Función para limpiar todos los marcadores correctamente
  const clearMarkers = () => {
    // Eliminar todos los marcadores del mapa
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
    
    // Cerrar todas las ventanas de información
    infoWindowsRef.current.forEach(infoWindow => {
      infoWindow.close();
    });
    infoWindowsRef.current = [];
  };

  const renderCurrentLocation = () => {
    // Verificar que el mapa sea una instancia válida
    if (!currentLocation || !map || !window.google || !window.google.maps || !(map instanceof window.google.maps.Map)) {
      return;
    }

    // Crear marcador con mejor práctica de Google Maps API
    const marker = new window.google.maps.Marker({
      position: { lat: currentLocation.lat, lng: currentLocation.lng },
      map: map,
      title: `Ubicación actual: ${currentLocation.nombre}`,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
      },
      label: {
        text: '📍',
        fontSize: '20px',
        fontWeight: 'bold'
      },
      animation: window.google.maps.Animation.DROP // Animación al aparecer
    });

    // Guardar referencia al marcador
    markersRef.current.push(marker);

    // Mantener el mapa centrado en Neuquén pero asegurar que el marcador esté visible
    map.setCenter({ lat: -38.9516, lng: -68.0591 }); // Centro en Neuquén
    map.setZoom(11); // Zoom que muestra Neuquén completo
  };

  const renderWarehouses = () => {
    // Verificar que el mapa sea una instancia válida
    if (!warehouses.length || !map || !window.google || !window.google.maps || !(map instanceof window.google.maps.Map)) {
      return;
    }

    // Si hay un almacén seleccionado, mostrar solo ese, sino mostrar todos
    // NO incluir la ubicación actual en la vista de almacenes
    const warehousesToShow = selectedWarehouse 
      ? warehouses.filter(w => w.id === selectedWarehouse.id)
      : warehouses;

    // Crear marcadores para cada almacén
    warehousesToShow.forEach((warehouse, index) => {
      // Asegurar que zIndex sea siempre un número válido
      const zIndexValue = typeof warehouse.id === 'number' ? warehouse.id : (index + 1);
      
      // Crear marcador con mejor práctica de Google Maps API
      const marker = new window.google.maps.Marker({
        position: { lat: warehouse.lat, lng: warehouse.lng },
        map: map,
        title: warehouse.nombre,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32)
        },
        label: {
          text: warehouse.isCurrent ? '📍' : '🏢',
          fontSize: warehouse.isCurrent ? '20px' : '18px',
          fontWeight: 'bold'
        },
        animation: window.google.maps.Animation.DROP, // Animación al aparecer
        zIndex: zIndexValue // Asegurar que sea un número válido
      });

      // Guardar referencia al marcador
      markersRef.current.push(marker);

      // Obtener estilos según el tema
      const styles = getInfoWindowStyles();
      
      // Crear ventana de información con estilos adaptativos
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="${styles.container}">
            <h3 style="${styles.title}">🏢 ${warehouse.nombre}</h3>
            <p style="${styles.text}"><span style="${styles.strong}">Capacidad:</span> ${warehouse.capacidad || 0} productos</p>
            ${warehouse.direccion ? `<p style="${styles.text}"><span style="${styles.strong}">Dirección:</span> ${warehouse.direccion}</p>` : ''}
            ${warehouse.location ? `<p style="${styles.text}"><span style="${styles.strong}">Ubicación:</span> ${warehouse.location}</p>` : ''}
            <p style="${styles.coordinates}">
              <span style="${styles.strong}">Coordenadas:</span> ${warehouse.lat.toFixed(6)}, ${warehouse.lng.toFixed(6)}
            </p>
          </div>
        `
      });

      // Guardar referencia a la ventana de información
      infoWindowsRef.current.push(infoWindow);

      // Agregar listener para clic en el marcador
      marker.addListener('click', () => {
        // Cerrar otras ventanas de información antes de abrir esta
        infoWindowsRef.current.forEach(iw => {
          if (iw !== infoWindow) iw.close();
        });
        infoWindow.open(map, marker);
      });

      // Si este es el almacén seleccionado, destacarlo
      if (selectedWarehouse && warehouse.id === selectedWarehouse.id) {
        marker.setIcon({
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 40)
        });
        marker.setZIndex(1000); // Asegurar que esté por encima
        // Abrir automáticamente la ventana de información del almacén seleccionado
        infoWindow.open(map, marker);
      }
    });

    // Ajustar vista para mostrar los almacenes visibles
    const bounds = new window.google.maps.LatLngBounds();
    warehousesToShow.forEach(warehouse => {
      bounds.extend({ lat: warehouse.lat, lng: warehouse.lng });
    });
    // Ajustar vista pero con padding para ver Neuquén completo
    if (warehousesToShow.length > 0) {
      map.fitBounds(bounds, { padding: 50 });
    } else {
      // Si no hay almacenes, centrar en Neuquén
      map.setCenter({ lat: -38.9516, lng: -68.0591 });
      map.setZoom(11);
    }
  };

  const getViewDescription = () => {
    switch (activeView) {
      case 'actual':
        return {
          title: '📍 Ubicación Actual',
          description: currentWarehouseName 
            ? `Producto ubicado en ${currentWarehouseName}, Neuquén, Argentina`
            : 'Producto ubicado en Neuquén, Argentina',
          points: currentLocation ? 1 : 0,
          distance: 'Neuquén, Argentina'
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

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 w-full max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Visualización en Mapas</h1>
              <p className="mt-1 text-muted-foreground">
                Rastrea la ubicación y movimientos de {product?.nombre || 'productos'} en tiempo real.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/movements')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Botones de vista */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={activeView === 'actual' ? 'default' : 'outline'}
                  onClick={() => setActiveView('actual')}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Ubicación Actual
                </Button>
                <Button
                  variant={activeView === 'almacenes' ? 'default' : 'outline'}
                  onClick={() => setActiveView('almacenes')}
                  className="flex items-center gap-2"
                >
                  <Warehouse className="h-4 w-4" />
                  Almacenes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >

          {/* Mapa */}
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                {viewInfo.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="h-96 relative w-full" style={{ isolation: 'isolate', maxWidth: '100%' }}>
                <div ref={mapRef} className="w-full h-full" style={{ maxWidth: '100%' }} />
                
                {!googleMapsLoaded && !loading && (
                  <div className="absolute inset-0 bg-muted/50 flex flex-col" style={{ zIndex: 1 }}>
                    {/* Mapa de Google Maps embebido */}
                    <div className="flex-1 relative w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d-68.0591!3d-38.9516!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzA1LjYiUyA2OMKwMDMnMzIuOCJX!5e0!3m2!1ses!2sar!4v1234567890&q=Av.+Argentina+1400,+Neuquén,+Argentina"
                        width="100%"
                        height="100%"
                        style={{ border: 0, zIndex: 1, maxWidth: '100%' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa de Neuquén, Argentina - Almacén Central"
                      ></iframe>
                      
                      {/* Overlay con información de ubicaciones */}
                      <div className="absolute top-4 left-4 bg-card/95 dark:bg-card/98 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm border border-border">
                        <h4 className="font-semibold mb-2 text-card-foreground">
                          {activeView === 'actual' && '📍 Ubicación Actual'}
                          {activeView === 'almacenes' && '🏢 Ubicaciones de Almacenes'}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {activeView === 'actual' && (
                            currentWarehouseName 
                              ? `Producto ubicado en ${currentWarehouseName}, Neuquén, Argentina`
                              : 'Producto ubicado en Neuquén, Argentina'
                          )}
                          {activeView === 'almacenes' && 'Almacenes en Neuquén, Argentina'}
                        </p>
                        
                        {/* Lista de ubicaciones - Datos reales de la BD */}
                        <div className="space-y-2">
                          {warehouses.length > 0 ? (
                            warehouses.map((warehouse, index) => {
                              const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'];
                              const color = colors[index % colors.length];
                              return (
                                <div key={warehouse.id} className="flex items-center gap-2 text-sm">
                                  <div className={`w-3 h-3 ${color} rounded-full`}></div>
                                  <span className="text-card-foreground">
                                    {warehouse.nombre} {warehouse.location ? `- ${warehouse.location}` : ''}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Cargando almacenes...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de navegación para almacenes - Solo mostrar cuando activeView === 'almacenes' */}
                      {activeView === 'almacenes' && warehouses.length > 0 && (
                        <div className="absolute bottom-4 right-4 bg-card/95 dark:bg-card/98 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
                          <p className="text-sm mb-2 text-card-foreground">
                            <strong>🗺️ Navega por Neuquén</strong>
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Explora las ubicaciones de los almacenes
                          </p>
                          <div className="flex flex-col gap-2">
                            {warehouses.map((warehouse, index) => {
                              const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'];
                              const color = colors[index % colors.length];
                              // Construir URL del mapa usando address del almacén (para Google Maps)
                              const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3104.5!2d${warehouse.lng}!3d${warehouse.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDU3JzA1LjYiUyA2OMKwMDMnMzIuOCJX!5e0!3m2!1ses!2sar!4v1234567890&q=${encodeURIComponent(warehouse.direccion || warehouse.address || warehouse.nombre)}`;
                              
                              return (
                                <button 
                                  key={warehouse.id}
                                  onClick={() => {
                                    const iframe = document.querySelector('iframe');
                                    if (iframe) {
                                      iframe.src = mapUrl;
                                    }
                                  }}
                                  className={`px-3 py-1 ${color} text-white text-xs rounded hover:opacity-90`}
                                >
                                  🏢 {warehouse.nombre}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Información de configuración */}
                      <div className="absolute bottom-4 left-4 bg-card/95 dark:bg-card/98 backdrop-blur-sm border border-border rounded-lg p-3 max-w-sm">
                        <p className="text-sm mb-1 text-card-foreground">
                          <strong>🗺️ Mapa Interactivo</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Navega por Neuquén usando Google Maps embebido
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => {
                              window.open('https://www.google.com/maps/search/Av.+Argentina+1400,+Neuquén,+Argentina', '_blank');
                            }}
                            className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
                          >
                            Abrir en Maps
                          </button>
                        </div>
                        <p className="text-xs text-primary mt-2">
                          <strong>TP:</strong> Demuestra integración con Google Maps
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Botones de selección de almacenes - Debajo del mapa */}
          {activeView === 'almacenes' && (
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Warehouse className="h-5 w-5 text-primary" />
                  Seleccionar Almacén
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  {warehouses.map((warehouse) => (
                    <Button
                      key={`warehouse-${warehouse.id}`}
                      variant={selectedWarehouse?.id === warehouse.id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedWarehouse(selectedWarehouse?.id === warehouse.id ? null : warehouse);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Warehouse className="h-4 w-4" />
                      {warehouse.nombre}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default VisualizacionMaps;
