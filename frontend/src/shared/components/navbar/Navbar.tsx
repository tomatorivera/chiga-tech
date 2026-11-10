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
import { Wordmark } from "../Wordmark";
import { NavbarSection } from "./NavbarSection";
import { NavbarUser } from "./NavbarUser";
import type { Role } from "../../../features/users/models/Role";
import { hasMinimumRole } from "../../../features/users/utils/role.utils";
import { useSesion } from "../../../features/auth/hooks/useSesion";

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
const sections: NavbarEntry = {
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

export const Navbar = () => {
  const user = useSesion((state) => state.usuario);
  const visibleSections = Object.entries(sections).filter(([, section]) =>
    hasMinimumRole(user?.roles ?? [], section.visibleFrom),
  );

  return (
    <aside className="sticky top-0 flex h-dvh w-full flex-col bg-brand px-3 pt-5 pb-4 max-lg:px-2">
      <Wordmark className="px-3 pb-5 text-canvas max-lg:justify-center max-lg:px-0 max-lg:[&>span:last-child]:hidden" />

      <nav
        aria-label="Principal"
        className="scroll-shadows -mx-3 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 max-lg:-mx-2 max-lg:gap-3 max-lg:px-2"
      >
        {visibleSections.map(([id, section]) => (
          <NavbarSection key={id} id={id} {...section} />
        ))}
      </nav>

      <NavbarUser />
    </aside>
  );
};
