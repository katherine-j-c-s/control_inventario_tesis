"use client";

import Layout from "@/components/layouts/Layout";
import { useEffect, useState } from "react";
import React from "react";
import api, { productAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  QrCode, 
  Download, 
  Search, 
  Package, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Tag,
  FileText,
  Hash
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";


export default function GenerateQR() {
  const [tipoBusqueda, setTipoBusqueda] = useState("remito"); // "remito" o "codigo"
  const [remitoId, setRemitoId] = useState("");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [productos, setProductos] = useState([]);
  const [isloading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  // Limpiar campos cuando cambia el tipo de búsqueda
  useEffect(() => {
    setRemitoId("");
    setCodigoProducto("");
    setProductos([]);
    setError(null);
    setSuccess(null);
  }, [tipoBusqueda]);

  const crearObjetoQRSimplificado = (producto) => ({
    i: producto.id,
    n: producto.nombre,
    d: producto.descripcion,
    c: producto.categoria,
    q: producto.cantidad,
    u: producto.unidad,
    p: producto.precio,
    l: producto.ubicacion,
    r: producto.receipt_id,
    f: producto.fecha_remito,
    v: producto.verificado,
    t: new Date().toISOString()
  });

  const buscarRemito = async () => {
    if (!remitoId.trim()) {
      setError("Por favor ingresa un ID de remito válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProductos([]);

    try {
      const response = await api.get(`/remitos/${remitoId}/productos`);
      const data = response.data;
      
      if (data.length === 0) {
        setError("El remito no tiene productos asociados");
        return;
      }
      
      const productosVerificados = data.filter(producto => producto.verificado === true);
      setProductos(productosVerificados);
      
      if (productosVerificados.length === 0) {
        setError("El remito no tiene productos verificados. Solo se pueden generar QR para productos verificados.");
      } else {
        setSuccess(`Se encontraron ${productosVerificados.length} productos verificados de ${data.length} productos totales`);
      }
    } catch (error) {
      console.error('Error buscando remito:', error);
      if (error.response?.status === 404) {
        setError("Remito no encontrado");
      } else {
        setError(`Error al buscar remito: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const buscarPorCodigo = async () => {
    if (!codigoProducto.trim()) {
      setError("Por favor ingresa un código de producto válido");
      return;
    }

    if (!user?.id) {
      setError("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProductos([]);

    try {
      // Buscar producto por código usando el mismo método que la página de egreso
      const producto = await productAPI.getProductByCode(codigoProducto.trim());
      
      if (!producto) {
        setError(`No se encontró ningún producto con el código "${codigoProducto.trim()}"`);
        return;
      }

      // Verificar si el producto está en algún remito
      const verificarRemitoResponse = await api.get(`/productos/${producto.id}/en-remito`);
      const { enRemito } = verificarRemitoResponse.data;

      if (enRemito) {
        setError("Este producto está asociado a un remito. Solo se pueden generar QR para productos ingresados manualmente (no de remitos).");
        return;
      }

      // Obtener movimientos del producto usando el endpoint que incluye movimientos
      // Este endpoint está en receiptRoutes.js y devuelve el producto con movimientos
      let productoCompleto = { movimientos: [] };
      try {
        const movimientosResponse = await api.get(`/productos/${producto.id}`);
        productoCompleto = movimientosResponse.data;
      } catch (err) {
        // Si falla, continuar sin movimientos
        console.warn('No se pudieron obtener movimientos, continuando sin ellos');
      }

      // Formatear el producto para que sea consistente con los productos de remito
      const productoFormateado = {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion || "",
        categoria: producto.categoria || "General",
        unidad: producto.unidad_medida || "unidad",
        precio: producto.precio_unitario || 0,
        cantidad: producto.stock_actual || 0,
        ubicacion: producto.ubicacion || "",
        codigo: producto.codigo,
        verificado: true, // Productos ingresados manualmente se consideran verificados
        receipt_id: null,
        fecha_remito: null,
        movimientos: productoCompleto.movimientos || []
      };

      // Convertir el producto único en un array para mantener consistencia
      setProductos([productoFormateado]);
      setSuccess(`Producto encontrado: ${producto.nombre}`);
    } catch (error) {
      console.error('Error buscando producto por código:', error);
      if (error.response?.status === 404) {
        setError("Producto no encontrado");
      } else {
        setError(`Error al buscar producto: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    if (tipoBusqueda === "remito") {
      buscarRemito();
    } else {
      buscarPorCodigo();
    }
  };

  const descargarQR = async (producto) => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '256px';
      tempDiv.style.height = '256px';
      document.body.appendChild(tempDiv);
      
      const qrContainer = document.createElement('div');
      qrContainer.id = `qr-temp-${producto.id}`;
      qrContainer.style.width = '256px';
      qrContainer.style.height = '256px';
      tempDiv.appendChild(qrContainer);
      
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(qrContainer);
      
      root.render(
        <QRCodeSVG
          value={JSON.stringify(crearObjetoQRSimplificado(producto))}
          size={256}
          level="M"
          includeMargin={true}
        />
      );
      
      setTimeout(() => {
        const qrElement = qrContainer.querySelector('svg');
        if (qrElement) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;

          const svgData = new XMLSerializer().serializeToString(qrElement);
          const img = new Image();
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `qr-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}-${producto.id}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              } else {
                setError('Error al generar el archivo de descarga');
              }
            }, 'image/png');
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } else {
          setError('Error al generar el código QR');
        }

        root.unmount();
        document.body.removeChild(tempDiv);
      }, 200);
      
    } catch (error) {
      console.error('Error descargando QR:', error);
      setError('Error al descargar el código QR');
    }
  };

  const descargarTodosQR = async () => {
    if (productos.length === 0) {
      setError("No hay productos para descargar");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Crear un nuevo documento PDF (A4: 210mm x 297mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210; // Ancho de A4 en mm
      const pageHeight = 297; // Alto de A4 en mm
      const margin = 10; // Margen en mm
      const qrSize = 50; // Tamaño de cada QR en mm
      const spacing = 5; // Espacio entre QRs en mm
      const cols = 3; // 3 columnas
      const rows = 4; // 4 filas por página
      const qrsPerPage = cols * rows; // 12 QR por página

      // Calcular el ancho disponible y posiciones
      const availableWidth = pageWidth - (2 * margin);
      const availableHeight = pageHeight - (2 * margin);
      const colWidth = (availableWidth - (spacing * (cols - 1))) / cols;
      const rowHeight = (availableHeight - (spacing * (rows - 1))) / rows;

      // Función auxiliar para convertir SVG a imagen
      const svgToImage = (svgElement) => {
        return new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 256;
          canvas.height = 256;

          const svgData = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();

          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              } else {
                reject(new Error('Error al convertir SVG a imagen'));
              }
            }, 'image/png');
          };

          img.onerror = reject;
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
      };

      // Función auxiliar para generar QR como imagen
      const generarQRImagen = async (producto) => {
        const { createRoot } = await import('react-dom/client');
        
        return new Promise((resolve, reject) => {
          const tempDiv = document.createElement('div');
          tempDiv.style.position = 'absolute';
          tempDiv.style.left = '-9999px';
          tempDiv.style.top = '-9999px';
          tempDiv.style.width = '256px';
          tempDiv.style.height = '256px';
          document.body.appendChild(tempDiv);

          const qrContainer = document.createElement('div');
          qrContainer.id = `qr-temp-${producto.id}`;
          qrContainer.style.width = '256px';
          qrContainer.style.height = '256px';
          tempDiv.appendChild(qrContainer);

          const root = createRoot(qrContainer);

          root.render(
            React.createElement(QRCodeSVG, {
              value: JSON.stringify(crearObjetoQRSimplificado(producto)),
              size: 256,
              level: "M",
              includeMargin: true
            }, null)
          );

          setTimeout(() => {
            const qrElement = qrContainer.querySelector('svg');
            if (qrElement) {
              svgToImage(qrElement)
                .then((dataUrl) => {
                  root.unmount();
                  document.body.removeChild(tempDiv);
                  resolve(dataUrl);
                })
                .catch((err) => {
                  root.unmount();
                  document.body.removeChild(tempDiv);
                  reject(err);
                });
            } else {
              root.unmount();
              document.body.removeChild(tempDiv);
              reject(new Error('No se pudo generar el QR'));
            }
          }, 200);
        });
      };

      // Generar todas las imágenes de QR
      const qrImages = [];
      for (const producto of productos) {
        try {
          const imageData = await generarQRImagen(producto);
          qrImages.push({
            image: imageData,
            producto: producto
          });
        } catch (err) {
          console.error(`Error generando QR para ${producto.nombre}:`, err);
        }
      }

      if (qrImages.length === 0) {
        setError("No se pudieron generar los códigos QR");
        setLoading(false);
        return;
      }

      // Agregar QRs al PDF
      let currentPage = 0;
      let qrIndex = 0;

      for (let i = 0; i < qrImages.length; i++) {
        const { image, producto } = qrImages[i];
        const pageIndex = Math.floor(i / qrsPerPage);

        // Agregar nueva página si es necesario
        if (pageIndex > currentPage) {
          doc.addPage();
          currentPage = pageIndex;
        }

        // Calcular posición en la grilla
        const positionInPage = i % qrsPerPage;
        const col = positionInPage % cols;
        const row = Math.floor(positionInPage / cols);

        // Calcular coordenadas
        const x = margin + (col * (colWidth + spacing)) + (colWidth - qrSize) / 2;
        const y = margin + (row * (rowHeight + spacing)) + (rowHeight - qrSize) / 2;

        // Agregar imagen del QR
        doc.addImage(image, 'PNG', x, y, qrSize, qrSize);

        // Agregar nombre del producto debajo del QR (opcional, más pequeño)
        const textY = y + qrSize + 3;
        const nombreCorto = producto.nombre.length > 20 
          ? producto.nombre.substring(0, 17) + '...' 
          : producto.nombre;
        
        doc.setFontSize(8);
        doc.text(nombreCorto, x + qrSize / 2, textY, {
          align: 'center',
          maxWidth: qrSize
        });
      }

      // Descargar el PDF
      const fileName = tipoBusqueda === "remito" 
        ? `qr-remito-${remitoId}.pdf`
        : `qr-productos-${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(fileName);
      setSuccess(`PDF generado exitosamente con ${qrImages.length} códigos QR`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF con los códigos QR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-start mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-start justify-start">
              Generador de Códigos QR
            </h1>
            <p className="text-muted-foreground">
              Genera códigos QR para productos verificados de un remito o productos ingresados manualmente
            </p>
          </div>

          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Buscar Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tipoBusqueda" className="text-foreground">
                    Tipo de Búsqueda
                  </Label>
                  <Select value={tipoBusqueda} onValueChange={setTipoBusqueda}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el tipo de búsqueda" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remito">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Por ID de Remito
                        </div>
                      </SelectItem>
                      <SelectItem value="codigo">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 mr-2" />
                          Por Código de Producto
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoBusqueda === "remito" ? (
                  <div>
                    <Label htmlFor="remitoId" className="text-foreground">
                      ID del Remito
                    </Label>
                    <Input
                      id="remitoId"
                      type="number"
                      placeholder="Ingresa el ID del remito"
                      value={remitoId}
                      onChange={(e) => setRemitoId(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="codigoProducto" className="text-foreground">
                      Código del Producto
                    </Label>
                    <Input
                      id="codigoProducto"
                      type="text"
                      placeholder="Ingresa el código del producto"
                      value={codigoProducto}
                      onChange={(e) => setCodigoProducto(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Solo se mostrarán productos ingresados manualmente por ti (no de remitos)
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleBuscar}
                  disabled={isloading || (tipoBusqueda === "remito" ? !remitoId.trim() : !codigoProducto.trim())}
                  className="w-full"
                >
                  {isloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {tipoBusqueda === "remito" ? "Buscando Remito..." : "Buscando Producto..."}
                    </>
                  ) : (
                    <>
                      {tipoBusqueda === "remito" ? (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Buscar Remito
                        </>
                      ) : (
                        <>
                          <Hash className="w-4 h-4 mr-2" />
                          Buscar Producto
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {success}
              </AlertDescription>
            </Alert>
          )}

          {productos.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex md:flex-row flex-col items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Package className="w-5 h-5 mr-2 md:flex hidden" />
                    {tipoBusqueda === "remito" 
                      ? `Productos Verificados del Remito #${remitoId} (${productos.length})`
                      : `Producto Encontrado (${productos.length})`
                    }
                  </CardTitle>
                  <Button 
                    onClick={descargarTodosQR}
                    variant="outline"
                    className="mt-4 md:mt-0"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Todos los QR
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productos.map((producto) => (
                    <Card key={producto.id} className="bg-muted/50 border-border">
                      <CardContent className="p-4">
                        <div className="text-center space-y-4">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {producto.nombre}
                            </h3>
                            {producto.descripcion && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {producto.descripcion}
                              </p>
                            )}
                            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <Tag className="w-3 h-3 mr-1" />
                                {producto.cantidad} {producto.unidad}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <div className="bg-card p-2 rounded-lg border border-border shadow-sm">
                              <QRCodeSVG
                                value={JSON.stringify(crearObjetoQRSimplificado(producto))}
                                size={128}
                                level="L"
                                includeMargin={true}
                              />
                            </div>
                          </div>

                          {producto.movimientos && producto.movimientos.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              <p className="font-medium">Movimientos:</p>
                              <ul className="mt-1 space-y-1">
                                {producto.movimientos.map((mov, idx) => (
                                  <li key={idx} className="flex justify-between">
                                    <span>{mov.tipo}</span>
                                    <span>{new Date(mov.fecha).toLocaleDateString()}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <Button 
                            onClick={() => descargarQR(producto)}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar QR
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isloading && productos.length === 0 && (tipoBusqueda === "remito" ? remitoId : codigoProducto) && (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {tipoBusqueda === "remito" ? "No hay productos verificados" : "Producto no encontrado"}
                </h3>
                <p className="text-muted-foreground">
                  {tipoBusqueda === "remito" 
                    ? `El remito #${remitoId} no tiene productos verificados para generar códigos QR`
                    : `No se encontró un producto con el código "${codigoProducto}" ingresado manualmente por ti`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
