'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layouts/Layout';
import { OriginalWorkingScanner } from '@/components/QrScanner/OriginalWorkingScanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, QrCode, History, Info } from 'lucide-react';
import { motion } from 'framer-motion';

function QrScannerContent() {
  const { user } = useAuth();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [lastScanResult, setLastScanResult] = useState(null);

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
