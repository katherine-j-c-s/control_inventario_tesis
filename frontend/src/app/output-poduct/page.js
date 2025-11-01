"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  ArrowUpRight,
  Calendar,
  User,
  Save,
  ArrowLeft,
} from "lucide-react";
import Layout from "@/components/layouts/Layout";

// Componentes locales
import ProductSearch from "./components/ProductSearch.js";
import ProductInfo from "./components/ProductInfo.js";
import EgresoForm from "./components/EgresoForm.js";
import AlertMessages from "./components/AlertMessages.js";
import SectionHeader from "./components/SectionHeader.js";
import useOutputProduct from "./components/useOutputProduct.js";

const OutputProductPage = () => {
  const router = useRouter();
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

  return (
    <Layout>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
        
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Egreso de Producto
            </h1>
            <p className="text-muted-foreground">
              Registrar la salida de productos del inventario
            </p>
          </div>
        </div>
 
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Egreso</CardTitle>
            <CardDescription>
              Complete los campos para registrar la salida de un producto del inventario
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Alertas */}
              <AlertMessages error={error} success={success} />

              {/* Sección: Información del Producto */}
              <div className="space-y-4">
                <SectionHeader icon={Package} title="Información del Producto" />
                
                <ProductSearch
                  onProductFound={setProductInfo}
                  onError={setError}
                  disabled={isLoading}
                />

                <ProductInfo
                  product={productInfo}
                  cantidad={formData.cantidad}
                  onCantidadChange={(value) => updateFormData({ cantidad: value })}
                  disabled={isLoading}
                />
              </div>

              {/* Sección: Detalles del Egreso */}
              {productInfo && (
                <div className="space-y-4">
                  <SectionHeader icon={ArrowUpRight} title="Detalles del Egreso" />
                  <SectionHeader icon={Calendar} title="Fecha y Hora del Egreso" />
                  <SectionHeader icon={User} title="Responsable" />
                  
                  <EgresoForm
                    formData={formData}
                    onChange={updateFormData}
                    disabled={isLoading}
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                disabled={isLoading}
              >
                Limpiar Formulario
              </Button>

              <Button type="submit" disabled={isLoading || !productInfo}>
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default OutputProductPage;
