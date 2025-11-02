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

  // Obtener datos del clima
  const fetchWeatherData = async (city = 'Neuquén Capital, Argentina') => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si tenemos API key
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        console.log('API key no configurada, usando datos simulados');
        throw new Error('API key no configurada');
      }

      // Llamada real a OpenWeatherMap API
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeatherData(data);
      
      return data;
    } catch (err) {
      console.log('Weather API Error:', err.message);
      
      // Solo usar datos simulados si no hay API key configurada
      if (err.message.includes('API key no configurada')) {
        const mockData = {
          name: city,
          main: {
            temp: 18,
            feels_like: 20,
            humidity: 45,
            pressure: 1015
          },
          weather: [{
            main: 'Clear',
            description: 'soleado',
            icon: '01d'
          }],
          wind: {
            speed: 12,
            deg: 180
          },
          visibility: 15000
        };
        
        setWeatherData(mockData);
        setError(null);
        return mockData;
      } else {
        // Para otros errores, lanzar el error
        setError(err.message);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener pronóstico semanal
  const fetchWeeklyForecast = async (city = 'Neuquén Capital, Argentina') => {
    try {
      // Verificar si tenemos API key
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        console.log('API key no configurada, usando datos simulados para pronóstico');
        throw new Error('API key no configurada');
      }

      // Llamada real a OpenWeatherMap API
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=es`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.log('Weather Forecast API Error:', err.message);
      
      // Solo usar datos simulados si no hay API key configurada
      if (err.message.includes('API key no configurada')) {
        const mockForecast = {
          list: [
            {
              dt: Date.now() / 1000,
              main: { temp: 18, temp_min: 12, temp_max: 22 },
              weather: [{ description: 'soleado', icon: '01d' }],
              dt_txt: new Date().toISOString()
            },
            {
              dt: (Date.now() + 86400000) / 1000,
              main: { temp: 16, temp_min: 10, temp_max: 20 },
              weather: [{ description: 'parcialmente nublado', icon: '02d' }],
              dt_txt: new Date(Date.now() + 86400000).toISOString()
            },
            {
              dt: (Date.now() + 172800000) / 1000,
              main: { temp: 14, temp_min: 8, temp_max: 18 },
              weather: [{ description: 'nublado', icon: '04d' }],
              dt_txt: new Date(Date.now() + 172800000).toISOString()
            }
          ]
        };
        
        return mockForecast;
      } else {
        // Para otros errores, lanzar el error
        throw err;
      }
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
