import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {SideMenu, sideMenu} from "../sideMenu";
import ProfileImage from "../ProfileImage";


export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex-shrink-0">
                <h1 className="text-xl font-bold text-[#0D0EAB]">
                  Control de Inventario
                </h1>
              </Link>

              <div className="hidden md:ml-6 md:flex md:space-x-8">
                {isAdmin() && (
                  <>
                    <Link
                      href="/admin/users"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Administrar Usuarios
                    </Link>
                    <Link
                      href="/admin/roles"
                      className="text-gray-900 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Gestión de Roles
                    </Link>
                  </>
                )}

                <Link
                  href="/inventory"
                  className="text-gray-900 hover:text-[#0D0EAB] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Inventario
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {/* <ProfileImage user={user} size="md" /> */}
                <Link
                  href="/profile"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md px-2 py-2"
                >
                  {user.nombre} {user.apellido}
                </Link>
                <span className="text-xs bg-primary-100 text-[#0D0EAB] px-2 py-1 rounded-full">
                  {user.puesto_laboral}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content  sm:px-6 lg:px-8 */}
      <main className="max-w-7xl mx-auto py-6 gap-6 flex flex-row ">
        {/* menu lateral */}
        <SideMenu/>
        {/* Contenido principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 ml-60 px-2"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
