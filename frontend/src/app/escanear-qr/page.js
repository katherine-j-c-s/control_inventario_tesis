'use client';

import { AuthProvider } from '@/hooks/useAuth';
import QrScannerContent from './QrScannerContent';

export default function QrScannerPage() {
  return (
    <AuthProvider>
      <QrScannerContent />
    </AuthProvider>
  );
}
