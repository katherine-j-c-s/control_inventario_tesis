'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
import { LogOut, User as UserIcon, Menu} from "lucide-react";

import logoFullLightMode from '@/assets/logoFullLighMode.png';
import logoFullDarkMode from '@/assets/logoFullDarkMode.png';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    const logo = theme === 'dark' ? logoFullDarkMode : logoFullLightMode;
    return (
      <header className="bg-card border-b h-16 flex items-center justify-between px-4 md:hidden">
        <Image src={logo} alt="Control de Inventario" width={150} height={35} priority />
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </header>
    );
  };

  const DesktopHeader = () => (
    <header className="bg-card border-b h-16 items-center justify-end px-6 hidden md:flex">
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user.foto} alt="Foto de perfil" />
                <AvatarFallback>{user.nombre?.[0]}{user.apellido?.[0]}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.nombre} {user.apellido}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
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
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}
      
      <div className="flex">
        <SideMenu isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} isMobile={isMobile} />
        
        <div 
          className={`flex-1 flex flex-col transition-all duration-300 ${
            !isMobile && (isSidebarOpen ? 'md:ml-0' : 'md:ml-5')
          }`}
        >
          <MobileHeader />
          <DesktopHeader />

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}