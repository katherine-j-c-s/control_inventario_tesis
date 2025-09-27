"use client";
import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { X, Camera } from "lucide-react";

export function OriginalWorkingScanner({ isOpen, onClose, onScanResult }) {
  const [data, setData] = useState("Esperando escaneo...");
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Función para detectar tipo de contenido
  const detectContentType = (content) => {
    if (!content || content === "Esperando escaneo...") return "text";
    
    // URLs de PDF
    if (content.toLowerCase().includes(".pdf") || content.toLowerCase().includes("pdf")) {
      return "pdf";
    }
    
    // URLs generales
    if (content.startsWith("http://") || content.startsWith("https://")) {
      return "url";
    }
    
    // Email
    if (content.includes("@") && content.includes(".")) {
      return "email";
    }
    
    // Teléfono
    if (/^\+?[\d\s\-\(\)]+$/.test(content)) {
      return "phone";
    }
    
    return "text";
  };

  // Inicializar scanner cuando el video esté listo - CÓDIGO ORIGINAL QUE FUNCIONABA
  useEffect(() => {
    if (isOpen && videoRef.current && !qrScannerRef.current) {
      const initScanner = async () => {
        try {
          // Pequeño delay para asegurar que el video esté completamente cargado
          setTimeout(async () => {
            if (videoRef.current && isOpen) {
              qrScannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                  console.log("✅ QR escaneado:", result.data || result);
                  const scannedData = result.data || result;
                  setData(scannedData);
                  setShowModal(true);
                  
                  // Llamar callback si existe
                  if (onScanResult) {
                    onScanResult(scannedData);
                  }
                },
                {
                  preferredCamera: 'environment',
                  highlightScanRegion: true,
                  highlightCodeOutline: true,
                  maxScansPerSecond: 5,
                  calculateScanRegion: (video) => {
                    const smallestDimension = Math.min(video.videoWidth, video.videoHeight);
                    const scanRegionSize = Math.round(0.7 * smallestDimension);
                    return {
                      x: Math.round((video.videoWidth - scanRegionSize) / 2),
                      y: Math.round((video.videoHeight - scanRegionSize) / 2),
                      width: scanRegionSize,
                      height: scanRegionSize,
                    };
                  },
                }
              );

              await qrScannerRef.current.start();
              console.log("Scanner iniciado correctamente");
            }
          }, 500);
        } catch (error) {
          console.error("Error al iniciar scanner:", error);
          alert("No se pudo acceder a la cámara. Verifica los permisos.");
        }
      };

      initScanner();
    }

    // Cleanup cuando se cierra
    if (!isOpen && qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  }, [isOpen, onScanResult]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Camera className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Escáner QR</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Cámara */}
          <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-lg bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          </div>

          {/* Mostrar datos escaneados */}
          {data !== "Esperando escaneo..." && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Código escaneado:</h4>
              <p className="text-green-700 break-all text-sm">{data}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setData("Esperando escaneo...");
                    setShowModal(false);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                >
                  Limpiar
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(data)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-4 text-center text-gray-600">
            <p className="text-sm">
              Apunta la cámara hacia un código QR para escanearlo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
