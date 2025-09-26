import { useAuth } from "@/hooks/useAuth";
// import { Link } from "lucide-react";
import React from "react";
import Link from "next/link";
import LinkGlobal from "./LinkGlobal";
import { PersonStanding } from "lucide-react";
import ProfileImage from "./ProfileImage";

export const SideMenu = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="w-64 h-screen  bg-white shadow-md rounded-lg p-4 absolute top-13 left-0 items-center ">
      {/* div menu lateral */}

      <LinkGlobal href="/ordenes-de-compra" text="Ordenes de Compra" />
      <LinkGlobal href="/verificar-remito" text="Verficar Remito" />
      <LinkGlobal href="/inventory" text="Inventario" />

      {isAdmin() && (
        <>
          <LinkGlobal href="/admin/users" text="Administrar Usuarios" />
          <LinkGlobal href="/informes" text=" Generar Informes" />

        </>
      )}
      <LinkGlobal href="/generarQr" text="Generar QR" />
      <LinkGlobal href="/EscanearQr" text="Escanear QR" />
      <LinkGlobal href="/egreso-porductos" text="Egreso de Productos" />

      {/* //perfil usuario  */}
      <div className="flex absolute bottom-0 mb-4 w-full">
        <Link
          href="/profile"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-300 rounded mt-3 bg-gray-200  flex flex-row items-center"
        >
          <ProfileImage user={user} size="lg" />
          <span className="ml-2">{user?.nombre} {user?.apellido}</span>
        </Link>
      </div>
    </div>
  );
};
