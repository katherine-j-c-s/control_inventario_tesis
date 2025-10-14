'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, QrCode, Package, Tag, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function InformationScanner({
  isModalOpen,
  setIsModalOpen,
  scannedData,
  lastScanResult,
}) {
  if (!scannedData) return null; 

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

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

  const renderProductInfo = (product) => (
    <div className="space-y-6">
      {/* Header del Producto */}
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{product?.nombre || 'Producto sin nombre'}</h3>
        {product?.descripcion && (
          <p className="text-muted-foreground text-sm max-w-md mx-auto">{product.descripcion}</p>
        )}
      </div>

      {/* Estado del Producto */}
      <div className="flex justify-center">
        <Badge 
          variant={product?.verificado ? "default" : "secondary"} 
          className={`px-4 py-2 text-sm ${product?.verificado ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {product?.verificado ? "Verificado" : "No Verificado"}
        </Badge>
      </div>

      <Separator />

      {/* Información Básica del Producto */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <Package className="h-5 w-5" /> Información Básica
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={Tag} label="ID del Producto" value={product?.id} />
          <InfoRow icon={Package} label="Categoría" value={product?.categoria} />
          <InfoRow icon={MapPin} label="Ubicación" value={product?.ubicacion} />
          <InfoRow icon={DollarSign} label="Precio Unitario" value={`$${product?.precio || 'N/A'}`} />
        </div>
      </div>

      <Separator />

      {/* Información de Inventario */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <Tag className="h-5 w-5" /> Inventario
        </h4>
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{product?.cantidad || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Cantidad {product?.unidad || ''}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                ${product?.precio ? (product.precio * (product.cantidad || 0)).toFixed(2) : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Valor Total</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Información del Remito */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" /> Información del Remito
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="ID del Remito" value={product?.remito_id} />
          <InfoRow label="Fecha del Remito" value={product?.fecha_remito ? formatDate(product.fecha_remito) : 'N/A'} />
        </div>
      </div>

      <Separator />

      {/* Información de Escaneo */}
      <div className="bg-muted/30 p-4 rounded-lg text-center">
        <p className="text-sm text-muted-foreground mb-1">Último escaneo</p>
        <p className="font-medium">{product?.timestamp ? formatDate(product.timestamp) : 'N/A'}</p>
      </div>
    </div>
  );

  
  const parseProductData = (content) => {
    try {
      // Intentar parsear como JSON
      const parsed = JSON.parse(content);
      
      // Mapear los campos del JSON a la estructura esperada
      return {
        id: parsed.i,
        nombre: parsed.n,
        descripcion: parsed.d,
        categoria: parsed.c,
        cantidad: parsed.q,
        unidad: parsed.u,
        precio: parsed.p,
        ubicacion: parsed.l || parsed['1'] || parsed.ubicacion, // Intentar múltiples campos para ubicación
        remito_id: parsed.r,
        fecha_remito: parsed.f,
        verificado: parsed.v,
        timestamp: parsed.t || lastScanResult?.timestamp
      };
    } catch (error) {
      // Si no es JSON válido, devolver null para mostrar como texto plano
      return null;
    }
  };

  const renderTextInfo = (data) => {
    const productData = parseProductData(data?.content);
    
    // Si se puede parsear como producto, mostrar como información de producto
    if (productData) {
      return renderProductInfo(productData);
    }

    // Si no es JSON válido, mostrar como texto plano
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold mb-2">Contenido Escaneado</h3>
          <p className="text-muted-foreground">Información de texto detectada</p>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Contenido:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-mono text-sm break-all whitespace-pre-wrap">{data?.content || 'Sin contenido'}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">Escaneado el</p>
            <p className="font-medium">
              {lastScanResult?.timestamp ? formatDate(lastScanResult.timestamp) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isModalOpen && scannedData !== null} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {scannedData?.type === 'text' ? (
              <>
                <QrCode className="h-5 w-5" /> Información Escaneada
              </>
            ) : (
              <>
                <Package className="h-5 w-5" /> Producto Escaneado
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {scannedData?.type === 'text'
              ? 'Contenido detectado en el código QR'
              : 'Información detallada del producto escaneado'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {scannedData?.type === 'text'
            ? renderTextInfo(scannedData)
            : renderProductInfo(scannedData)}
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
          <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
    {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />}
    <div className="flex-1 min-w-0">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="font-medium text-sm break-words">{value || 'N/A'}</p>
    </div>
  </div>
);
