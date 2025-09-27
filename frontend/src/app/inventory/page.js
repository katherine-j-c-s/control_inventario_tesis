// app/inventory/page.js
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layouts/Layout';
import { useRouter } from 'next/navigation';
import { DataTable } from './inventaryTable'; // Renombrado para claridad
import { sampleProducts } from './_data/sample-data'; // Datos de ejemplo movidos
import { FloatingQrScannerButton } from '@/components/QrScanner';

// --- Componentes de ShadCN/UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Loader2 } from "lucide-react";
// Importar Dialog para el modal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function InventoryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Manejar resultado del scanner QR
  const handleQrScanResult = (data) => {
    try {
      const productData = JSON.parse(data);
      // Buscar producto por código o ID
      const foundProduct = products.find(p => 
        p.codigo === productData.codigo || 
        p.id === productData.id
      );
      
      if (foundProduct) {
        alert(`Producto encontrado: ${foundProduct.nombre}`);
      } else {
        alert('Producto no encontrado en el inventario');
      }
    } catch (error) {
      // Si no es JSON, buscar por código de barras simple
      const foundProduct = products.find(p => 
        p.codigo.toLowerCase().includes(data.toLowerCase())
      );
      
      if (foundProduct) {
        alert(`Producto encontrado: ${foundProduct.nombre}`);
      } else {
        alert(`Código escaneado: ${data}\nProducto no encontrado`);
      }
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    // Simulación de carga de datos
    setProducts(sampleProducts);
  }, [user, router, loading]);

  const categories = ['all', 'Combustibles', 'Lubricantes', 'Aditivos'];

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = product.nombre.toLowerCase().includes(searchLower) ||
                         product.codigo.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'all' || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory && product.activo;
  });

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* --- Header --- */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Inventario de Productos</h1>
              <p className="mt-1 text-muted-foreground">
                Gestiona y visualiza el stock de todos los productos.
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar Producto
            </Button>
          </div>
        </motion.div>

        {/* --- Filtros --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'Todas las Categorías' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* --- Tabla de Datos --- */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <DataTable products={filteredProducts} />
        </motion.div>
      </div>
      
      {/* --- Modal para Agregar Producto --- */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>Completa los campos para añadir un item al inventario.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input id="nombre" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">Código</Label>
              <Input id="codigo" className="col-span-3" />
            </div>
            {/* ... Aquí agregarías más campos del formulario ... */}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button>Guardar Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Botón flotante del scanner QR */}
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