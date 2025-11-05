'use client';

import { useState, useEffect, useRef } from 'react';

// Variable global para evitar múltiples cargas
let isLoadingGoogleMaps = false;
let googleMapsLoadPromise = null;

// Hook para manejar APIs externas (Google Maps)
export const useExternalAPIs = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const callbackRef = useRef(null);

  // Cargar Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      // Verificar si ya está cargado
      if (window.google && window.google.maps && window.google.maps.Map) {
        setGoogleMapsLoaded(true);
        return;
      }

      // Verificar si ya existe un script de Google Maps cargándose o cargado
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript || isLoadingGoogleMaps) {
        // Si ya existe el script o se está cargando, esperar a que se cargue
        if (googleMapsLoadPromise) {
          try {
            await googleMapsLoadPromise;
            if (window.google && window.google.maps && window.google.maps.Map) {
              setGoogleMapsLoaded(true);
            }
          } catch (err) {
            console.warn('Error esperando carga de Google Maps:', err);
          }
          return;
        }
        
        // Si el script existe pero no hay promesa, esperar manualmente
        const checkLoaded = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            setGoogleMapsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Obtener la API key desde el backend
      try {
        // Primero intentar desde variable de entorno del frontend
        let apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        
        // Si no está en el frontend, obtenerla del backend
        if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
          try {
            const apiModule = await import('@/lib/api');
            const response = await apiModule.default.get('/config/google-maps-key');
            
            if (response && response.data) {
              if (response.data.apiKey) {
                apiKey = response.data.apiKey;
                console.log('✅ API key de Google Maps obtenida del backend');
              } else if (response.data.error) {
                console.warn('⚠️ Google Maps API key no configurada en el servidor');
                console.warn('   Mensaje:', response.data.error);
                console.warn('   Solución: Agrega GOOGLE_MAPS_API_KEY=tu_api_key en el archivo .env del backend');
                setGoogleMapsLoaded(false);
                return;
              }
            }
          } catch (err) {
            // Manejar diferentes tipos de errores
            if (err.response?.status === 404) {
              console.warn('⚠️ Endpoint /api/config/google-maps-key no encontrado (404)');
              console.warn('   Esto puede ser temporal. El mapa se mostrará en modo embebido.');
            } else if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error') || err.message?.includes('ERR_CONNECTION_REFUSED')) {
              console.warn('⚠️ No se pudo conectar al backend en http://localhost:5001');
              console.warn('   Verifica que el servidor esté corriendo');
              console.warn('   El mapa se mostrará en modo embebido como fallback.');
            } else {
              console.warn('⚠️ Error obteniendo API key del backend:', err.message || 'Error desconocido');
              console.warn('   El mapa se mostrará en modo embebido como fallback.');
            }
            setGoogleMapsLoaded(false);
            return;
          }
        }
        
        if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
          console.log('Google Maps API key no configurada, usando modo demo');
          setGoogleMapsLoaded(false);
          return;
        }

        // Marcar que estamos cargando ANTES de crear el script
        isLoadingGoogleMaps = true;

        // Crear una promesa para la carga de Google Maps
        googleMapsLoadPromise = new Promise((resolve, reject) => {
          // Generar un nombre único para el callback para evitar conflictos
          const timestamp = Date.now();
          const callbackName = `googleMapsInitCallback_${timestamp}`;
          callbackRef.current = callbackName;

          // Crear el callback global
          window[callbackName] = () => {
            try {
              // Verificar que la API está completamente cargada
              if (window.google && window.google.maps && window.google.maps.Map) {
                setGoogleMapsLoaded(true);
                resolve();
              } else {
                const error = new Error('Google Maps API cargó pero no está disponible');
                setError(error.message);
                setGoogleMapsLoaded(false);
                reject(error);
              }
            } finally {
              // Limpiar el callback después de usarlo
              if (window[callbackName]) {
                delete window[callbackName];
              }
            }
          };

          // Crear el script
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=${callbackName}&loading=async`;
          script.async = true;
          script.defer = true;
          
          script.onerror = () => {
            const error = new Error('Error cargando Google Maps API. Verifica que la API key sea válida y que las APIs de Maps estén habilitadas.');
            setError(error.message);
            setGoogleMapsLoaded(false);
            isLoadingGoogleMaps = false;
            googleMapsLoadPromise = null;
            // Limpiar el callback en caso de error
            if (window[callbackName]) {
              delete window[callbackName];
            }
            reject(error);
          };
          
          // Verificar una vez más antes de agregar el script (por si otro componente lo agregó en el medio)
          // Esto debe hacerse ANTES de agregar el script al DOM
          const checkAgain = document.querySelector('script[src*="maps.googleapis.com"]');
          if (checkAgain) {
            // Ya existe otro script, no agregar este
            isLoadingGoogleMaps = false;
            googleMapsLoadPromise = null;
            // Esperar al script existente
            const waitForExisting = () => {
              if (window.google && window.google.maps && window.google.maps.Map) {
                setGoogleMapsLoaded(true);
                resolve();
              } else {
                setTimeout(waitForExisting, 100);
              }
            };
            waitForExisting();
            return;
          }
          
          // Agregar el script al DOM solo si no existe otro
          document.head.appendChild(script);
        });

        // Esperar a que se cargue
        await googleMapsLoadPromise;
        
        // Resetear el flag solo después de que se complete la carga
        isLoadingGoogleMaps = false;
        
      } catch (err) {
        console.error('Error obteniendo API key de Google Maps:', err);
        setGoogleMapsLoaded(false);
        isLoadingGoogleMaps = false;
        googleMapsLoadPromise = null;
      }
    };

    loadGoogleMaps();

    // Limpiar cuando el componente se desmonte
    return () => {
      // No limpiar el script porque otros componentes pueden estar usándolo
      // Solo limpiar el callback si existe
      if (callbackRef.current && window[callbackRef.current]) {
        // No eliminar si otros componentes pueden estar esperando
        // El callback se elimina automáticamente después de ejecutarse
      }
    };
  }, []);

  return {
    googleMapsLoaded,
    error
  };
};

export default useExternalAPIs;
