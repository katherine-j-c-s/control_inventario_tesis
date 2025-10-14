import { Camera, QrCode, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ScannerCard({ onOpenScanner }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2">
          <Camera className="h-6 w-6" /> Iniciar Escaneo
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

        <Button size="lg" onClick={onOpenScanner} className="w-full max-w-xs">
          <Camera className="mr-2 h-5 w-5" /> Abrir Escáner
        </Button>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Asegúrate de permitir el acceso a la cámara. El escáner puede leer códigos QR con
            información de productos, enlaces web, números de teléfono y más.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
