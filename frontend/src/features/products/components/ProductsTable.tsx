import { AlertTriangle } from "lucide-react";
import type { ProductoDTO } from "../models/ProductoDTO";
import type { GrupoFamiliaProductos } from "../utils/productos.utils";
import { formatoPrecio, obtenerEstadoStock, obtenerTextoStock } from "../utils/productos.utils";

interface ProductsTableProps {
  grupos: GrupoFamiliaProductos[];
  productoSeleccionadoId: number | null;
  onSelect: (producto: ProductoDTO, activador: HTMLButtonElement) => void;
}

function StockValue({ producto }: { producto: ProductoDTO }) {
  const estado = obtenerEstadoStock(producto.stockActual, producto.stockMinimo);
  const alerta = producto.estado === "Activo" && estado !== "normal";

  return (
    <div className="flex flex-col items-start gap-0.5 min-[1100px]:items-end">
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm min-[1100px]:text-base ${alerta ? "text-warning-ink" : "text-ink"}`}
      >
        {alerta && <AlertTriangle size={15} aria-hidden="true" />}
        {obtenerTextoStock(producto.stockActual)}
      </span>
      <span className="whitespace-nowrap text-sm text-muted">mínimo {producto.stockMinimo}</span>
    </div>
  );
}

export function ProductsTable({ grupos, productoSeleccionadoId, onSelect }: ProductsTableProps) {
  return (
    <div className="space-y-7">
      {grupos.map((familia) => (
        <section key={familia.nombre} aria-label={familia.nombre} className="space-y-4">
          <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-display text-xl font-semibold text-ink">{familia.nombre}</h2>
            <p className="text-sm text-muted">
              {familia.cantidadCategorias}{" "}
              {familia.cantidadCategorias === 1 ? "categoría" : "categorías"}
              {familia.cantidadStockBajo > 0 && ` · ${familia.cantidadStockBajo} con stock bajo`}
            </p>
          </header>

          {familia.categorias.map((categoria) => (
            <section
              key={categoria.nombre}
              aria-label={`${familia.nombre}, ${categoria.nombre}`}
              className="overflow-hidden rounded-2xl bg-surface"
            >
              <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
                <h3 className="font-display text-lg font-semibold text-ink">{categoria.nombre}</h3>
                <p className="text-sm text-muted">
                  {categoria.productos.length}{" "}
                  {categoria.productos.length === 1 ? "producto" : "productos"}
                </p>
              </header>

              <table className="w-full table-fixed border-collapse text-left">
                <thead className="text-sm font-medium text-muted">
                  <tr>
                    <th scope="col" className="w-[60%] px-5 py-2 font-medium min-[1100px]:w-[40%]">
                      Producto
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 font-medium min-[1100px]:table-cell min-[1100px]:w-[21%]"
                    >
                      Ubicación
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-2 text-right font-medium tabular-nums min-[1100px]:table-cell min-[1100px]:w-[17%]"
                    >
                      Precio sin IVA
                    </th>
                    <th
                      scope="col"
                      className="w-[40%] px-3 py-2 text-right font-medium min-[1100px]:w-[22%] min-[1100px]:px-4"
                    >
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categoria.productos.map((producto) => {
                    const seleccionado = producto.id === productoSeleccionadoId;

                    return (
                      <tr
                        key={producto.id}
                        className={`border-t border-line transition-colors hover:bg-canvas ${
                          seleccionado ? "bg-canvas" : ""
                        }`}
                      >
                        <td className="px-5 py-2.5">
                          <button
                            type="button"
                            aria-label={`Ver detalles de ${producto.nombre}`}
                            aria-expanded={seleccionado}
                            aria-controls={seleccionado ? "detalle-producto" : undefined}
                            onClick={(event) => onSelect(producto, event.currentTarget)}
                            className="flex min-h-11 w-full min-w-0 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                          >
                            <span className="flex max-w-full items-center gap-2 font-semibold text-ink">
                              <span className="min-w-0 wrap-break-word">{producto.nombre}</span>
                              {producto.estado === "Inactivo" && (
                                <span className="shrink-0 rounded-full bg-danger-surface px-2 py-0.5 text-[13px] font-semibold text-danger-ink">
                                  Inactivo
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-muted">
                              {producto.codigosBarras.length === 1
                                ? "Tiene 1 código de barras"
                                : `Tiene ${producto.codigosBarras.length} códigos de barras`}
                            </span>
                          </button>
                        </td>
                        <td className="hidden px-3 py-3 text-sm text-ink-soft min-[1100px]:table-cell">
                          {producto.ubicacion
                            ? `${producto.ubicacion.sector} · ${producto.ubicacion.estante}`
                            : "Sin ubicación"}
                        </td>
                        <td className="hidden px-3 py-3 text-right tabular-nums text-ink min-[1100px]:table-cell">
                          {formatoPrecio(producto.precioUnitario)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums min-[1100px]:px-4">
                          <StockValue producto={producto} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          ))}
        </section>
      ))}
    </div>
  );
}
