'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VisualizacionMaps from '@/components/VisualizacionMaps';
import api from '@/lib/api';

export default function VisualizacionMapsPage() {
  const params = useParams();
  const productId = params.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/productos/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError('Error al cargar el producto');
        // Producto de ejemplo como fallback
        setProduct({
          id: productId,
          nombre: 'Producto de Ejemplo',
          codigo: 'PROD-001',
          categoria: 'Electrónicos',
          descripcion: 'Producto de ejemplo para demostración',
          ubicacion: 'Ruta 7 Km 8, Neuquén, Neuquén, Argentina'
        });
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return <VisualizacionMaps productId={productId} product={product} />;
}
