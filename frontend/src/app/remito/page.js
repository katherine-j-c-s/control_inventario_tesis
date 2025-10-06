"use client";
// 
import Layout from "@/components/layouts/Layout";
import React, { useState, useEffect } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { receiptAPI } from "@/lib/api";
import ReceiptActions from "./ReceiptActions";
import ReceiptsTable from "./ReceiptsTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const Remito = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentView, setCurrentView] = useState('all'); // 'all', 'unverified', 'verified'

  // Función para manejar errores
  const handleError = (error) => {
    console.error('Error:', error);
    setError(error.response?.data?.error || 'Error al procesar la solicitud');
    setSuccess(null);
  };

  // Función para mostrar mensajes de éxito
  const showSuccess = (message) => {
    setSuccess(message);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Función para obtener todos los remitos
  const handleGetAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await receiptAPI.getAllReceipts();
      setReceipts(response.data);
      setCurrentView('all');
      showSuccess('Remitos cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener remitos no verificados
  const handleGetUnverified = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await receiptAPI.getUnverifiedReceipts();
      setReceipts(response.data);
      setCurrentView('unverified');
      showSuccess('Remitos no verificados cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener remitos verificados
  const handleGetVerified = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await receiptAPI.getVerifiedReceipts();
      setReceipts(response.data);
      setCurrentView('verified');
      showSuccess('Remitos verificados cargados correctamente');
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };


  // Función para verificar un remito
  const handleVerify = async (receiptId) => {
    setLoading(true);
    setError(null);
    try {
      await receiptAPI.verifyReceipt(receiptId);
      showSuccess('Remito verificado correctamente');
      // Recargar la vista actual
      if (currentView === 'unverified') {
        handleGetUnverified();
      } else if (currentView === 'all') {
        handleGetAll();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para ver detalles de un remito
  const handleView = (receipt) => {
    console.log('Ver detalles del remito:', receipt);
    showSuccess(`Viendo detalles del remito ${receipt.receipt_id}`);
  };


  // Cargar datos iniciales
  useEffect(() => {
    handleGetAll();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Remitos</h1>
          <p className="text-lg text-muted-foreground">Bienvenido, {user?.nombre}</p>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Botones de acción */}
        <ReceiptActions
          onGetAll={handleGetAll}
          onGetUnverified={handleGetUnverified}
          onGetVerified={handleGetVerified}
          loading={loading}
        />

        {/* Mostrar tabla de remitos */}
        <div className="bg-card rounded-lg shadow border">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              {currentView === 'all' && 'Todos los Remitos'}
              {currentView === 'unverified' && 'Remitos No Verificados'}
              {currentView === 'verified' && 'Remitos Verificados'}
            </h2>
            <p className="text-muted-foreground">
              {receipts.length} remito{receipts.length !== 1 ? 's' : ''} encontrado{receipts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="p-4">
            <ReceiptsTable
              receipts={receipts}
              onVerify={handleVerify}
              onView={handleView}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default function RemitoPage() {
  return (
    <AuthProvider>
      <Remito />
    </AuthProvider>
  );
}
