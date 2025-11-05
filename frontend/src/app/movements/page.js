'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlusCircle } from 'lucide-react';
import HistoryMovements from './components/historyMovements';
import MoveProduct from './components/moveProduct';

const MovementsContent = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  // Estado para los movimientos
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cargar movimientos desde la API
  useEffect(() => {
    const loadMovements = async () => {
      try {
        setLoading(true);
        const { movementAPI } = await import('@/lib/api');
        const response = await movementAPI.getAllMovements();
        
        // Transformar los datos de la API al formato esperado por el componente
        const transformedMovements = response.data.map(mov => {
          // Convertir fecha correctamente
          let timestamp;
          try {
            if (mov.date) {
              timestamp = new Date(mov.date).getTime();
              if (isNaN(timestamp)) {
                timestamp = Date.now();
              }
            } else {
              timestamp = Date.now();
            }
          } catch (e) {
            timestamp = Date.now();
          }
          
          return {
            id: mov.movement_id || mov.id,
            producto: mov.product_name || `Producto #${mov.product_id}`,
            tipo: mov.movement_type?.toLowerCase() || 'entrada',
            cantidad: mov.quantity || 0,
            origen: mov.ubicacionactual || mov.ubicacion_actual || 'N/A',
            destino: mov.destinatario || 'N/A',
            usuario: mov.user_name || 'Usuario desconocido',
            timestamp: timestamp,
            observaciones: mov.observaciones || mov.motivo || null
          };
        });
        setMovements(transformedMovements);
      } catch (error) {
        console.error('Error cargando movimientos:', error);
        setMovements([]); // Asegurar que se establece un array vacío en caso de error
      } finally {
        setLoading(false);
      }
    };
    
    loadMovements();
  }, []);

  // Función para abrir el modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Función para manejar cuando se crea un nuevo movimiento
  const handleMovementCreated = async (newMovement) => {
    // Recargar movimientos desde la API
    try {
      const { movementAPI } = await import('@/lib/api');
      const response = await movementAPI.getAllMovements();
      
      const transformedMovements = response.data.map(mov => {
        let timestamp;
        try {
          if (mov.date) {
            timestamp = new Date(mov.date).getTime();
            if (isNaN(timestamp)) {
              timestamp = Date.now();
            }
          } else {
            timestamp = Date.now();
          }
        } catch (e) {
          timestamp = Date.now();
        }
        
        return {
          id: mov.movement_id || mov.id,
          producto: mov.product_name || `Producto #${mov.product_id}`,
          tipo: mov.movement_type?.toLowerCase() || 'entrada',
          cantidad: mov.quantity || 0,
          origen: mov.ubicacionactual || mov.ubicacion_actual || 'N/A',
          destino: mov.destinatario || 'N/A',
          usuario: mov.user_name || 'Usuario desconocido',
          timestamp: timestamp,
          observaciones: mov.observaciones || mov.motivo || null
        };
      });
      
      setMovements(transformedMovements);
    } catch (error) {
      console.error('Error recargando movimientos:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Movimientos de Productos
              </h1>
              <p className="mt-1 text-muted-foreground">
                Gestiona y visualiza los movimientos de inventario
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenModal}>
                <PlusCircle className="mr-2 h-4 w-4" /> 
                Nuevo Movimiento
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Historial de movimientos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando movimientos...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <HistoryMovements movements={movements} />
          )}
        </motion.div>
      </div>

      {/* Modal para Nuevo Movimiento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Registrar Nuevo Movimiento
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para registrar un movimiento de producto
            </DialogDescription>
          </DialogHeader>
          <MoveProduct
            onClose={handleCloseModal}
            onMovementCreated={handleMovementCreated}
            currentUser={user}
          />
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default function Movements() {
  return (
    <AuthProvider>
      <MovementsContent />
    </AuthProvider>
  );
}
