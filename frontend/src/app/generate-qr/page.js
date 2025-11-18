"use client";

import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";


export default function GenerateQR() {
  const [remitoId, setRemitoId] = useState("");
  const [productos, setProductos] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  const crearObjetoQRSimplificado = (producto) => ({
    i: producto.id,
    n: producto.nombre,
    d: producto.descripcion,
    c: producto.categoria,
    q: producto.cantidad,
    u: producto.unidad,
    p: producto.precio,
    l: producto.ubicacion,
    r: producto.receipt_id,
    f: producto.fecha_remito,
    v: producto.verificado,
    t: new Date().toISOString()
  });

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
      
      if (data.length === 0) {
        setError("El remito no tiene productos asociados");
        return;
      }
      
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

  const descargarQR = async (producto) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '256px';
      tempDiv.style.height = '256px';
      document.body.appendChild(tempDiv);
      
      const qrContainer = document.createElement('div');
      qrContainer.id = `qr-temp-${producto.id}`;
      qrContainer.style.width = '256px';
      qrContainer.style.height = '256px';
      tempDiv.appendChild(qrContainer);
      
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(qrContainer);
      
      root.render(
        <QRCodeSVG
          value={JSON.stringify(crearObjetoQRSimplificado(producto))}
          size={256}
          level="M"
          includeMargin={true}
        />
      );
      
      setTimeout(() => {
        const qrElement = qrContainer.querySelector('svg');
        if (qrElement) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;

          const svgData = new XMLSerializer().serializeToString(qrElement);
          const img = new Image();
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
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

        root.unmount();
        document.body.removeChild(tempDiv);
      }, 200);
      
    } catch (error) {
      console.error('Error descargando QR:', error);
      setError('Error al descargar el código QR');
    }
  };

  const descargarTodosQR = () => {
    productos.forEach((producto, index) => {
      setTimeout(() => {
        descargarQR(producto);
      }, index * 1000);
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-start mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-start justify-start">
              Generador de Códigos QR
            </h1>
            <p className="text-muted-foreground">
              Genera códigos QR para productos verificados de un remito
            </p>
          </div>

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
                  disabled={isloading || !remitoId.trim()}
                  className="w-full"
                >
                  {isloading ? (
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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {success}
              </AlertDescription>
            </Alert>
          )}

          {productos.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex md:flex-row flex-col items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Package className="w-5 h-5 mr-2 md:flex hidden" />
                    Productos Verificados del Remito #{remitoId} ({productos.length})
                  </CardTitle>
                  <Button 
                    onClick={descargarTodosQR}
                    variant="outline"
                    className="mt-4 md:mt-0"
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

                          <div className="flex justify-center">
                            <div className="bg-card p-2 rounded-lg border border-border shadow-sm">
                              <QRCodeSVG
                                value={JSON.stringify(crearObjetoQRSimplificado(producto))}
                                size={128}
                                level="L"
                                includeMargin={true}
                              />
                            </div>
                          </div>

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

          {!isloading && productos.length === 0 && remitoId && (
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
