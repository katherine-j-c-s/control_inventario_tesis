"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import { DataTable } from "./inventaryTable";
import { FloatingQrScannerButton } from "@/components/QrScanner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Loader2, RefreshCw, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AddProduct from "./AddProduct";
import ReporteInventario from "@/components/ReporteInventario";

function InventoryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleQrScanResult = (data) => {
    try {
      const productData = JSON.parse(data);
      const foundProduct = products.find(
        (p) => p.codigo === productData.codigo || p.id === productData.id
      );

      if (foundProduct) {
        alert(`Producto encontrado: ${foundProduct.nombre}`);
      } else {
        alert("Producto no encontrado en el inventario");
      }
    } catch (error) {
      const foundProduct = products.find((p) =>
        p.codigo.toLowerCase().includes(data.toLowerCase())
      );

      if (foundProduct) {
        alert(`Producto encontrado: ${foundProduct.nombre}`);
      } else {
        alert(`Código escaneado: ${data}\nProducto no encontrado`);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get("/productos");
      setProducts(response.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setError("Error al cargar los productos. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    loadProducts();
  }, [user, router, loading]);

  const categories = [
    "all",
    ...new Set(products.map((product) => product.categoria).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchLower) ||
      product.codigo.toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategory === "all" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory && product.activo;
  });

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando inventario...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadProducts}>Reintentar</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Inventario de Productos</h1>
              <p className="mt-1 text-muted-foreground">
                Gestiona y visualiza el stock de todos los productos.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadProducts}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReportModal(true)}
              >
                <FileText className="mr-2 h-4 w-4" /> Generar Reporte
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "Todas las Categorías" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable products={filteredProducts} />
        </motion.div>
      </div>
      {/* Agregar un producto  */}
      <AddProduct
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Modal de Reporte */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generar Reporte de Inventario</DialogTitle>
            <DialogDescription>
              Genera un reporte PDF del inventario con filtros personalizables
            </DialogDescription>
          </DialogHeader>
          <ReporteInventario productos={filteredProducts} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FloatingQrScannerButton onScanResult={handleQrScanResult} />
    </Layout>
  );
}

export default function InventoryPage() {
  return (
    <AuthProvider>
      <InventoryContent />
    </AuthProvider>
  );
}
