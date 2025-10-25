'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/layouts/Layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PlusCircle, TrendingUp } from 'lucide-react';
import HistoryMovements from './components/historyMovements';
import MoveProduct from './components/moveProduct';

const MovementsContent = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para los movimientos (esto vendrá de una API)
  const [movements, setMovements] = useState([
    {
      id: 1,
      producto: 'Laptop Dell Inspiron 15',
      tipo: 'entrada',
      cantidad: 5,
      origen: 'Proveedor Tech Solutions',
      destino: 'Almacén Central',
      usuario: user?.nombre || 'Juan Pérez',
      timestamp: Date.now() - 1000 * 60 * 15, // hace 15 minutos
      observaciones: 'Ingreso de nuevo stock'
    },
    {
      id: 2,
      producto: 'Monitor Samsung 24"',
      tipo: 'salida',
      cantidad: 2,
      origen: 'Almacén Central',
      destino: 'Oficina Piso 2',
      usuario: user?.nombre || 'María García',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // hace 2 horas
      observaciones: 'Asignación a nuevos empleados'
    },
    {
      id: 3,
      producto: 'Teclado Mecánico Logitech',
      tipo: 'transferencia',
      cantidad: 10,
      origen: 'Almacén Central',
      destino: 'Almacén Secundario',
      usuario: user?.nombre || 'Carlos López',
      timestamp: Date.now() - 1000 * 60 * 60 * 5, // hace 5 horas
    },
    {
      id: 4,
      producto: 'Mouse Inalámbrico',
      tipo: 'ajuste',
      cantidad: 3,
      origen: 'Almacén Central',
      destino: 'Almacén Central',
      usuario: user?.nombre || 'Ana Martínez',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // hace 1 día
      observaciones: 'Ajuste por inventario físico'
    }
  ]);

  // Función para abrir el modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Función para manejar cuando se crea un nuevo movimiento
  const handleMovementCreated = (newMovement) => {
    setMovements(prev => [newMovement, ...prev]);
    console.log('Nuevo movimiento registrado:', newMovement);
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
          <HistoryMovements movements={movements} />
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
