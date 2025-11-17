"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Package,
  Save,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import Layout from "@/components/layouts/Layout";

// Componentes locales
import ProductInfo from "./components/ProductInfo.js";
import EgresoForm from "./components/EgresoForm.js";
import AlertMessages from "./components/AlertMessages.js";
import SectionHeader from "./components/SectionHeader.js";
import ProductFilters from "./components/ProductFilters.js";
import ProductsTable from "./components/ProductsTable.js";
import useOutputProduct from "./components/useOutputProduct.js";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { productAPI } from "@/lib/api";

const OutputProductPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }
  const {
    formData,
    state,
    updateFormData,
    setProductInfo,
    setError,
    handleSubmit,
    resetForm,
  } = useOutputProduct();

  const { isLoading, error, success, productInfo } = state;

  // Estados para los filtros y productos
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showProductList, setShowProductList] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  // Cargar todos los productos al montar
  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await productAPI.getAllProducts();
      setAllProducts(response.data || []);
    } catch (err) {
      console.error("Error cargando productos:", err);
      setError("Error al cargar los productos");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleFiltersChange = (filters) => {
    const filtered = allProducts.filter((product) => {
      // Filtro por código
      if (filters.codigo && !product.codigo.toLowerCase().includes(filters.codigo.toLowerCase())) {
        return false;
      }

      // Filtro por nombre
      if (filters.nombre && !product.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) {
        return false;
      }

      // Filtro por almacén (usando ubicación como proxy)
      if (filters.warehouse_id !== "all") {
        // Aquí podrías implementar la lógica específica de almacén
        // Por ahora, filtramos por ubicación
        // Si tienes una relación directa con warehouses, ajusta esta parte
      }

      return true;
    });

    setFilteredProducts(filtered);
    setShowProductList(true);
    
    if (filtered.length === 0) {
      setError("No se encontraron productos con los filtros aplicados");
    }
  };

  const handleSelectProduct = (product) => {
    setProductInfo({
      id: product.id,
      nombre: product.nombre,
      codigo: product.codigo,
      categoria: product.categoria,
      stockActual: product.stock_actual,
      ubicacion: product.ubicacion,
      unidadMedida: product.unidad_medida,
      precioUnitario: product.precio_unitario,
    });
    setIsFormDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsFormDialogOpen(false);
    // No limpiamos el producto para mantener la selección visible en la tabla
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    // Si el submit fue exitoso, el hook useOutputProduct redirigirá
  };

  const handleCancelForm = () => {
    setIsFormDialogOpen(false);
    resetForm();
    setShowProductList(false);
    setFilteredProducts([]);
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex md:flex-row flex-col items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Egreso de Producto
            </h1>
            <p className="text-muted-foreground">
              Busque un producto y registre su salida del inventario
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar" : "Mostrar"} Filtros
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Alertas Globales */}
        <AlertMessages error={error} success={success} />

        {/* Sección de Filtros */}
        {showFilters && (
          <ProductFilters
            onFiltersChange={handleFiltersChange}
            disabled={isLoading || isLoadingProducts}
          />
        )}

        {/* Tabla de Productos Filtrados */}
        {showProductList ? (
          <ProductsTable
            products={filteredProducts}
            onSelectProduct={handleSelectProduct}
            isLoading={isLoadingProducts}
            selectedProductId={productInfo?.id}
          />
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Package className="h-20 w-20 text-muted-foreground/40" />
                <div>
                  <h3 className="font-semibold text-lg">Use los filtros para buscar productos</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete los campos de búsqueda arriba y presione "Buscar Productos"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog/Modal del Formulario de Egreso */}
        <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto border-0 w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-2xl flex items-center gap-2">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                Formulario de Egreso
              </DialogTitle>
              <DialogDescription>
                Complete los campos para registrar la salida del producto seleccionado
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-6 py-4">
                {/* Alertas dentro del dialog */}
                <AlertMessages error={error} success={success} />

                {/* Información del Producto Seleccionado */}
                <div className="space-y-4">
                  <SectionHeader
                    icon={Package}
                    title="Producto Seleccionado"
                  />

                  <ProductInfo
                    product={productInfo}
                    cantidad={formData.cantidad}
                    onCantidadChange={(value) =>
                      updateFormData({ cantidad: value })
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Detalles del Egreso */}
                <div className="space-y-4">
                  <EgresoForm
                    formData={formData}
                    onChange={updateFormData}
                    disabled={isLoading}
                    productInfo={productInfo}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 flex-col sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelForm}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>

                <Button type="submit" disabled={isLoading || !productInfo} className="w-full sm:w-auto">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Egreso
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default function OutputPage() {
  return (
    <AuthProvider>
      <OutputProductPage />
    </AuthProvider>
  );
}
