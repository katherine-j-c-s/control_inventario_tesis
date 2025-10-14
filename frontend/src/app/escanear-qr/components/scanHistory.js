import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';



export function ScanHistory({ history }) {
  const [localHistory, setLocalHistory] = useState([]);
//para los 4 dias y luego resetea
  const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem('qrHistory')) || [];
    
    // Crear un mapa para evitar duplicados basado en el ID
    const historyMap = new Map();
    
    // Agregar escaneos almacenados primero
    stored.forEach(item => {
      if (now - item.timestamp < FOUR_DAYS) {
        historyMap.set(item.id, item);
      }
    });
    
    // Agregar nuevos escaneos del historial
    history.forEach(item => {
      if (now - item.timestamp < FOUR_DAYS) {
        historyMap.set(item.id, item);
      }
    });
    
    
    const combined = Array.from(historyMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);

    // Guardar en localStorage
    localStorage.setItem('qrHistory', JSON.stringify(combined));
    setLocalHistory(combined);
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

  const clearHistory = () => {
    localStorage.removeItem('qrHistory');
    setLocalHistory([]);
  };

  if (localHistory.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historial de Escaneos
            </CardTitle>
            <CardDescription>Últimos códigos QR escaneados ({localHistory.length})</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearHistory}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar
          </Button>
        </div>
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
