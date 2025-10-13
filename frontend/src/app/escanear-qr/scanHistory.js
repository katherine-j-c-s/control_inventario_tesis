import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';



export function ScanHistory({ history }) {
  const [localHistory, setLocalHistory] = useState([]);
//para los 4 dias y luego resetea
  const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem('qrHistory')) || [];
    
    // Agregar los nuevos escaneos y filtrar por 4 días
    const combined = [...history, ...stored].filter(item => now - item.timestamp < FOUR_DAYS);

    localStorage.setItem('qrHistory', JSON.stringify(combined));
    setLocalHistory(combined.slice(0,100)); 
  }, [history]);

  const formatTimestamp = (timestamp) =>
    new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));

  const truncateText = (text, maxLength = 50) =>
    text.length > maxLength ? text.substring(0, maxLength) + '...' : text;

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  if (localHistory.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Escaneos
        </CardTitle>
        <CardDescription>Últimos códigos QR escaneados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {localHistory.map((scan) => (
            <div key={scan.timestamp} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{truncateText(scan.data)}</p>
                <p className="text-xs text-muted-foreground">{formatTimestamp(scan.timestamp)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(scan.data)}>
                Copiar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
