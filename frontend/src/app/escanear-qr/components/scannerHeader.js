import { QrCode } from 'lucide-react';

export default function ScannerHeader() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <QrCode className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Escáner QR</h1>
      </div>
      <p className="text-muted-foreground">
        Escanea códigos QR para obtener información de productos, enlaces y más.
      </p>
    </div>
  );
}
