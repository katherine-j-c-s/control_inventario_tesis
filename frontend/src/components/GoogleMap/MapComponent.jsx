'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Package, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGoogleMapsApiKey } from '@/lib/env';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
};

const defaultCenter = {
  lat: -34.603722,
  lng: -58.381592,
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  scaleControl: true,
  fullscreenControl: true,
};

/**
 * Componente de mapa de Google Maps para visualizar ubicaciones de productos y almacenes
 * 
 * @param {Object} props
 * @param {Object} props.productLocation - Ubicación actual del producto {lat, lng, nombre, direccion}
 * @param {Array} props.warehouses - Array de almacenes con coordenadas
 * @param {String} props.apiKey - API Key de Google Maps
 */
const MapComponent = ({ productLocation, warehouses = [], apiKey }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapError, setMapError] = useState(null);
  
  // Función helper para verificar si Google Maps ya está cargado
  const checkGoogleMapsLoadedHelper = () => {
    if (typeof window !== 'undefined') {
      // Verificar si el objeto google.maps existe
      if (window.google && window.google.maps) {
        return true;
      }
      // También verificar si el script de Google Maps ya está en el DOM
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      if (scripts.length > 0) {
        // El script está cargado, pero google.maps aún no está disponible
        return false; // Retornar false para permitir que el efecto lo detecte
      }
    }
    return false;
  };
  
  // Verificar si Google Maps ya está cargado inmediatamente (antes de renderizar)
  const checkGoogleMapsLoaded = useCallback(() => {
    return checkGoogleMapsLoadedHelper();
  }, []);
  
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(() => {
    const loaded = checkGoogleMapsLoadedHelper();
    // Si no está cargado, verificar si el script ya existe en el DOM
    if (!loaded && typeof window !== 'undefined') {
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      // Si el script existe pero google.maps no está disponible, asumir que está cargando
      // y no intentar cargar nuevamente
      return scripts.length > 0;
    }
    return loaded;
  });
  
  // Estado para controlar qué se muestra en el mapa (por defecto: producto primero si está disponible)
  const [showProduct, setShowProduct] = useState(() => {
    // Inicializar con true si productLocation ya está disponible al montar
    return !!(productLocation?.lat && productLocation?.lng);
  });
  const [showWarehouses, setShowWarehouses] = useState(false);
  
  // Verificar si Google Maps se carga después del montaje
  useEffect(() => {
    if (isGoogleMapsLoaded) {
      return; // Ya está cargado, no hacer nada
    }

    // Si no está cargado, verificar periódicamente
    const checkInterval = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        setIsGoogleMapsLoaded(true);
        clearInterval(checkInterval);
      }
    }, 200);

    // Limpiar intervalo después de 5 segundos
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [isGoogleMapsLoaded]);

  // Efecto para mostrar el producto por defecto cuando se carga productLocation
  useEffect(() => {
    if (productLocation?.lat && productLocation?.lng) {
      // Siempre mostrar el producto por defecto cuando esté disponible
      console.log('MapComponent: Mostrando producto en el mapa', {
        productLocation,
        lat: productLocation.lat,
        lng: productLocation.lng,
      });
      setShowProduct(true);
    } else if (!productLocation || (!productLocation.lat && !productLocation.lng)) {
      // Si no hay ubicación del producto, ocultarlo
      console.log('MapComponent: No hay ubicación del producto disponible', { productLocation });
      setShowProduct(false);
    }
  }, [productLocation]);

  // Calcular el centro del mapa basado en las ubicaciones visibles
  const mapCenter = useMemo(() => {
    // Si se muestra el producto, centrar en él primero
    if (showProduct && productLocation?.lat && productLocation?.lng) {
      // Si también se muestran almacenes, centrar entre ambos
      if (showWarehouses && warehouses?.length > 0) {
        const warehousesWithCoords = warehouses.filter(
          (w) => w.latitude && w.longitude
        );
        if (warehousesWithCoords.length > 0) {
          const avgLat =
            (parseFloat(productLocation.lat) +
              warehousesWithCoords.reduce((sum, w) => sum + parseFloat(w.latitude), 0) /
                warehousesWithCoords.length) /
            2;
          const avgLng =
            (parseFloat(productLocation.lng) +
              warehousesWithCoords.reduce((sum, w) => sum + parseFloat(w.longitude), 0) /
                warehousesWithCoords.length) /
            2;
          return { lat: avgLat, lng: avgLng };
        }
      }
      // Solo producto
      return {
        lat: parseFloat(productLocation.lat),
        lng: parseFloat(productLocation.lng),
      };
    }

    // Si solo se muestran almacenes
    if (showWarehouses && warehouses && warehouses.length > 0) {
      const warehousesWithCoords = warehouses.filter(
        (w) => w.latitude && w.longitude
      );

      if (warehousesWithCoords.length > 0) {
        const avgLat =
          warehousesWithCoords.reduce(
            (sum, w) => sum + parseFloat(w.latitude),
            0
          ) / warehousesWithCoords.length;
        const avgLng =
          warehousesWithCoords.reduce(
            (sum, w) => sum + parseFloat(w.longitude),
            0
          ) / warehousesWithCoords.length;

        return { lat: avgLat, lng: avgLng };
      }
    }

    return defaultCenter;
  }, [productLocation, warehouses, showProduct, showWarehouses]);

  // Calcular el zoom basado en las ubicaciones visibles
  const mapZoom = useMemo(() => {
    const validWarehouses = warehouses?.filter(
      (w) => w.latitude && w.longitude
    ) || [];

    if (showProduct && showWarehouses && productLocation?.lat && validWarehouses.length > 0) {
      return 11; // Zoom medio cuando hay producto y almacenes
    }
    if (showWarehouses && validWarehouses.length > 1) {
      return 10; // Zoom más amplio para múltiples almacenes
    }
    return 13; // Zoom cercano para una sola ubicación
  }, [productLocation, warehouses, showProduct, showWarehouses]);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // Verificar si la API key está disponible
  // Usar la key pasada como prop, o intentar obtenerla de las variables de entorno
  const googleMapsApiKey = apiKey || getGoogleMapsApiKey();

  const validWarehouses = warehouses?.filter(
    (w) => w.latitude && w.longitude
  ) || [];

  // Función helper para renderizar el mapa (evita duplicación)
  const renderMapContent = () => (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={mapCenter}
      zoom={mapZoom}
      options={defaultOptions}
    >
      {/* Marcador del producto actual */}
      {(() => {
        const shouldRender = showProduct && productLocation?.lat && productLocation?.lng;
        if (shouldRender) {
          console.log('MapComponent: Renderizando marcador del producto en', {
            lat: parseFloat(productLocation.lat),
            lng: parseFloat(productLocation.lng),
            nombre: productLocation.nombre,
          });
        }
        return shouldRender;
      })() && (
        <Marker
          key={`product-marker-${productLocation.lat}-${productLocation.lng}`}
          position={{
            lat: parseFloat(productLocation.lat),
            lng: parseFloat(productLocation.lng),
          }}
          icon={{
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          }}
          onClick={() =>
            handleMarkerClick({
              type: 'product',
              position: {
                lat: parseFloat(productLocation.lat),
                lng: parseFloat(productLocation.lng),
              },
              title: productLocation.nombre || 'Producto Actual',
              description: productLocation.direccion || '',
            })
          }
        >
          {selectedMarker?.type === 'product' && (
            <InfoWindow
              position={{
                lat: parseFloat(productLocation.lat),
                lng: parseFloat(productLocation.lng),
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="p-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  {productLocation.nombre || 'Producto Actual'}
                </h3>
                {productLocation.direccion && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {productLocation.direccion}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Ubicación actual del producto
                </p>
              </div>
            </InfoWindow>
          )}
        </Marker>
      )}

      {/* Marcadores de almacenes */}
      {showWarehouses && validWarehouses.map((warehouse) => {
        const position = {
          lat: parseFloat(warehouse.latitude),
          lng: parseFloat(warehouse.longitude),
        };

        return (
          <Marker
            key={warehouse.id || warehouse.warehouse_id}
            position={position}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
            onClick={() =>
              handleMarkerClick({
                type: 'warehouse',
                position,
                warehouse,
                title: warehouse.name,
                description: warehouse.location || warehouse.address || '',
              })
            }
          >
            {selectedMarker?.type === 'warehouse' &&
              selectedMarker?.warehouse?.id === warehouse.id && (
                <InfoWindow
                  position={position}
                  onCloseClick={handleInfoWindowClose}
                >
                  <div className="p-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-red-500" />
                      {warehouse.name}
                    </h3>
                    {warehouse.location && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {warehouse.location}
                      </p>
                    )}
                    {warehouse.address && warehouse.address !== warehouse.location && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {warehouse.address}
                      </p>
                    )}
                    {warehouse.capacity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Capacidad: {warehouse.capacity}
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
          </Marker>
        );
      })}
    </GoogleMap>
  );

  if (!googleMapsApiKey || googleMapsApiKey === '' || googleMapsApiKey === 'undefined') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Ubicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La API Key de Google Maps no está configurada. Por favor, configure
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en el archivo .env.local del frontend y reinicie el servidor de desarrollo.
              <br />
              <br />
              <strong>Archivo:</strong> frontend/.env.local
              <br />
              <strong>Variable:</strong> NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hasLocations = productLocation?.lat || validWarehouses.length > 0;

  if (!hasLocations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Ubicaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay ubicaciones disponibles para mostrar en el mapa. Asegúrese
              de que los almacenes tengan coordenadas configuradas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Ubicaciones
          </CardTitle>
          
          {/* Botones de toggle para mostrar/ocultar ubicaciones */}
          <div className="flex flex-wrap gap-2">
            {productLocation?.lat && (
              <Button
                variant={showProduct ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowProduct(!showProduct)}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                {showProduct ? 'Ocultar' : 'Mostrar'} Ubicación del Producto
              </Button>
            )}
            
            {validWarehouses.length > 0 && (
              <Button
                variant={showWarehouses ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowWarehouses(!showWarehouses)}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                {showWarehouses ? 'Ocultar' : 'Mostrar'} Almacenes ({validWarehouses.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mapError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{mapError}</AlertDescription>
          </Alert>
        )}

        {(() => {
          // Verificar inmediatamente antes de renderizar
          const currentlyLoaded = checkGoogleMapsLoaded() || isGoogleMapsLoaded;
          
          if (currentlyLoaded) {
            // Google Maps ya está cargado, renderizar directamente sin LoadScript
            return renderMapContent();
          }
          
          // Verificar si ya hay un script de Google Maps en el DOM (pero aún no está disponible)
          if (typeof window !== 'undefined') {
            const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
            if (existingScripts.length > 0) {
              // El script ya está en el DOM, esperar a que se cargue
              // Renderizar el contenido del mapa directamente (GoogleMap manejará la espera)
              return renderMapContent();
            }
          }
          
          // No está cargado y no hay script en el DOM, usar LoadScript para cargar
          return (
            <LoadScript
              googleMapsApiKey={googleMapsApiKey}
              loadingElement={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              }
              onError={(error) => {
                // Si el error es que ya está presentado, marcarlo como cargado
                const errorMessage = error?.message || error?.toString() || '';
                if (errorMessage.includes('already presented') || errorMessage.includes('already loaded')) {
                  console.log('Google Maps ya estaba cargado, usando la instancia existente');
                  setIsGoogleMapsLoaded(true);
                } else {
                  console.error('Error cargando Google Maps:', error);
                  setMapError('Error al cargar Google Maps. Verifique su API Key.');
                }
              }}
              onLoad={() => {
                console.log('Google Maps cargado correctamente');
                setIsGoogleMapsLoaded(true);
              }}
            >
              {renderMapContent()}
            </LoadScript>
          );
        })()}

        {/* Leyenda - solo mostrar si hay algo visible */}
        {(showProduct || showWarehouses) && (
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            {showProduct && productLocation?.lat && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Ubicación del Producto</span>
              </div>
            )}
            {showWarehouses && validWarehouses.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">Almacenes</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapComponent;

