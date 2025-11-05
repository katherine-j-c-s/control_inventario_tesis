"use client";

import { useAuth } from "@/hooks/useAuth";
import { allRoutes, rolesConfig } from "@/lib/roles";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import { Switch } from "@/components/ui/switch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { User, Sun, Moon, X, Menu } from "lucide-react";
import ProfileImage from "./ProfileImage";

import logoLightMode from "@/assets/logoLighMode.png";
import logoDarkMode from "@/assets/logoDarkMode.png";

// Un componente interno para los links, es "inteligente" y muestra un HoverCard cuando está cerrado
const NavLink = ({ href, icon: Icon, text, isOpen }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkClasses = `flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
    isActive
      ? "bg-primary/10 text-primary"
      : "text-foreground/70 hover:bg-muted hover:text-foreground"
  }`;

  // Si el menú está cerrado, usamos HoverCard
  if (!isOpen) {
    return (
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link href={href} className={linkClasses}>
            <Icon className="w-5 h-5" />
          </Link>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="center"
          className="px-3 py-1.5 text-sm"
        >
          {text}
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Si el menú está abierto, mostramos el texto normalmente
  return (
    <Link href={href} className={linkClasses.replace("justify-center", "")}>
      <Icon className="w-5 h-5" />
      <span className="ml-3 whitespace-nowrap">{text}</span>
    </Link>
  );
};
// Componente para el interruptor de Dark Mode
const DarkModeToggle = ({ isOpen }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center justify-between mt-4 p-2 rounded-lg bg-muted/50">
      {isOpen && (
        <span className="text-sm font-medium text-foreground/70 ml-2">
          Modo Oscuro
        </span>
      )}
      <Switch
        checked={theme === "dark"}
        onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="ml-auto"
      >
        <Sun className="h-4 w-4 text-yellow-500" />
        <Moon className="h-4 w-4 text-blue-300" />
      </Switch>
    </div>
  );
};

export const SideMenu = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, refreshUser } = useAuth();
  const { theme } = useTheme();

  // Seleccionamos el logo correcto según el tema y si el menú está abierto
  const iconLogo = theme === "dark" ? logoDarkMode : logoLightMode;
  const fullLogo = theme === "dark" ? logoDarkMode : logoLightMode;

  // Construimos las rutas permitidas basadas ÚNICAMENTE en los permisos del rol
  // Usamos rolPermisos si está disponible, sino usamos permisos como fallback
  const rolePermissions = user?.rolPermisos || user?.permisos || {};
  
  const allowedRoutes = Object.entries(rolePermissions)
    .filter(([key, hasAccess]) => hasAccess && allRoutes[key])
    .map(([key]) => allRoutes[key])
    .filter(Boolean);

  // Eliminar duplicados (aunque no debería haber duplicados con la nueva lógica)
  const uniqueRoutes = allowedRoutes.filter((route, index, self) => 
    index === self.findIndex(r => r.href === route.href)
  );

  return (
    <motion.aside
      animate={
        isMobile
          ? { x: isOpen ? 0 : "-100%" } // Animación para móvil (deslizamiento)
          : { width: isOpen ? "18rem" : "5rem" } // Animación para escritorio (ancho)
      }
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-card text-card-foreground p-4 flex flex-col h-screen shadow-2xl flex-shrink-0 ${
        isMobile ? "fixed z-50" : "relative z-40" // z-index más alto en desktop
      }`}
    >
      {/* Contenedor del Logo y Botón de Control */}
      <div className="">
        {/* Botón de abrir/cerrar */}
        <div className={`flex ${isOpen ? "justify-end" : "justify-center"}`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-full hover:bg-muted mb-4"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-start items-start ">
          <AnimatePresence>
            {isOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
               
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 items-center"
              >
                <Image
                  src={iconLogo}
                  alt="Logo"
                  width={32}
                  height={32}
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

{/* // Navegación principal con links  */}
      <nav className="flex-grow space-y-2">
        {uniqueRoutes.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            text={link.text}
            isOpen={isOpen}
          />
        ))}
      </nav>


      <div className="mt-auto">
        <DarkModeToggle isOpen={isOpen} />
        <Link href="/profile" className="block mt-2">
          <div className="flex items-center p-2 rounded-lg hover:bg-muted transition-colors group cursor-pointer">
            <div className="flex-shrink-0">
              <ProfileImage 
                user={user} 
                size={isOpen ? "lg" : "md"} 
                className="ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
              />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3 flex-grow min-w-0"
                >
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-muted-foreground truncate capitalize">
                    {user?.rol || 'Usuario'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </motion.aside>
  );
};