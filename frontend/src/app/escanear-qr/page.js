'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layouts/Layout';
import { OriginalWorkingScanner } from '@/components/QrScanner/OriginalWorkingScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, QrCode, History, Info, Package, Calendar, MapPin, Tag, DollarSign, CheckCircle, X, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

function QrScannerContent() {
  const { user } = useAuth();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const handleScanResult = (data) => {
    const scanRecord = {
      id: Date.now(),
      data,
      timestamp: new Date(),
      user: user?.nombre || 'Usuario'
    };
    
    setLastScanResult(scanRecord);
    setScanHistory(prev => [scanRecord, ...prev.slice(0, 9)]); // Mantener solo los últimos 10
    setIsOverlayOpen(false);
    
    // Intentar parsear como JSON de producto
    try {
      const parsedData = JSON.parse(data);
      if (parsedData.id && parsedData.nombre) {
        setScannedData(parsedData);
        setIsModalOpen(true);
        return;
      }
    } catch (error) {
      // No es JSON válido, tratar como texto plano
    }
    
    // Si no es un producto, mostrar datos como texto
    setScannedData({ type: 'text', content: data });
    setIsModalOpen(true);
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const truncateText = (text, maxLength = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderProductInfo = (product) => {
    if (!product) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay información de producto disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header del producto */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">{product.nombre || 'Producto sin nombre'}</h3>
          {product.descripcion && (
            <p className="text-muted-foreground">{product.descripcion}</p>
          )}
        </div>

      <Separator />

      {/* Información del producto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">ID del Producto</p>
              <p className="font-medium">{product.id || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Categoría</p>
              <p className="font-medium">{product.categoria || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Ubicación</p>
              <p className="font-medium">{product.ubicacion || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Cantidad</p>
              <p className="font-medium">{product.cantidad || 'N/A'} {product.unidad || ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Precio</p>
              <p className="font-medium">${product.precio || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge variant={product.verificado ? "default" : "secondary"}>
                {product.verificado ? "Verificado" : "No Verificado"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Información del remito */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Información del Remito
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">ID del Remito</p>
            <p className="font-medium">{product.remito_id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha del Remito</p>
            <p className="font-medium">{product.fecha_remito ? formatDate(product.fecha_remito) : 'N/A'}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Timestamp de escaneo */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Escaneado el</p>
        <p className="font-medium">{product.timestamp ? formatDate(product.timestamp) : 'N/A'}</p>
      </div>
    </div>
    );
  };

  const renderTextInfo = (data) => {
    if (!data) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay información de texto disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Contenido Escaneado</h3>
          <p className="text-muted-foreground">Información de texto detectada</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Contenido:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-sm break-all">{data.content || 'Sin contenido'}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Escaneado el</p>
            <p className="font-medium">{lastScanResult?.timestamp ? formatTimestamp(lastScanResult.timestamp) : 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Escáner QR</h1>
          </div>
          <p className="text-muted-foreground">
            Escanea códigos QR para obtener información de productos, enlaces y más.
          </p>
        </motion.div>

        {/* Main Scanner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Camera className="h-6 w-6" />
                Iniciar Escaneo
              </CardTitle>
              <CardDescription>
                Haz clic en el botón para abrir la cámara y escanear un código QR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => setIsOverlayOpen(true)}
                className="w-full max-w-xs"
              >
                <Camera className="mr-2 h-5 w-5" />
                Abrir Escáner
              </Button>

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Asegúrate de permitir el acceso a la cámara cuando se te solicite.
                  El escáner puede leer códigos QR con información de productos, enlaces web, 
                  números de teléfono y más.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        {/* Last Scan Result */}
        {lastScanResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Último Escaneo</CardTitle>
                <CardDescription>
                  {formatTimestamp(lastScanResult.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-mono break-all">
                    {lastScanResult.data}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial de Escaneos
                </CardTitle>
                <CardDescription>
                  Últimos códigos QR escaneados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scanHistory.map((scan) => (
                    <div 
                      key={scan.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {truncateText(scan.data)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(scan.timestamp)}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(scan.data)}
                      >
                        Copiar
                      </Button>
                    </div>
                  ))}
                </div>
                
                {scanHistory.length >= 10 && (
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Mostrando los últimos 10 escaneos
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* QR Scanner Overlay */}
        <OriginalWorkingScanner
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          onScanResult={handleScanResult}
        />

        {/* Modal de información escaneada */}
        <Dialog open={isModalOpen && scannedData !== null} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {scannedData?.type === 'text' ? (
                  <>
                    <QrCode className="h-5 w-5" />
                    Información Escaneada
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5" />
                    Producto Escaneado
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {scannedData?.type === 'text' 
                  ? 'Contenido detectado en el código QR'
                  : 'Información detallada del producto escaneado'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              {scannedData?.type === 'text' 
                ? renderTextInfo(scannedData)
                : renderProductInfo(scannedData)
              }
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(lastScanResult?.data || '')}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar Datos
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default function QrScannerPage() {
  return (
    <AuthProvider>
      <QrScannerContent />
    </AuthProvider>
  );
}
