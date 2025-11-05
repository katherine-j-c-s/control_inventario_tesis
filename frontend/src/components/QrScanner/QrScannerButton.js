'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OriginalWorkingScanner } from './OriginalWorkingScanner';
import { Camera, QrCode } from 'lucide-react';

// Componente para botón que abre el escáner QR
export function QrScannerButton({ 
  onScanResult, 
  variant = 'default', 
  size = 'default',
  className = '',
  children,
  showIcon = true,
  ...props 
}) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleScanResult = (data) => {
    if (onScanResult) {
      onScanResult(data);
    }
    setIsOverlayOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOverlayOpen(true)}
        {...props}
      >
        {showIcon && <QrCode className="mr-2 h-4 w-4" />}
        {children || 'Escanear QR'}
      </Button>

      <OriginalWorkingScanner
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onScanResult={handleScanResult}
      />
    </>
  );
}

// Componente para botón flotante que abre el escáner QR
export function FloatingQrScannerButton({ onScanResult, className = '' }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const handleScanResult = (data) => {
    if (onScanResult) {
      onScanResult(data);
    }
    setIsOverlayOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 ${className}`}
        onClick={() => setIsOverlayOpen(true)}
      >
        <Camera className="h-6 w-6" />
      </Button>

      <OriginalWorkingScanner
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        onScanResult={handleScanResult}
      />
    </>
  );
}
