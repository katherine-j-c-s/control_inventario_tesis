'use client';

import { useState, useEffect } from 'react';

// Hook para manejar APIs externas (Google Maps)
export const useExternalAPIs = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Cargar Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Verificar si ya está cargado
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        return;
      }

      // Verificar si ya existe un script de Google Maps
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Si ya existe, solo esperar a que se cargue
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            setGoogleMapsLoaded(true);
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Solo cargar si no existe y tenemos API key
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
        console.log('Google Maps API key no configurada, usando modo demo');
        setGoogleMapsLoaded(false);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Verificar que la API está completamente cargada antes de marcar como lista
        const checkMapsReady = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            setGoogleMapsLoaded(true);
          } else {
            setTimeout(checkMapsReady, 50);
          }
        };
        checkMapsReady();
      };
      script.onerror = () => {
        setError('Error cargando Google Maps API');
        setGoogleMapsLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  return {
    googleMapsLoaded,
    error
  };
};

export default useExternalAPIs;
