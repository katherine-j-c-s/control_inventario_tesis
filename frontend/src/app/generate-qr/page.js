"use client";

import Layout from "@/components/layouts/Layout";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Download, 
  Search, 
  Package, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText,
  Hash,
  Calendar,
  Tag
} from "lucide-react";

export default function GenerateQR() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  
  // Estados para búsqueda por remito
  const [remitoId, setRemitoId] = useState("");
  const [productos, setProductos] = useState([]);
  
  // Estados para búsqueda por producto
  const [productoId, setProductoId] = useState("");
  const [producto, setProducto] = useState(null);
  
  // Estados generales
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("remito");

  // Cargar productos por remito
  const cargarProductos = async () => {
    if (!remitoId.trim()) {
      setError("Por favor ingresa un ID de remito válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/remitos/${remitoId}/productos`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProductos(data);
      setSuccess(`Se cargaron ${data.length} productos con códigos QR`);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError(`Error al cargar productos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cargar producto específico por ID
  const cargarProducto = async () => {
    if (!productoId.trim()) {
      setError("Por favor ingresa un ID de producto válido");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/productos/${productoId}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProducto(data);
      setSuccess(`Producto cargado correctamente con código QR`);
    } catch (error) {
      console.error('Error cargando producto:', error);
      setError(`Error al cargar producto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const descargarQR = (producto) => {
    const link = document.createElement('a');
    link.href = producto.qrDataUrl;
    link.download = `qr-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const descargarTodosQR = () => {
    productos.forEach((producto, index) => {
      setTimeout(() => {
        descargarQR(producto);
      }, index * 500); // Descargar uno cada 500ms para evitar problemas
    });
  };

  // Descargar PDF de un producto
  const descargarPDF = async (producto) => {
    try {
      const response = await fetch(`/api/productos/${producto.id}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrDataUrl: producto.qrDataUrl,
          productoData: producto
        })
      });

      if (!response.ok) {
        throw new Error('Error generando PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `producto-${producto.id}-qr.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      setError('Error al generar PDF');
    }
  };

  // Cargar remito desde parámetros de URL
  useEffect(() => {
    const remitoIdFromUrl = searchParams.get('remitoId');
    if (remitoIdFromUrl) {
      setRemitoId(remitoIdFromUrl);
      setActiveTab('remito');
      // Auto-cargar productos si viene de verificación
      setTimeout(() => {
        cargarProductos();
      }, 1000);
    }
  }, [searchParams]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center">
              <QrCode className="w-8 h-8 mr-3 text-blue-600" />
              Generador de Códigos QR
            </h1>
            <p className="text-muted-foreground">
              Genera códigos QR para productos individuales o por remito completo
            </p>
          </div>

          {/* Tabs para diferentes tipos de búsqueda */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="remito" className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Por Remito
              </TabsTrigger>
              <TabsTrigger value="producto" className="flex items-center">
                <Hash className="w-4 h-4 mr-2" />
                Por Producto
              </TabsTrigger>
            </TabsList>

            {/* Tab: Búsqueda por Remito */}
            <TabsContent value="remito">
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Productos por Remito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                    
                    <Button 
                      onClick={cargarProductos}
                      disabled={loading || !remitoId.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cargando Productos...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Cargar Productos con QR
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Búsqueda por Producto */}
            <TabsContent value="producto">
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar Producto por ID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="productoId" className="text-foreground">
                        ID del Producto
                      </Label>
                      <Input
                        id="productoId"
                        type="number"
                        placeholder="Ingresa el ID del producto"
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <Button 
                      onClick={cargarProducto}
                      disabled={loading || !productoId.trim()}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Cargando Producto...
                        </>
                      ) : (
                        <>
                          <Hash className="w-4 h-4 mr-2" />
                          Cargar Producto con QR
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Alertas */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de productos con QR (por remito) */}
          {productos.length > 0 && activeTab === 'remito' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Productos del Remito #{remitoId} ({productos.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={descargarTodosQR}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar QR Todos
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productos.map((producto) => (
                    <Card key={producto.id} className="bg-muted/50 border-border">
                      <CardContent className="p-4">
                        <div className="text-center space-y-4">
                          {/* Información del producto */}
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

                          {/* Código QR */}
                          <div className="flex justify-center">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <img 
                                src={producto.qrDataUrl} 
                                alt={`QR de ${producto.nombre}`}
                                className="w-32 h-32"
                              />
                            </div>
                          </div>

                          {/* Información del QR */}
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

                          {/* Botones de descarga */}
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => descargarQR(producto)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              QR
                            </Button>
                            <Button 
                              onClick={() => descargarPDF(producto)}
                              variant="default"
                              size="sm"
                              className="flex-1"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Producto individual con QR */}
          {producto && activeTab === 'producto' && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                  <Hash className="w-5 h-5 mr-2" />
                  Producto #{producto.id} - {producto.nombre}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <div className="text-center space-y-6">
                    {/* Información detallada del producto */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground text-xl">
                        {producto.nombre}
                      </h3>
                      <p className="text-muted-foreground">
                        {producto.descripcion}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">ID:</span>
                          <span className="font-medium">{producto.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Cantidad:</span>
                          <span className="font-medium">{producto.cantidad} {producto.unidad}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Categoría:</span>
                          <span className="font-medium">{producto.categoria}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Precio:</span>
                          <span className="font-medium">${producto.precio}</span>
                        </div>
                      </div>
                    </div>

                    {/* Código QR */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <img 
                          src={producto.qrDataUrl} 
                          alt={`QR de ${producto.nombre}`}
                          className="w-48 h-48"
                        />
                      </div>
                    </div>

                    {/* Información del QR */}
                    {producto.movimientos && producto.movimientos.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Movimientos:</p>
                        <ul className="space-y-1">
                          {producto.movimientos.map((mov, idx) => (
                            <li key={idx} className="flex justify-between items-center">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {mov.tipo}
                              </span>
                              <span>{new Date(mov.fecha).toLocaleDateString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Botones de descarga */}
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => descargarQR(producto)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar QR
                      </Button>
                      <Button 
                        onClick={() => descargarPDF(producto)}
                        variant="default"
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado vacío para remito */}
          {!loading && productos.length === 0 && remitoId && activeTab === 'remito' && (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-muted-foreground">
                  No hay productos asociados al remito #{remitoId}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Estado vacío para producto */}
          {!loading && !producto && productoId && activeTab === 'producto' && (
            <Card className="bg-card border-border">
              <CardContent className="text-center py-12">
                <Hash className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Producto no encontrado
                </h3>
                <p className="text-muted-foreground">
                  No se encontró un producto con ID #{productoId}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}