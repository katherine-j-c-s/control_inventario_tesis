"use client";
import * as React from "react";
import { useQrReader } from "./hooks";
import { QrModal } from "./QrModal";

export const QrReader = ({
  constraints,
  ViewFinder,
  scanDelay,
  className,
  onResult,
  videoId,
  buttonText = "Abrir Cámara",
}) => {
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [qrResult, setQrResult] = React.useState(null);
  const [showModal, setShowModal] = React.useState(false);

  console.log("QrReader render - isCameraActive:", isCameraActive);

  // Manejo de resultados QR
  const handleQrResult = React.useCallback(
    (result, error, codeReader) => {
      if (result) {
        const qrText = result?.text || result?.getText?.() || result;
        setQrResult(qrText);
        setShowModal(true);
        console.log("QR Code detectado:", qrText);
      }

      if (onResult) {
        onResult(result, error, codeReader);
      }
    },
    [onResult]
  );

  useQrReader({
    constraints,
    scanDelay,
    onResult: handleQrResult,
    videoId,
    isActive: isCameraActive,
  });

  const handleStartCamera = () => setIsCameraActive(true);

  const handleStopCamera = () => {
    console.log("Cerrando cámara...");
    const videoElement = document.getElementById(videoId);

    if (videoElement && videoElement.srcObject) {
      const stream = videoElement.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log("Deteniendo track:", track.kind, track.readyState);
        });
      }
      videoElement.srcObject = null;
      videoElement.load();
    }

    setIsCameraActive(false);
    console.log("Cámara cerrada, estado:", false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setQrResult(null);
  };

  return (
    <section className={className}>
      {!isCameraActive ? (
        //  Botón para abrir cámara
        <div className="flex justify-center items-center w-[300px] h-[200px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
          <button
            onClick={handleStartCamera}
            className="px-6 py-3 text-white font-semibold bg-blue-600 rounded-md shadow hover:bg-blue-700 transition"
          >
            {buttonText}
          </button>
        </div>
      ) : (
        //  Contenedor de la cámara
        <div className="relative w-[300px] h-[200px] bg-black rounded-lg overflow-hidden">
          {/* Botón cerrar arriba */}
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleStopCamera}
              title="Cerrar cámara"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/70 text-white text-lg hover:bg-black/90 transition"
            >
              ✕
            </button>
          </div>

          {!!ViewFinder && <ViewFinder />}

          {/* Video */}
          <video
            muted
            id={videoId}
            className={`absolute top-0 left-0 w-full h-full object-cover ${
              constraints?.facingMode === "user" ? "scale-x-[-1]" : ""
            }`}
          />

          {/* Indicador de escaneo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] border-[3px] border-blue-500/80 rounded-2xl pointer-events-none z-5 animate-pulseScan">
            <div className="absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-blue-500/80 animate-scanLine"></div>
          </div>

          {/* Botón cerrar abajo */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleStopCamera}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600/90 rounded-md shadow hover:bg-red-700 transition"
            >
              Cerrar Cámara
            </button>
          </div>
        </div>
      )}

      {/* Modal QR */}
      <QrModal isOpen={showModal} onClose={handleCloseModal} qrContent={qrResult} />
    </section>
  );
};

QrReader.displayName = "QrReader";

QrReader.defaultProps = {
  constraints: {
    facingMode: "user",
  },
  videoId: "video",
  scanDelay: 100,
};
