import {
  Home, Users, Settings, FileText, QrCode, ScanLine, Package,
  FileCheck, ArrowRightLeft, CheckSquare, ListOrdered, Cloud, MapPin
} from "lucide-react";

// 1. Definimos todas las rutas posibles de la aplicación
export const allRoutes = {
  dashboard: { href: "/dashboard", text: "Dashboard", icon: Home },
  inventory: { href: "/inventory", text: "Inventario", icon: Package },
  purchaseOrders: { href: "/purchase_order", text: "Órdenes de Compra", icon: ListOrdered },
  verifyRemito: { href: "/remito", text: "Remitos", icon: FileCheck },
  productEntry: { href: "/movements", text: "Movimientos", icon: ArrowRightLeft },
  productExit: { href: "/egreso-productos", text: "Egreso de Productos", icon: ArrowRightLeft },
  generateQR: { href: "/generate-qr", text: "Generar QR", icon: QrCode },
  scanQR: { href: "/escanear-qr", text: "Escanear QR", icon: ScanLine },
  pendingPermissions: { href: "/permisos-pendientes", text: "Permisos Pendientes", icon: CheckSquare },
  adminUsers: { href: "/admin", text: "Administrar Usuarios", icon: Users },
  generateReports: { href: "/generate-report", text: "Generar Informes", icon: FileText },
  weather: { href: "/movimientos/clima", text: "Condiciones Climáticas", icon: Cloud },
  maps: { href: "/movimientos/visualizacion/1", text: "Visualización en Mapas", icon: MapPin },
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
      allRoutes.weather,
      allRoutes.maps,
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
      allRoutes.weather,
      allRoutes.maps,
    ],
  }
};