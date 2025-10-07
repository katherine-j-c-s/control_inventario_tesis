"use client";

import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import React from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  QrCode, 
  Download, 
  Search, 
  Package, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Tag
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function GenerateQR() {
  // Estados principales
  const [remitoId, setRemitoId] = useState("");
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Función auxiliar para crear el objeto QR simplificado
  const crearObjetoQR = (producto) => ({
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    categoria: producto.categoria,
    cantidad: producto.cantidad,
    unidad: producto.unidad,
    precio: producto.precio,
    ubicacion: producto.ubicacion,
    remito_id: producto.receipt_id,
    fecha_remito: producto.fecha_remito,
    verificado: producto.verificado,
    timestamp: new Date().toISOString()
  });

  // Función para buscar productos por remito
  const buscarRemito = async () => {
    if (!remitoId.trim()) {
      setError("Por favor ingresa un ID de remito válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProductos([]);

    try {
      const response = await api.get(`/remitos/${remitoId}/productos`);
      const data = response.data;
      
      // Verificar si hay productos
      if (data.length === 0) {
        setError("El remito no tiene productos asociados");
        return;
      }
      
      // Filtrar solo productos verificados
      const productosVerificados = data.filter(producto => producto.verificado === true);
      
      setProductos(productosVerificados);
      
      if (productosVerificados.length === 0) {
        setError("El remito no tiene productos verificados. Solo se pueden generar QR para productos verificados.");
      } else {
        setSuccess(`Se encontraron ${productosVerificados.length} productos verificados de ${data.length} productos totales`);
      }
    } catch (error) {
      console.error('Error buscando remito:', error);
      if (error.response?.status === 404) {
        setError("Remito no encontrado");
      } else {
        setError(`Error al buscar remito: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar QR como PNG
  const descargarQR = (producto) => {
    try {
      // Crear un elemento temporal para renderizar el QR
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '256px';
      tempDiv.style.height = '256px';
      document.body.appendChild(tempDiv);
      
      // Crear un contenedor para el QR
      const qrContainer = document.createElement('div');
      qrContainer.id = `qr-temp-${producto.id}`;
      qrContainer.style.width = '256px';
      qrContainer.style.height = '256px';
      tempDiv.appendChild(qrContainer);
      
      // Usar ReactDOM para renderizar el QR
      const { createRoot } = require('react-dom/client');
      const root = createRoot(qrContainer);
      
      // Renderizar el QR
      root.render(
        React.createElement(QRCodeSVG, {
          value: JSON.stringify(crearObjetoQR(producto)),
          size: 256,
          level: 'M',
          includeMargin: true
        })
      );
      
      // Esperar un momento para que se renderice
      setTimeout(() => {
        const qrElement = qrContainer.querySelector('svg');
        if (qrElement) {
          // Convertir SVG a canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;
          
          // Crear una imagen del SVG
          const svgData = new XMLSerializer().serializeToString(qrElement);
          const img = new Image();
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            
            // Convertir a blob y descargar
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `qr-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}-${producto.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              } else {
                setError('Error al generar el archivo de descarga');
              }
            }, 'image/png');
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } else {
          setError('Error al generar el código QR');
        }
        
        // Limpiar elementos temporales
        root.unmount();
        document.body.removeChild(tempDiv);
      }, 200);
      
    } catch (error) {
      console.error('Error descargando QR:', error);
      setError('Error al descargar el código QR');
    }
  };

  // Función para descargar todos los QR
  const descargarTodosQR = () => {
    productos.forEach((producto, index) => {
      setTimeout(() => {
        descargarQR(producto);
      }, index * 1000); // Descargar uno cada segundo para evitar problemas
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center">
              <QrCode className="w-8 h-8 mr-3 text-blue-600" />
              Generador de Códigos QR
            </h1>
            <p className="text-muted-foreground">
              Genera códigos QR para productos verificados de un remito
            </p>
          </div>

          {/* Formulario de búsqueda */}
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Productos por Remito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="remitoId" className="text-foreground">
                    ID del Remito
                  </Label>
                  <Input
                    id="remitoId"
                    type="number"
                    placeholder="Ingresa el ID del remito"
                    value={remitoId}
                    onChange={(e) => setRemitoId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <Button 
                  onClick={buscarRemito}
                  disabled={loading || !remitoId.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando Remito...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Buscar Remito
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de productos con QR */}
          {productos.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Productos Verificados del Remito #{remitoId} ({productos.length})
                  </CardTitle>
                  <Button 
                    onClick={descargarTodosQR}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todos los QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productos.map((producto) => (
                    <Card key={producto.id} className="bg-muted/50 border-border">
                      <CardContent className="p-4">
                        <div className="text-center space-y-4">
                          {/* Información del producto */}
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {producto.nombre}
                            </h3>
                            {producto.descripcion && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {producto.descripcion}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Tag className="w-3 h-3 mr-1" />
                                {producto.cantidad} {producto.unidad}
                              </span>
                            </div>
                          </div>

                          {/* Código QR */}
                          <div className="flex justify-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <QRCodeSVG
                                value={JSON.stringify(crearObjetoQR(producto))}
                                size={128}
                                level="M"
                                includeMargin={true}
                              />
                            </div>
                          </div>

                          {/* Información de movimientos */}
                          {producto.movimientos && producto.movimientos.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium">Movimientos:</p>
                              <ul className="mt-1 space-y-1">
                                {producto.movimientos.map((mov, idx) => (
                                  <li key={idx} className="flex justify-between">
                                    <span>{mov.tipo}</span>
                                    <span>{new Date(mov.fecha).toLocaleDateString()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Botón de descarga */}
                          <Button 
                            onClick={() => descargarQR(producto)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar QR
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje si no hay productos verificados */}
          {!loading && productos.length === 0 && remitoId && (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No hay productos verificados
                </h3>
                <p className="text-muted-foreground">
                  El remito #{remitoId} no tiene productos verificados para generar códigos QR
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}