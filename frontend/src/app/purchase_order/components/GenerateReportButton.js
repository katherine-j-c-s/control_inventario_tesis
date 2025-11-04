'use client';

import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { orderAPI } from '@/lib/api';

const GenerateReportButton = ({ orderId, disabled }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Función para generar y descargar el PDF
   */
  const handleGenerateReport = async () => {
    if (!orderId) {
      setError('ID de orden no válido');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await orderAPI.generateOrderReport(orderId);

      // Crear un enlace temporal para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orden-compra-${orderId}.pdf`;
      
      // Simular click para iniciar la descarga
      document.body.appendChild(link);
      link.click();
      
      // Limpiar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      if (err.message.includes('404')) {
        setError('Orden no encontrada');
      } else if (err.message.includes('401') || err.message.includes('403')) {
        setError('No tiene permisos para generar este informe');
      } else if (err.message.includes('500')) {
        setError('Error del servidor al generar el PDF');
      } else {
        setError(err.message || 'Error al generar el informe PDF');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = disabled || isGenerating || !orderId;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerateReport}
        disabled={isDisabled}
        className="w-full sm:w-auto"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4 mr-2" />
            Generar Informe PDF
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default GenerateReportButton;

