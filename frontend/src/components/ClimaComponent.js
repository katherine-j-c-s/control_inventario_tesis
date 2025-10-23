'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Cloud, Sun, CloudRain, Wind, Thermometer, Droplets, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useExternalAPIs } from '@/hooks/useExternalAPIs';

const ClimaComponent = () => {
  const router = useRouter();
  const { fetchWeatherData, fetchWeeklyForecast, loading, error } = useExternalAPIs();
  const [weatherData, setWeatherData] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);

  // Datos de ejemplo para el TP (simulando OpenWeatherMap API)
  const mockWeatherData = {
    current: {
      temperature: 22,
      humidity: 65,
      pressure: 1013,
      visibility: 10,
      windSpeed: 15,
      windDirection: 270,
      description: 'Parcialmente nublado',
      icon: 'partly-cloudy',
      feelsLike: 24
    },
    weekly: [
      { day: 'Lunes', date: '2024-01-22', temp: { min: 18, max: 25 }, description: 'Soleado', icon: 'sunny' },
      { day: 'Martes', date: '2024-01-23', temp: { min: 16, max: 23 }, description: 'Parcialmente nublado', icon: 'partly-cloudy' },
      { day: 'Miércoles', date: '2024-01-24', temp: { min: 14, max: 20 }, description: 'Lluvia ligera', icon: 'rainy' },
      { day: 'Jueves', date: '2024-01-25', temp: { min: 12, max: 18 }, description: 'Nublado', icon: 'cloudy' },
      { day: 'Viernes', date: '2024-01-26', temp: { min: 15, max: 22 }, description: 'Soleado', icon: 'sunny' },
      { day: 'Sábado', date: '2024-01-27', temp: { min: 17, max: 24 }, description: 'Parcialmente nublado', icon: 'partly-cloudy' },
      { day: 'Domingo', date: '2024-01-28', temp: { min: 19, max: 26 }, description: 'Soleado', icon: 'sunny' }
    ]
  };

  useEffect(() => {
    // Cargar datos del clima
    const loadWeatherData = async () => {
      try {
        const currentWeather = await fetchWeatherData('Buenos Aires');
        const forecast = await fetchWeeklyForecast('Buenos Aires');
        
        setWeatherData(currentWeather);
        setWeeklyForecast(forecast.list || []);
      } catch (err) {
        console.error('Error loading weather data:', err);
        // Usar datos simulados como fallback
        setWeatherData(mockWeatherData.current);
        setWeeklyForecast(mockWeatherData.weekly);
      }
    };

    loadWeatherData();
  }, [fetchWeatherData, fetchWeeklyForecast]);

  const getWeatherIcon = (iconType, weatherMain) => {
    // Mapear iconos de OpenWeatherMap
    const iconMap = {
      '01d': <Sun className="h-6 w-6 text-yellow-500" />,
      '01n': <Sun className="h-6 w-6 text-yellow-500" />,
      '02d': <Cloud className="h-6 w-6 text-gray-500" />,
      '02n': <Cloud className="h-6 w-6 text-gray-500" />,
      '03d': <Cloud className="h-6 w-6 text-gray-600" />,
      '03n': <Cloud className="h-6 w-6 text-gray-600" />,
      '04d': <Cloud className="h-6 w-6 text-gray-600" />,
      '04n': <Cloud className="h-6 w-6 text-gray-600" />,
      '09d': <CloudRain className="h-6 w-6 text-blue-500" />,
      '09n': <CloudRain className="h-6 w-6 text-blue-500" />,
      '10d': <CloudRain className="h-6 w-6 text-blue-500" />,
      '10n': <CloudRain className="h-6 w-6 text-blue-500" />,
      '11d': <CloudRain className="h-6 w-6 text-blue-600" />,
      '11n': <CloudRain className="h-6 w-6 text-blue-600" />,
      '13d': <CloudRain className="h-6 w-6 text-blue-400" />,
      '13n': <CloudRain className="h-6 w-6 text-blue-400" />,
      '50d': <Cloud className="h-6 w-6 text-gray-400" />,
      '50n': <Cloud className="h-6 w-6 text-gray-400" />
    };
    
    // Fallback a iconos por tipo de clima
    const fallbackMap = {
      'sunny': <Sun className="h-6 w-6 text-yellow-500" />,
      'partly-cloudy': <Cloud className="h-6 w-6 text-gray-500" />,
      'cloudy': <Cloud className="h-6 w-6 text-gray-600" />,
      'rainy': <CloudRain className="h-6 w-6 text-blue-500" />
    };
    
    return iconMap[iconType] || fallbackMap[weatherMain] || <Cloud className="h-6 w-6 text-gray-500" />;
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getWeatherImpact = (weather) => {
    const impacts = {
      'Clear': { 
        impact: 'Óptimo', 
        color: 'text-green-600', 
        description: 'Condiciones ideales para almacenamiento y transporte' 
      },
      'Clouds': { 
        impact: 'Bueno', 
        color: 'text-blue-600', 
        description: 'Condiciones favorables para operaciones' 
      },
      'Rain': { 
        impact: 'Cuidado', 
        color: 'text-orange-600', 
        description: 'Evitar transporte de productos sensibles al agua' 
      },
      'Thunderstorm': { 
        impact: 'Alerta', 
        color: 'text-red-600', 
        description: 'Suspender operaciones de transporte' 
      },
      'Snow': { 
        impact: 'Cuidado', 
        color: 'text-blue-600', 
        description: 'Precaución con productos sensibles al frío' 
      },
      'Mist': { 
        impact: 'Regular', 
        color: 'text-yellow-600', 
        description: 'Precaución con productos sensibles a la humedad' 
      }
    };
    return impacts[weather] || { impact: 'Normal', color: 'text-gray-600', description: 'Condiciones normales' };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando datos del clima...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const weatherImpact = getWeatherImpact(weatherData.weather?.[0]?.main);

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
            <h1 className="text-xl font-semibold">Condiciones Climáticas</h1>
            <p className="text-sm text-muted-foreground">
              Buenos Aires, Argentina
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Clima actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getWeatherIcon(weatherData.weather?.[0]?.icon, weatherData.weather?.[0]?.main)}
                Clima Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Temperatura principal */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {Math.round(weatherData.main?.temp || 0)}°C
                  </div>
                  <div className="text-lg text-muted-foreground mb-2">
                    {weatherData.weather?.[0]?.description || 'Sin descripción'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Sensación térmica: {Math.round(weatherData.main?.feels_like || 0)}°C
                  </div>
                </div>

                {/* Detalles del clima */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <span>Humedad: {weatherData.main?.humidity || 0}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="h-5 w-5 text-gray-500" />
                    <span>Viento: {Math.round((weatherData.wind?.speed || 0) * 3.6)} km/h {getWindDirection(weatherData.wind?.deg || 0)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Thermometer className="h-5 w-5 text-red-500" />
                    <span>Presión: {weatherData.main?.pressure || 0} hPa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-gray-500" />
                    <span>Visibilidad: {Math.round((weatherData.visibility || 0) / 1000)} km</span>
                  </div>
                </div>

                {/* Impacto en inventario */}
                <div className="text-center">
                  <div className={`text-lg font-semibold ${weatherImpact.color} mb-2`}>
                    {weatherImpact.impact}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weatherImpact.description}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pronóstico semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Pronóstico de la Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weeklyForecast.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="font-medium text-sm mb-2">{day.day}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {new Date(day.date).toLocaleDateString()}
                    </div>
                    <div className="mb-2">
                      {getWeatherIcon(day.icon)}
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {day.temp.max}°C
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {day.temp.min}°C
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones para inventario */}
          <Card>
            <CardHeader>
              <CardTitle>Recomendaciones para el Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Almacenamiento</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Verificar sellos de productos sensibles a la humedad</li>
                    <li>• Revisar condiciones de temperatura en almacenes</li>
                    <li>• Asegurar ventilación adecuada</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Transporte</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Planificar rutas evitando condiciones adversas</li>
                    <li>• Proteger productos sensibles al agua</li>
                    <li>• Considerar retrasos por condiciones climáticas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de la API */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-sm text-blue-600 mb-2">
                  🌤️ Datos proporcionados por OpenWeatherMap API
                </div>
                <div className="text-xs text-muted-foreground">
                  Última actualización: {new Date().toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClimaComponent;
