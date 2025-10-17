'use client'

import Layout from "@/components/layouts/Layout";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { PlusCircle } from "lucide-react";

const PurchaseOrderContent = () => {
    const { user } = useAuth();
  

    return (
        <Layout>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
                    <p className="text-muted-foreground">Gestiona tus órdenes</p>
                    {/* <p>Bienvenido, {user?.name}</p> */}
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Orden
                </Button>
            </div>


        </Layout>
    )
}


export default function PurchaseOrder() {
    return (
      <AuthProvider>
        <PurchaseOrderContent />
      </AuthProvider>
    );
  }
  