import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LastScanCard({ lastScanResult }) {
  const formatTimestamp = (timestamp) =>
    new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Último Escaneo</CardTitle>
        <CardDescription>{formatTimestamp(lastScanResult.timestamp)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-mono break-all">{lastScanResult.data}</p>
        </div>
      </CardContent>
    </Card>
  );
}
