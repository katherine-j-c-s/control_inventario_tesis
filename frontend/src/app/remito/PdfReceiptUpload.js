"use client";

import { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { receiptAPI } from "@/lib/api";

const PdfReceiptUpload = ({ onClose, onReceiptCreated }) => {
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
        
        if (onReceiptCreated) {
          onReceiptCreated();
        }
        
        setTimeout(() => {
          setUploading(false);
          setSelectedFile(null);
          setSuccess(null);
          if (onClose) onClose();
        }, 3000);
      } else {
        throw new Error(response.data.error || 'Error al procesar el archivo');
      }

    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      setFileError(`❌ Error al procesar el archivo: ${error.response?.data?.error || error.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {fileError && (
        <Alert variant="destructive">
          <AlertDescription>{fileError}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Archivo (PDF/Imagen/CSV)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-foreground"
            >
              Seleccionar archivo
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.csv,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 file:cursor-pointer cursor-pointer border border-input rounded-md p-2 bg-background"
            />
            <p className="text-xs text-muted-foreground">
              Máximo 10MB para PDFs/imágenes, 5MB para CSV. Formatos: PDF, JPG, PNG, GIF, CSV, TXT
            </p>
            <p className="text-xs text-muted-foreground">
              El sistema extraerá automáticamente los datos del remito y productos del archivo.
            </p>
            
          </div>

          {selectedFile && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium text-foreground">
                Archivo seleccionado: {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-xs text-muted-foreground">
                Tipo: {selectedFile.type}
              </p>
            </div>
          )}
          
          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Procesando archivo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Procesar Archivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PdfReceiptUpload;

