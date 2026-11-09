import {
  ChartColumn,
  FileSpreadsheet,
  FolderTree,
  History,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import { Wordmark } from "../Wordmark";
import { NavbarSection, type NavbarSectionProps } from "./NavbarSection";
import { NavbarUser } from "./NavbarUser";

// Para agregar una sección al nav, se lo agrega desde este record
// Cada sección necesita su id, el título, y los items que contiene
const sections: Record<string, Omit<NavbarSectionProps, "id">> = {
  mostrador: {
    title: "Mostrador",
    items: [{ icon: ShoppingCart, text: "Vender", to: "/vender" }],
  },
  ventasClientes: {
    title: "Ventas y clientes",
    items: [
      { icon: ReceiptText, text: "Ventas", to: "/ventas" },
      { icon: Users, text: "Clientes", to: "/clientes" },
    ],
  },
  catalogo: {
    title: "Catálogo",
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
    items: [
      { icon: ChartColumn, text: "Reportes", to: "/reportes" },
      { icon: UserCog, text: "Usuarios", to: "/usuarios" },
      { icon: History, text: "Auditoría", to: "/auditoria" },
      { icon: Settings, text: "Configuración", to: "/configuracion" },
    ],
  },
};

export const Navbar = () => {
  return (
    <aside className="sticky top-0 flex h-dvh w-full flex-col bg-brand px-3 pt-5 pb-4 max-lg:px-2">
      <Wordmark className="px-3 pb-5 text-canvas max-lg:justify-center max-lg:px-0 max-lg:[&>span:last-child]:hidden" />

      <nav
        aria-label="Principal"
        className="scroll-shadows -mx-3 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 max-lg:-mx-2 max-lg:gap-3 max-lg:px-2"
      >
        {Object.entries(sections).map(([id, section]) => (
          <NavbarSection key={id} id={id} {...section} />
        ))}
      </nav>

      <NavbarUser />
    </aside>
  );
};
