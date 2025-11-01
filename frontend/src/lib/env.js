'use client';

/**
 * Función helper para obtener la API Key de Google Maps
 * Asegura que se obtenga desde múltiples fuentes posibles
 */
export function getGoogleMapsApiKey() {
  let apiKey = null;
  
  // En el cliente
  if (typeof window !== 'undefined') {
    // Intentar 1: Desde process.env directamente (Next.js debería inyectarlo aquí)
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    // Intentar 2: Desde window.__NEXT_DATA__.env (Next.js inyecta aquí también)
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      apiKey = window.__NEXT_DATA__?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    }
    
    // Intentar 3: Desde window.__NEXT_DATA__.runtimeConfig (versiones más antiguas)
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      apiKey = window.__NEXT_DATA__?.runtimeConfig?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    }
    
    // Intentar 4: Desde process.env directamente (reintento)
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      // A veces Next.js necesita acceso directo al objeto process
      try {
        const env = process.env || {};
        apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      } catch (e) {
        console.warn('Error accediendo a process.env:', e);
      }
    }
  } else {
    // En el servidor
    apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }
  
  // Limpiar valores inválidos
  if (apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
    apiKey = null;
  }
  
  // Log de depuración solo si no se encuentra
  if (!apiKey) {
    console.warn('getGoogleMapsApiKey: No se encontró la API key. Verificando fuentes...', {
      hasWindow: typeof window !== 'undefined',
      processEnv: typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : 'N/A (servidor)',
      nextDataEnv: typeof window !== 'undefined' ? window.__NEXT_DATA__?.env : null,
      nextDataRuntimeConfig: typeof window !== 'undefined' ? window.__NEXT_DATA__?.runtimeConfig : null,
    });
  }
  
  return apiKey;
}

