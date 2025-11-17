"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSidebarWidth } from "@/hooks/useSidebarWidth";
import { SideMenu } from "../sideMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LogOut, User as UserIcon, Menu} from "lucide-react";

import logoFullLightMode from "@/assets/logoFullLighMode.png";
import logoFullDarkMode from "@/assets/logoFullDarkMode.png";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sidebarWidth = useSidebarWidth(isSidebarOpen);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) {
    return <>{children}</>;
  }
  const MobileHeader = () => {
    const fullLogo = theme === "dark" ? logoFullDarkMode : logoFullLightMode;

    return (
      <header className="bg-card/90 backdrop-blur fixed border-b h-16 flex items-center justify-between px-4 py-2 md:hidden w-full top-0 z-30">
        <Image
          src={fullLogo}
          alt="Control de Inventario"
          width={140}
          height={32}
          priority
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </header>
    );
  };
  const fullLogo = theme === "dark" ? logoFullDarkMode : logoFullLightMode;
  const DesktopHeader = () => (
    <header className="bg-card border-b h-16 items-center justify-end px-6 hidden md:flex fixed top-0 w-full z-20">
      <Link href="/dashboard" className="flex items-center">
      <Image
          src={fullLogo}
          alt="Control de Inventario"
          className="w-[150px] h-[35px]"
          width={150}
          height={35}
          priority
        />
        </Link>
      <div className="ml-auto ">
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user.foto} alt="Foto de perfil" />
                <AvatarFallback>
                  {user.nombre?.[0]}
                  {user.apellido?.[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Overlay para móvil */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <div className="flex relative">
        <SideMenu
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />

        <div
          className="flex-1 flex flex-col overflow-hidden min-w-0 transition-all duration-300 ease-in-out"
          style={{ 
            position: "relative", 
            zIndex: 1,
            marginLeft: !isMobile ? `${sidebarWidth}px` : "0px"
          }}
        >
          <MobileHeader />
          <DesktopHeader />

          <main className="flex-1 mt-16 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
