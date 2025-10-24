import VisualizacionMaps from '@/components/VisualizacionMaps';

export default async function VisualizacionMapsPage({ params }) {
  const { id } = await params;
  const productId = id;
  
  // En una implementación real, aquí obtendrías los datos del producto desde la API
  const product = {
    id: productId,
    nombre: 'Producto de Ejemplo',
    codigo: 'PROD-001',
    categoria: 'Electrónicos',
    descripcion: 'Producto de ejemplo para demostración',
    ubicacion: 'Almacén Norte' // Ubicación actual del producto
  };

  return <VisualizacionMaps productId={productId} product={product} />;
}
