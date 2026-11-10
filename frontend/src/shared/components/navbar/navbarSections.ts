import {
  ChartColumn,
  FileSpreadsheet,
  FolderTree,
  History,
  Package,
  ReceiptText,
  Settings,
  ShieldUser,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "../../../features/users/models/Role";

export type NavbarLink = {
  icon: LucideIcon;
  text: string;
  to: string;
};

export type NavbarGroup = {
  id?: string;
  title: string;
  items: NavbarLink[];
  visibleFrom: Role;
};

export type NavbarEntry = Record<string, NavbarGroup>;

// Para agregar una sección al nav, se lo agrega desde este record
// Cada sección necesita su id, el título, y los items que contiene.
//
// NOTA: El rol mínimo "visibleFrom" define desde qué rol puede verse
// el link, pero NO reemplaza el RoleGuard de las rutas.
export const sections: NavbarEntry = {
  mostrador: {
    title: "Mostrador",
    visibleFrom: "Vendedor",
    items: [{ icon: ShoppingCart, text: "Vender", to: "/vender" }],
  },
  ventas: {
    title: "Ventas",
    visibleFrom: "Supervisor",
    items: [
      { icon: ReceiptText, text: "Ventas", to: "/ventas" },
      { icon: Users, text: "Clientes", to: "/clientes" },
    ],
  },
  catalogo: {
    title: "Catálogo",
    visibleFrom: "Supervisor",
    items: [
      { icon: Package, text: "Productos", to: "/productos" },
      { icon: FolderTree, text: "Categorías", to: "/categorias" },
      { icon: Warehouse, text: "Stock", to: "/stock" },
      { icon: Truck, text: "Proveedores", to: "/proveedores" },
      { icon: FileSpreadsheet, text: "Listas de precios", to: "/precios" },
    ],
  },
  administracion: {
    title: "Administración",
    visibleFrom: "Administrador",
    items: [
      { icon: ChartColumn, text: "Reportes", to: "/reportes" },
      { icon: UserCog, text: "Usuarios", to: "/usuarios" },
      { icon: History, text: "Auditoría", to: "/auditoria" },
      { icon: Settings, text: "Configuración", to: "/configuracion" },
    ],
  },
  sistema: {
    title: "Sistema",
    visibleFrom: "Dueño",
    items: [{ icon: ShieldUser, text: "Administradores", to: "/administradores" }],
  },
};

export const findNavbarLink = (to: string): NavbarLink | undefined =>
  Object.values(sections)
    .flatMap((section) => section.items)
    .find((item) => item.to === to);
