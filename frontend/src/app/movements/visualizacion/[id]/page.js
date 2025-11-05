'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VisualizacionMaps from '@/components/VisualizacionMaps';
import api from '@/lib/api';

export default function VisualizacionMapsPage() {
  const params = useParams();
  const movementId = params.id; // Este es el ID del movimiento, no del producto
  const [product, setProduct] = useState(null);
  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Primero obtener el movimiento para obtener el product_id y ubicacion_actual
        const movementResponse = await api.get(`/movements/${movementId}`);
        const movementData = movementResponse.data;
        
        if (!movementData || !movementData.product_id) {
          throw new Error('Movimiento no encontrado o sin producto asociado');
        }
        
        setMovement(movementData);
        
        // Luego obtener el producto usando el product_id del movimiento
        const productResponse = await api.get(`/productos/${movementData.product_id}`);
        setProduct(productResponse.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err.response?.data?.error || err.message || 'Error al cargar los datos');
        setProduct(null);
        setMovement(null);
      } finally {
        setLoading(false);
      }
    };

    if (movementId) {
      loadData();
    }
  }, [movementId]);

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

  return <VisualizacionMaps productId={product?.id} product={product} movement={movement} />;
}



