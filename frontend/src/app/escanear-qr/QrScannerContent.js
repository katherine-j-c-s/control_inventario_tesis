'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layouts/Layout';
import { OriginalWorkingScanner } from '@/components/QrScanner/OriginalWorkingScanner';
import { ScanHistory } from './components/scanHistory';
import InformationScanner from './components/informationScanner';
import ScannerHeader from './components/scannerHeader';
import ScannerCard from './components/scannerCard';
import LastScanCard from './components/lastScanCard';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

export default function QrScannerContent() {
  const { user } = useAuth();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  // Cargar historial desde localStorage al inicializar
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('qrHistory')) || [];
    const now = Date.now();
    const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
    
    //filtra de los ultimos 4 dias
    const validHistory = stored.filter(item => now - item.timestamp < FOUR_DAYS);
    setScanHistory(validHistory);
  }, []);

  const handleScanResult = (data) => {
    const now = Date.now();
    const scanRecord = {
      id: now,
      data,
      timestamp: now, 
      user: user?.nombre || 'Usuario',
    };

    setLastScanResult(scanRecord);
    setScanHistory((prev) => [scanRecord, ...prev.slice(0, 9)]);
    setIsOverlayOpen(false);

    try {
      const parsedData = JSON.parse(data);
      if (parsedData.id && parsedData.nombre) {
        setScannedData(parsedData);
        setIsModalOpen(true);
        return;
      }
    } catch (error) {}

    setScannedData({ type: 'text', content: data });
    setIsModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <ScannerHeader />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ScannerCard onOpenScanner={() => setIsOverlayOpen(true)} />
        </motion.div>

        {lastScanResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <LastScanCard lastScanResult={lastScanResult} />
          </motion.div>
        )}

        <ScanHistory history={scanHistory} />

        <OriginalWorkingScanner
          isOpen={isOverlayOpen}
          onClose={() => setIsOverlayOpen(false)}
          onScanResult={handleScanResult}
        />

        <InformationScanner
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          scannedData={scannedData}
          lastScanResult={lastScanResult}
        />
      </div>
    </Layout>
  );
}
