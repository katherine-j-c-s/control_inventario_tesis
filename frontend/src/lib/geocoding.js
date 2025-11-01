'use client';

/**
 * Función para obtener coordenadas de una dirección usando Google Geocoding API
 * @param {string} address - Dirección a geocodificar
 * @param {string} apiKey - API Key de Google Maps
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
export async function geocodeAddress(address, apiKey) {
  if (!address || !apiKey) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('Error en geocoding:', error);
    return null;
  }
}

