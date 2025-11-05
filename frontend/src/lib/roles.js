import {
  Home, Users, FileText, QrCode, ScanLine, Package,
  FileCheck, Cloud, MapPin, ArrowRightLeft, CheckSquare, 
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
  maps: { href: "/movimientos/visualizacion/1", text: "Visualización en Mapas", icon: MapPin },
  workOrder: { href: "/work-order", text: "Petición de Obra", icon: Building2 },
};