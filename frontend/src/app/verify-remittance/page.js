"use client";

import Layout from "@/components/layouts/Layout";
import React, { useState } from "react";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableVerify } from "./Tableverify";

const VerifyRemitteContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Comprador ", accessorKey: "comprador" },
    { header: "Estado", accessorKey: "estado" },
    { header: "Acciones", accessorKey: "acciones" },
  ];

  const rows = [
    { id: 1, comprador: "Automotores neuquen ", estado: "Pendiente" },
    { id: 2, comprador: "Almcaen oeste", estado: "pendiente " },
    { id: 3, comprador: "Carlos isla", estado: "Pendiente" },
  ];

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className=" text-2xl">Verificar Remito </h1>
        <p className=" text-lg">Bienvenido, {user?.nombre}</p>
        <div className="mt-4 ">
          <TableVerify/>
        </div>
      </div>
    </Layout>
  );
};

export default function VerifyRemitte() {
  return (
    <AuthProvider>
      <VerifyRemitteContent />
    </AuthProvider>
  );
}
