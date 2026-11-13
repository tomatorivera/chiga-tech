import type { ProductoDTO } from "../models/ProductoDTO";

export type FiltroProductos = "Todos" | "Stock bajo" | "Inactivos";
export type EstadoStock = "normal" | "bajo" | "sinStock" | "negativo";

export interface GrupoCategoriaProductos {
  nombre: string;
  productos: ProductoDTO[];
  cantidadStockBajo: number;
}

export interface GrupoFamiliaProductos {
  nombre: string;
  categorias: GrupoCategoriaProductos[];
  cantidadCategorias: number;
  cantidadStockBajo: number;
}

export function obtenerEstadoStock(stock: number, minimo: number): EstadoStock {
  if (stock < 0) return "negativo";
  if (stock === 0) return "sinStock";
  if (stock <= minimo) return "bajo";
  return "normal";
}

export function obtenerTextoStock(stock: number): string {
  if (stock < 0) return `Faltan ${Math.abs(stock)}`;
  if (stock === 1) return "Queda 1";
  if (stock === 0) return "Sin stock";
  return `Quedan ${stock}`;
}

export function formatoPrecio(precio: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: Number.isInteger(precio) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(precio);
}

export function filtrarProductos(
  productos: readonly ProductoDTO[],
  filtros: { familia: string; estado: FiltroProductos },
): ProductoDTO[] {
  return productos.filter((producto) => {
    const coincideFamilia = !filtros.familia || producto.familia === filtros.familia;
    const coincideEstado =
      filtros.estado === "Todos" ||
      (filtros.estado === "Stock bajo" &&
        producto.estado === "Activo" &&
        producto.stockActual <= producto.stockMinimo) ||
      (filtros.estado === "Inactivos" && producto.estado === "Inactivo");

    return coincideFamilia && coincideEstado;
  });
}

export function agruparPorFamilia(productos: readonly ProductoDTO[]): GrupoFamiliaProductos[] {
  const familias = new Map<string, Map<string, ProductoDTO[]>>();

  for (const producto of productos) {
    const categorias = familias.get(producto.familia) ?? new Map<string, ProductoDTO[]>();
    const productosCategoria = categorias.get(producto.categoria) ?? [];
    productosCategoria.push(producto);
    categorias.set(producto.categoria, productosCategoria);
    familias.set(producto.familia, categorias);
  }

  return [...familias.entries()]
    .sort(([familiaA], [familiaB]) =>
      familiaA.localeCompare(familiaB, "es", { sensitivity: "base" }),
    )
    .map(([nombre, categorias]) => {
      const grupos = [...categorias.entries()]
        .sort(([categoriaA], [categoriaB]) =>
          categoriaA.localeCompare(categoriaB, "es", { sensitivity: "base" }),
        )
        .map(([nombreCategoria, productosCategoria]) => ({
          nombre: nombreCategoria,
          productos: productosCategoria,
          cantidadStockBajo: productosCategoria.filter(
            (producto) =>
              producto.estado === "Activo" && producto.stockActual <= producto.stockMinimo,
          ).length,
        }));

      return {
        nombre,
        categorias: grupos,
        cantidadCategorias: grupos.length,
        cantidadStockBajo: grupos.reduce(
          (cantidad, grupo) => cantidad + grupo.cantidadStockBajo,
          0,
        ),
      };
    });
}
