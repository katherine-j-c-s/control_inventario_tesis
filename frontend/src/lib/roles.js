import ProjectsPage from "@/app/projects/page";
import {
  Home, Users, FileText, QrCode, ScanLine, Package,
  FileCheck, MapPin,ArrowRightLeft, CheckSquare, 
  ListOrdered, Building2
} from "lucide-react";

// 1. Definimos todas las rutas posibles de la aplicación
export const allRoutes = {
  dashboard: { href: "/dashboard", text: "Dashboard", icon: Home },
  inventory: { href: "/inventory", text: "Inventario", icon: Package },
  purchaseOrders: { href: "/purchase_order", text: "Órdenes de Compra", icon: ListOrdered },
  verifyRemito: { href: "/remito", text: "Remitos", icon: FileCheck },
  productEntry: { href: "/movements", text: "Movimientos", icon: ArrowRightLeft },
  productExit: { href: "/output-poduct", text: "Egreso de Productos", icon: ArrowRightLeft },
  generateQR: { href: "/generate-qr", text: "Generar QR", icon: QrCode },
  scanQR: { href: "/escanear-qr", text: "Escanear QR", icon: ScanLine },
  projects: { href: "/projects", text: "Obras ", icon: CheckSquare },
  adminUsers: { href: "/admin", text: "Administrar Usuarios", icon: Users },
  generateReports: { href: "/generate-report", text: "Generar Informes", icon: FileText },
  maps: { href: "/movements/visualizacion/1", text: "Visualización en Mapas", icon: MapPin },
  workOrder: { href: "/work-order", text: "Petición de Obra", icon: Building2 },
};

// 2. Mapeamos los roles a las claves de las rutas que pueden ver
export const rolesConfig = {
  'usuario': {
    name: 'Usuario',
    defaultRoute: allRoutes.inventory.href,
    routes: [
      allRoutes.inventory,
      allRoutes.scanQR,
      allRoutes.productExit,
    ],
  },
  'admin': {
    name: 'Administrador',
    defaultRoute: allRoutes.dashboard.href,
    routes: [
      allRoutes.dashboard,
      allRoutes.adminUsers,
      allRoutes.generateReports,
      allRoutes.scanQR,
    ],
  },
  'almacen': {
    name: 'Almacén',
    defaultRoute: allRoutes.dashboard.href,
    routes: [
      allRoutes.dashboard,
      allRoutes.inventory,
      allRoutes.purchaseOrders,
      allRoutes.verifyRemito,
      allRoutes.productEntry,
      allRoutes.generateQR,
      allRoutes.scanQR,
      allRoutes.productExit,
      allRoutes.maps,
      allRoutes.workOrder,
    ],
  },
  'Lider de Proyecto': {
    name: 'Líder de Proyecto',
    defaultRoute: allRoutes.dashboard.href,
    routes: [
      allRoutes.dashboard,
      allRoutes.inventory,
      allRoutes.pendingPermissions,
      allRoutes.adminUsers,
      allRoutes.generateReports,
      allRoutes.maps,
    ],
  }
};