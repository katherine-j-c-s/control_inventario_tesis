'use client';

import { useState, useEffect } from 'react';

// Hook para manejar APIs externas
export const useExternalAPIs = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => {
        setError('Error cargando Google Maps API');
        setGoogleMapsLoaded(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Obtener datos del clima
  const fetchWeatherData = async (city = 'Buenos Aires') => {
    setLoading(true);
    setError(null);

    try {
      // Llamada real a OpenWeatherMap API
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric&lang=es`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      return data;
    } catch (err) {
      console.error('Weather API Error:', err);
      
      // Fallback a datos simulados si falla la API
      const mockData = {
        name: city,
        main: {
          temp: 22,
          feels_like: 24,
          humidity: 65,
          pressure: 1013
        },
        weather: [{
          main: 'Clouds',
          description: 'parcialmente nublado',
          icon: '02d'
        }],
        wind: {
          speed: 15,
          deg: 270
        },
        visibility: 10000
      };
      
      setWeatherData(mockData);
      setError('Usando datos simulados - API no disponible');
      
      return mockData;
    } finally {
      setLoading(false);
    }
  };

  // Obtener pronóstico semanal
  const fetchWeeklyForecast = async (city = 'Buenos Aires') => {
    setLoading(true);
    setError(null);

    try {
      // Llamada real a OpenWeatherMap API
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric&lang=es`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Weather Forecast API Error:', err);
      
      // Fallback a datos simulados si falla la API
      const mockForecast = {
        list: [
          {
            dt: Date.now() / 1000,
            main: { temp: 22, temp_min: 18, temp_max: 25 },
            weather: [{ description: 'soleado', icon: '01d' }],
            dt_txt: new Date().toISOString()
          },
          {
            dt: (Date.now() + 86400000) / 1000,
            main: { temp: 20, temp_min: 16, temp_max: 23 },
            weather: [{ description: 'parcialmente nublado', icon: '02d' }],
            dt_txt: new Date(Date.now() + 86400000).toISOString()
          },
          {
            dt: (Date.now() + 172800000) / 1000,
            main: { temp: 18, temp_min: 14, temp_max: 20 },
            weather: [{ description: 'lluvia ligera', icon: '10d' }],
            dt_txt: new Date(Date.now() + 172800000).toISOString()
          }
        ]
      };
      
      setError('Usando datos simulados - API no disponible');
      return mockForecast;
    } finally {
      setLoading(false);
    }
  };

  return {
    googleMapsLoaded,
    weatherData,
    loading,
    error,
    fetchWeatherData,
    fetchWeeklyForecast
  };
};

export default useExternalAPIs;
