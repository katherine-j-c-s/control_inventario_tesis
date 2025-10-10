"use client";

import React, { useState } from "react";
import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LoadReceipt from "./LoadReceipt";
import { receiptAPI } from "@/lib/api";

const ModalRemito = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileError(null);
    setSuccess(null);
    
    if (file) {
      const validTypes = [
        'application/pdf',
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif',
        'text/csv', 
        'text/plain', 
        'application/csv'
      ];
      const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.txt'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        setFileError('Por favor, selecciona un archivo PDF, imagen o CSV válido');
        setSelectedFile(null);
        return;
      }
      
      const maxSize = file.type === 'application/pdf' || file.type.startsWith('image/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeMB = file.type === 'application/pdf' || file.type.startsWith('image/') ? '10MB' : '5MB';
        setFileError(`El archivo es demasiado grande. Máximo ${maxSizeMB}`);
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setFileError('Por favor, selecciona un archivo');
      return;
    }

    setUploading(true);
    setFileError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('warehouse_id', '1');
      formData.append('entry_date', new Date().toISOString().split('T')[0]);
      formData.append('status', 'Pending');
      
      console.log('Enviando archivo:', selectedFile.name, 'Tipo:', selectedFile.type);
      
      const response = await receiptAPI.uploadReceiptFile(formData);
      
      if (response.data.success) {
        console.log('Archivo procesado correctamente:', response.data.message);
        setSuccess(`✅ ${response.data.message}`);
        
        setTimeout(() => {
          setUploading(false);
          onClose();
          setSelectedFile(null);
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Error al procesar el archivo');
      }

    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setFileError(`Error al procesar el archivo: ${error.response?.data?.error || error.message}`);
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFileError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return React.createElement(
    "div",
    { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" },
    React.createElement(
      "div",
      { className: "bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" },
      // Header del modal
      React.createElement(
        "div",
        { className: "flex items-center justify-between p-6 border-b border-border" },
        React.createElement("h2", { className: "text-2xl font-bold text-foreground" }, "Cargar Remito"),
        React.createElement(Button, {
          variant: "ghost",
          size: "sm",
          onClick: handleClose,
          className: "h-8 w-8 p-0"
        }, React.createElement(X, { className: "h-4 w-4" }))
      ),
      // Contenido del modal
      React.createElement(
        "div",
        { className: "p-6 space-y-6" },
        // Opción 1: Carga manual
        React.createElement(Card, null,
          React.createElement(CardHeader, null,
            React.createElement(CardTitle, { className: "flex items-center gap-2" },
              React.createElement(FileText, { className: "h-5 w-5" }),
              "Carga Manual"
            )
          ),
          React.createElement(CardContent, null,
            React.createElement(LoadReceipt, { onClose: onClose })
          )
        ),
        // Opción 2: Carga de archivo PDF
        React.createElement(Card, null,
          React.createElement(CardHeader, null,
            React.createElement(CardTitle, { className: "flex items-center gap-2" },
              React.createElement(Upload, { className: "h-5 w-5" }),
              "Subir Archivo (PDF/Imagen/CSV)"
            )
          ),
          React.createElement(CardContent, { className: "space-y-4" },
            React.createElement(
              "div",
              { className: "space-y-2" },
              React.createElement("label", {
                htmlFor: "file-upload",
                className: "block text-sm font-medium text-foreground"
              }, "Seleccionar archivo"),
              React.createElement("input", {
                id: "file-upload",
                type: "file",
                accept: ".pdf,.jpg,.jpeg,.png,.gif,.csv,.txt",
                onChange: handleFileChange,
                className: "block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 file:cursor-pointer cursor-pointer border border-input rounded-md p-2 bg-background"
              }),
              React.createElement("p", { className: "text-xs text-muted-foreground" },
                "Máximo 10MB para PDFs/imágenes, 5MB para CSV. Formatos: PDF, JPG, PNG, GIF, CSV, TXT"
              ),
              React.createElement("p", { className: "text-xs text-muted-foreground" },
                "El sistema extraerá automáticamente los datos del remito y productos del archivo."
              ),
              React.createElement("div", { className: "flex gap-2" },
                React.createElement("a", {
                  href: "/remito/template.csv",
                  download: "plantilla-remito.csv",
                  className: "text-xs text-blue-600 hover:text-blue-800 underline"
                }, "Descargar plantilla CSV")
              )
            ),
            fileError && React.createElement(Alert, { variant: "destructive" },
              React.createElement(AlertDescription, null, fileError)
            ),
            success && React.createElement(Alert, { className: "border-green-500 bg-green-50" },
              React.createElement(AlertDescription, { className: "text-green-700" }, success)
            ),
            selectedFile && React.createElement(
              "div",
              { className: "p-3 bg-muted rounded-md" },
              React.createElement("p", { className: "text-sm font-medium text-foreground" },
                `Archivo seleccionado: ${selectedFile.name}`
              ),
              React.createElement("p", { className: "text-xs text-muted-foreground" },
                `Tamaño: ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
              ),
              React.createElement("p", { className: "text-xs text-muted-foreground" },
                `Tipo: ${selectedFile.type}`
              )
            ),
            React.createElement(Button, {
              onClick: handleFileUpload,
              disabled: !selectedFile || uploading,
              className: "w-full"
            }, uploading ? React.createElement(React.Fragment, null,
              React.createElement("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }),
              "Procesando archivo..."
            ) : React.createElement(React.Fragment, null,
              React.createElement(Upload, { className: "h-4 w-4 mr-2" }),
              "Procesar Archivo"
            ))
          )
        )
      ),
      // Footer del modal
      React.createElement(
        "div",
        { className: "flex justify-end gap-3 p-6 border-t border-border" },
        React.createElement(Button, { variant: "outline", onClick: handleClose }, "Cerrar")
      )
    )
  );
};

export default ModalRemito;
