// QrModal.jsx
"use client";
import { useState } from "react";

export const QrModal = ({ isOpen, onClose, qrContent }) => {
  if (!isOpen) return null;

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(qrContent)
      .then(() => {
        alert("¡Contenido copiado al portapapeles!");
      })
      .catch(() => {
        // fallback
        const textArea = document.createElement("textarea");
        textArea.value = qrContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert("¡Contenido copiado al portapapeles!");
      });
  };

  const isUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleOpenLink = () => {
    if (isUrl(qrContent)) {
      window.open(qrContent, "_blank");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-[1000] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-[90%] max-h-[80vh] shadow-2xl animate-slideIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-700 text-white px-5 py-3">
          <h2 className="text-lg font-semibold"> QR Code Escaneado</h2>
          <button
            onClick={onClose}
            className="text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block font-semibold text-gray-800 mb-2 text-lg">
              Contenido:
            </label>
            <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-3 font-mono text-sm text-gray-700 max-h-52 overflow-y-auto">
              {qrContent}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleCopyToClipboard}
              className="flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform hover:-translate-y-0.5"
            >
              Copiar
            </button>

            {isUrl(qrContent) && (
              <button
                onClick={handleOpenLink}
                className="flex-1 min-w-[120px] bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform hover:-translate-y-0.5"
              >
                Abrir Enlace
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 min-w-[120px] bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform hover:-translate-y-0.5"
            >
              ✅ Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
