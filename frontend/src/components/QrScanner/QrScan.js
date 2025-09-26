"use client";
import { useState, useEffect, useRef } from "react";
import QrScanner from "qr-scanner";

export default function QrScanComponent() {
  const [open, setOpen] = useState(false);
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

  // Inicializar scanner cuando el video esté listo
  useEffect(() => {
    if (open && videoRef.current && !qrScannerRef.current) {
      const initScanner = async () => {
        try {
          // Pequeño delay para asegurar que el video esté completamente cargado
          setTimeout(async () => {
            if (videoRef.current && open) {
              qrScannerRef.current = new QrScanner(
                videoRef.current,
                (result) => {
                  console.log("✅ QR escaneado:", result.data || result);
                  setData(result.data || result);
                  setOpen(false);
                  setShowModal(true);
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
          setOpen(false);
        }
      };

      initScanner();
    }

    // Cleanup cuando se cierra
    if (!open && qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  }, [open]);

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

  return (
    <div className="flex flex-col items-center p-6  text-white rounded-lg ">
      {/* Solo el botón */}
      <button
        onClick={() => setOpen(!open)}
        className={`px-6 py-3 rounded-xl  transition-all duration-200 font-medium ${
          open 
            ? "bg-gray-400 hover:bg-gray-400 text-white" 
            : " text-white"
        }`}
      >
        {open ? "Cerrar cámara" : "Escanear producto"}
      </button>

      {/* Mostrar datos escaneados */}
      {data !== "Esperando escaneo..." && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full max-w-md">
          <h4 className="font-semibold text-green-800 mb-2">Código escaneado:</h4>
          <p className="text-green-700 break-all text-sm">{data}</p>
          <button
            onClick={() => {
              setData("Esperando escaneo...");
              setShowModal(false);
            }}
            className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
          >
            Limpiar
          </button>
        </div>
      )}

      {/* Cámara */}
      {open && (
        <div className="mt-4 w-full max-w-md overflow-hidden rounded-xl shadow-lg bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover"
          />
          
          <div className="p-4 bg-gray-800 flex justify-center">
            {/* <button
              onClick={() => setOpen(false)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
            >
              Cerrar
            </button> */}
          </div>
        </div>
      )}

      {/* Modal para mostrar datos del QR */}
      {showModal && data !== "Esperando escaneo..." && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header de la modal */}
            <div className="p-6 bg-gradient-to-r from-gray-600 to-gray-700 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Datos del QR Escaneado</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-100 text-sm mt-1">
                Tipo: {detectContentType(data).toUpperCase()}
              </p>
            </div>

            {/* Contenido de la modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {(() => {
                const contentType = detectContentType(data);
                
                switch (contentType) {
                  case 'pdf':
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <svg className="w-8 h-8 text-red-600 mr-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-red-800">Documento PDF</h3>
                              <p className="text-red-600 text-sm">Click para abrir el documento</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-gray-800 break-all text-sm font-mono">{data}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <a
                              href={data}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                            >
                              Abrir PDF
                            </a>
                            <button
                              onClick={() => navigator.clipboard.writeText(data)}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                              Copiar URL
                            </button>
                          </div>
                        </div>
                      </div>
                    );

                  case 'url':
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-gray-800">Enlace Web</h3>
                              <p className="text-gray-600 text-sm">Click para visitar la página</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-gray-800 break-all text-sm font-mono">{data}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <a
                              href={data}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                              Visitar Sitio
                            </a>
                            <button
                              onClick={() => navigator.clipboard.writeText(data)}
                              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition text-sm"
                            >
                              Copiar URL
                            </button>
                          </div>
                        </div>
                      </div>
                    );

                  case 'email':
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-green-800">Correo Electrónico</h3>
                              <p className="text-green-600 text-sm">Click para enviar email</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-gray-800 break-all text-sm font-mono">{data}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <a
                              href={`mailto:${data}`}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                            >
                              Enviar Email
                            </a>
                            <button
                              onClick={() => navigator.clipboard.writeText(data)}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                              Copiar Email
                            </button>
                          </div>
                        </div>
                      </div>
                    );

                  case 'phone':
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-yellow-800">Número de Teléfono</h3>
                              <p className="text-yellow-600 text-sm">Click para llamar</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <p className="text-gray-800 break-all text-sm font-mono">{data}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <a
                              href={`tel:${data}`}
                              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition text-sm"
                            >
                              Llamar
                            </a>
                            <button
                              onClick={() => navigator.clipboard.writeText(data)}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                              Copiar Número
                            </button>
                          </div>
                        </div>
                      </div>
                    );

                  default:
                    return (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center mb-3">
                            <svg className="w-8 h-8 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <h3 className="font-semibold text-gray-800">Texto</h3>
                              <p className="text-gray-600 text-sm">Contenido del código QR</p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <p className="text-gray-800 break-all whitespace-pre-wrap">{data}</p>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => navigator.clipboard.writeText(data)}
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
                            >
                              Copiar Texto
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                }
              })()}
            </div>

            {/* Footer de la modal */}
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setData("Esperando escaneo...");
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
              >
                Limpiar y Cerrar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
