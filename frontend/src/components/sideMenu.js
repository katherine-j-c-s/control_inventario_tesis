'use client';

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";

import { Switch } from "@/components/ui/switch";
import { HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card"; 
import { User, Sun, Moon, X, Menu } from "lucide-react";
import ProfileImage from "./ProfileImage";

import logoLightMode from '@/assets/logoLighMode.png';
import logoDarkMode from '@/assets/logoDarkMode.png';
import logoFullLightMode from '@/assets/logoFullLighMode.png';
import logoFullDarkMode from '@/assets/logoFullDarkMode.png';

// Un componente interno para los links, es "inteligente" y muestra un HoverCard cuando está cerrado
const NavLink = ({ href, icon: Icon, text, isOpen }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkClasses = `flex items-center justify-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${
    isActive ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
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
        <HoverCardContent side="right" align="center" className="px-3 py-1.5 text-sm">
          {text}
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Si el menú está abierto, mostramos el texto normalmente
  return (
    <Link href={href} className={linkClasses.replace('justify-center', '')}>
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
             {isOpen && <span className="text-sm font-medium text-foreground/70 ml-2">Modo Oscuro</span>}
            <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="ml-auto"
            >
                <Sun className="h-4 w-4 text-yellow-500" />
                <Moon className="h-4 w-4 text-blue-300" />
            </Switch>
        </div>
    );
};

export const SideMenu = ({ isOpen, setIsOpen, isMobile }) => {
  const { user, rolePermissions } = useAuth();
  const { theme } = useTheme();

  // Seleccionamos el logo correcto según el tema y si el menú está abierto
  const iconLogo = theme === 'dark' ? logoDarkMode : logoLightMode;
  const fullLogo = theme === 'dark' ? logoFullDarkMode : logoFullLightMode;

  const userRole = user?.rol || 'default';
  const allowedRoutes = rolePermissions[userRole]?.routes || [];

   return (
    <motion.aside 
      animate={isMobile 
        ? { x: isOpen ? 0 : '-100%' } // Animación para móvil (deslizamiento)
        : { width: isOpen ? "16rem" : "5rem" } // Animación para escritorio (ancho)
      }
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`bg-card text-card-foreground p-4 flex flex-col h-full shadow-lg z-50 ${
        isMobile ? 'fixed' : 'relative' // Posición fija en móvil
      }`}
    >
      {/* Contenedor del Logo y Botón de Control */}
      <div className="mb-6">
        {/* Botón de abrir/cerrar */}
        <div className={`flex ${isOpen ? 'justify-end' : 'justify-center'}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-muted mb-4">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center">
            <AnimatePresence>
              {isOpen ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Image src={fullLogo} alt="Control de Inventario" width={180} height={40} priority />
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Image src={iconLogo} alt="Logo" width={32} height={32} priority />
                </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>

      <nav className="flex-grow space-y-2">
        {allowedRoutes.map((link) => (
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
        <div className="flex items-center justify-center p-2 mt-2 rounded-lg hover:bg-muted group">
          <ProfileImage user={user} size="lg" />
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} 
                className="ml-3 flex-grow"
              >
                <p className="text-sm font-semibold text-foreground whitespace-nowrap">{user?.nombre}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{user?.rol}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <Link href="/profile" className="ml-2 p-2 rounded-full hover:bg-primary/10 text-foreground/70 group-hover:text-primary">
                   <User className="h-5 w-5" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
};