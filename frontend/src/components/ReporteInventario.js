import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DataTable } from '@/app/inventory/inventaryTable';

const ReporteInventario = ({ productos = [] }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    filtro: '',
    categoria: 'todas',
    fechaDesde: '',
    fechaHasta: ''
  });

  const categorias = [
    'Electrónicos',
    'Ropa',
    'Hogar',
    'Deportes',
    'Libros',
    'Juguetes',
    'Alimentación',
    'Otros'
  ];

  const handleInputChange = (field, value) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      console.log('=== GENERANDO REPORTE INVENTARIO ===');
      console.log('Filtros aplicados:', filtros);
      
      // Construir query string para el servicio SOAP
      const queryParams = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value && value !== 'todas') {
          queryParams.append(key, value);
        }
      });
      
      const queryString = queryParams.toString();
      const url = `http://localhost:5001/api/reports/inventario/pdf${queryString ? `?${queryString}` : ''}`;
      
      console.log('URL del wrapper REST:', url);
      console.log('🔧 Consumiendo servicio SOAP a través del wrapper REST...');
      
      // Realizar petición al wrapper REST que consume el servicio SOAP
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Obtener el blob del PDF generado por el servicio SOAP
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const urlBlob = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `reporte_inventario_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Simular click para descargar
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
      
      console.log('✅ Reporte generado por servicio SOAP y descargado exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      alert(`Error al generar el reporte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      filtro: '',
      categoria: 'todas',
      fechaDesde: '',
      fechaHasta: ''
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generar Reporte de Inventario
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Genera un reporte PDF del inventario con filtros personalizables
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información de los productos */}
        <div className="p-4 rounded-lg">
          <h3 className="font-semibold mb-3">📊 Resumen del Inventario</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Cantidad de Productos:</strong> {productos.length}</p>
            </div>
            <div>
              <p><strong>Valor Total del Inventario:</strong> ${productos.reduce((acc, prod) => acc + (prod.precio_unitario * prod.stock_actual), 0).toFixed(2)}</p>
            </div>
            <div>
              <p><strong>Stock Total:</strong> {productos.reduce((acc, prod) => acc + prod.stock_actual, 0)} unidades</p>
            </div>
          </div>
        </div>

        {/* Boton de generar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={generarReporte} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {loading ? 'Generando...' : 'Generar Reporte PDF'}
          </Button>
        </div>

        {/* Información del usuario */}
        <div className="text-sm text-muted-foreground">
          <p><strong>Usuario:</strong> {user?.nombre} {user?.apellido}</p>
          <p><strong>Rol:</strong> {user?.rol}</p>
          <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
        </div>
        
        {/* Información técnica */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Información Técnica</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>Servicio SOAP:</strong> Consulta interna de inventario</li>
            <li>• <strong>Wrapper REST:</strong> Transformación de respuesta SOAP a JSON</li>
            <li>• <strong>Generación PDF:</strong> Tabla organizada con datos del inventario</li>
            <li>• <strong>Filtros:</strong> Aplicados tanto en SOAP como en la generación del PDF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReporteInventario;
