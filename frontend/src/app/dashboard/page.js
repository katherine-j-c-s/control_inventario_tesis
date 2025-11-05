"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { allRoutes } from "@/lib/roles";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsuarios: 15,
    productosActivos: 124,
    stockBajo: 3,
    ordenesCompletas: 78,
  });

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

  const userRole = user.rol || "default";
  // Usar los permisos del usuario directamente en lugar de rolesConfig (que ya no existe)
  const quickActions = []; // Se puede implementar usando user.rolPermisos si es necesario

  return (
    <Layout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Bienvenido, {user.nombre}</h1>
          <p className="mt-1 text-muted-foreground">
            Aquí tienes un resumen rápido de la actividad del sistema.
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
              <p className="text-xs text-muted-foreground">
                Usuarios activos en el sistema
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Productos Activos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productosActivos}</div>
              <p className="text-xs text-muted-foreground">
                Items registrados en inventario
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas de Stock
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stockBajo}</div>
              <p className="text-xs text-muted-foreground">
                Productos con stock bajo
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes Completas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.ordenesCompletas}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Accesos Directos</CardTitle>
                <CardDescription>
                  Tus secciones más importantes, a un solo clic.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions
                  ?.filter((action) => action && action.href)
                  .slice(0, 4)
                  .map((action) => (
                    <Link key={action.href} href={action.href} passHref>
                      <div className="p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors cursor-pointer flex items-center justify-between">
                        <div className="flex items-center">
                          {action.icon && (
                            <action.icon className="h-5 w-5 mr-3 text-primary" />
                          )}
                          <span className="font-semibold">{action.text}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
              </CardContent> 
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Nuevo usuario: María García
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 2 horas
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Producto actualizado: Aceite 5W-30
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 4 horas
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-destructive rounded-full mr-3 shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">
                      Alerta de stock: Gasolina Premium
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Hace 6 horas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
