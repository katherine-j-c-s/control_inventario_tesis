"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layouts/Layout";
import { useRouter } from "next/navigation";
import QrScanComponent from "@/components/QrScanner/QrScan";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const { user, loading, isAdmin, hasPermission } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
  });

  useEffect(() => {
    if (loading) return; // Esperar a que termine de cargar

    if (!user) {
      router.push("/login");
      return;
    }

    // Aquí podrías hacer llamadas a la API para obtener estadísticas
    // Por ahora usamos datos de ejemplo
    setStats({
      totalUsuarios: 15,
    });
  }, [user, router, loading]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user.nombre} {user.apellido}
          </h1>
          <p className="mt-2 text-gray-600">
            Panel de control del sistema de inventario
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isAdmin() && (
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            >
              <div className="flex items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Total Usuarios</h3>
                  <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
                </div>
                <div className="text-blue-200">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* // Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-white">
          <div className=" bg-[#0D0EAB] hover:bg-primary-700 p-4 border-10 shadow-md flex flex-row rounded-lg justify-center items-center gap-4 ">
            <QrScanComponent />
          </div>
          {/* <div className=" bg-gray-400 p-4 border-10 shadow-md flex flex-row rounded-lg justify-center items-center gap-4 h-[130px]"> */}
          <Link
            href="/inventory" // 👈 ojo con la ruta, probablemente no necesites "../"
            className="w-full cursor-pointer bg-[#0D0EAB] hover:bg-primary-700 p-4 border-10 shadow-md flex flex-row rounded-lg justify-center items-center gap-4 h-[130px]"
          >
            Inventario
          </Link>

          <Link
            href="/egreso"
            className="w-full cursor-pointer  bg-[#0D0EAB] hover:bg-primary-700 text-white p-4 border-10 shadow-md flex flex-row rounded-lg justify-center items-center gap-4 h-[130px]"
          >
            Egreso de Producto
          </Link>
          <Link
            href="/egreso"
            className="w-full cursor-pointer bg-[#0D0EAB] hover:bg-primary-700 p-4 border-10 shadow-md flex flex-row rounded-lg justify-center items-center gap-4 h-[130px]"
          >
            Proyecto asignado
          </Link>
          
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#13C8DA] rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Nuevo usuario registrado: María García
                </p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#13C8DA] rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Producto actualizado: Aceite Motor 5W-30
                </p>
                <p className="text-xs text-gray-500">Hace 4 horas</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-[#13C8DA] rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Alerta de stock bajo: Gasolina Premium
                </p>
                <p className="text-xs text-gray-500">Hace 6 horas</p>
              </div>
            </div>
          </div>
        </motion.div>
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
