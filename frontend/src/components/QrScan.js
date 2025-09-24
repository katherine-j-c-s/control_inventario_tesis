"use client";
import { useState } from "react";
import { QrReader } from "@blackbox-vision/react-qr-reader";


export default function QrScanner() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("Esperando escaneo...");

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Botón para abrir/cerrar cámara */}
      <button
        onClick={() => setOpen(!open)}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition"
      >
        {open ? "Cerrar cámara" : "Escanear producto"}
      </button>

      {/* Componente del escáner */}
      {open && (
        <div className="w-full max-w-md overflow-hidden rounded-xl shadow-lg">
          <QrReader
            constraints={{ facingMode: "environment" }}
            onResult={(result, error) => {
              if (!!result) {
                setData(result?.text);
                setOpen(false); // 🔹 Cierra cámara después de leer
              }
              if (!!error) {
                console.info(error);
              }
            }}
            containerStyle={{ width: "100%" }}
          />
        </div>
      )}

      {/* Resultado del escaneo */}
      <p className="text-lg font-medium text-gray-800">
        Resultado: <span className="font-bold text-green-600">{data}</span>
      </p>
    </div>
  );
}
