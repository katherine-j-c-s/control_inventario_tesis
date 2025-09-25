"use client";
import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QrScanComponent() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("Esperando escaneo...");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Función para iniciar el scanner
  const startScanner = async () => {
    try {
      setIsScanning(true);
      
      if (videoRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("✅ QR escaneado:", result.data);
            setData(result.data);
            setOpen(false);
            stopScanner();
          },
          {
            preferredCamera: 'environment', // Cámara trasera
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        await qrScannerRef.current.start();
        setIsScanning(false);
      }
    } catch (error) {
      console.error("Error al iniciar scanner:", error);
      setIsScanning(false);
      alert("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  // Función para detener el scanner
  const stopScanner = () => {
    try {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      setIsScanning(false);
    } catch (error) {
      console.error("Error al detener scanner:", error);
    }
  };

  // Manejar toggle de cámara
  const handleToggleCamera = async () => {
    if (open) {
      stopScanner();
      setOpen(false);
    } else {
      setOpen(true);
      await startScanner();
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);


  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">Scanner QR</h3>
      
      {/* Botón principal */}
      <button
        onClick={handleToggleCamera}
        disabled={isScanning}
        className={`px-6 py-3 rounded-xl shadow-md transition-all duration-200 font-medium ${
          isScanning
            ? "bg-gray-400 cursor-not-allowed text-white"
            : open 
              ? "bg-red-600 hover:bg-red-700 text-white" 
              : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {isScanning ? "Iniciando..." : open ? "Cerrar cámara" : "Escanear producto"}
      </button>

      {/* Estado debug */}
      <div className="text-sm text-gray-600">
        Estado: {open ? "Cámara abierta" : "Cámara cerrada"}
        {isScanning && " - Iniciando..."}
      </div>

      {/* Mostrar datos escaneados */}
      {data !== "Esperando escaneo..." && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg w-full max-w-md">
          <h4 className="font-semibold text-green-800 mb-2">Código escaneado:</h4>
          <p className="text-green-700 break-all text-sm">{data}</p>
          <button
            onClick={() => setData("Esperando escaneo...")}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Cámara */}
      {open && (
        <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg">
          {isScanning && (
            <div className="flex items-center justify-center h-64 bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Iniciando cámara...</p>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover bg-black"
            style={{ display: isScanning ? 'none' : 'block' }}
          />

          {/* Botón de acción */}
          <div className="p-4 bg-gray-800 flex justify-center">
            <button
              onClick={() => {
                setOpen(false);
                stopScanner();
              }}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
