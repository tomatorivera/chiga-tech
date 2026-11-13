import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { ProductoDTO } from "../models/ProductoDTO";
import { formatoPrecio, obtenerEstadoStock, obtenerTextoStock } from "../utils/productos.utils";

interface ProductDetailPanelProps {
  producto: ProductoDTO;
  onClose: () => void;
}

export function ProductDetailPanel({ producto, onClose }: ProductDetailPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const estadoStock = obtenerEstadoStock(producto.stockActual, producto.stockMinimo);
  const stockBajo = producto.estado === "Activo" && estadoStock !== "normal";

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <>
      <div aria-hidden="true" className="fixed inset-0 z-30 bg-brand/25 min-[1100px]:hidden" />
      <aside
        id="detalle-producto"
        aria-labelledby="detalle-producto-titulo"
        className="fixed inset-x-0 bottom-0 z-40 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-[0_12px_32px_rgb(23_59_50/.18)] motion-safe:animate-enter min-[1100px]:sticky min-[1100px]:top-6 min-[1100px]:z-auto min-[1100px]:max-h-[calc(100dvh-3rem)] min-[1100px]:rounded-2xl min-[1100px]:p-6 min-[1100px]:shadow-none"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-sm text-muted">
              {producto.familia} / {producto.categoria}
            </p>
            <h2
              id="detalle-producto-titulo"
              className="font-display text-xl leading-tight font-semibold text-ink"
            >
              {producto.nombre}
            </h2>
            {producto.estado === "Inactivo" && (
              <span className="mt-2 inline-flex rounded-full bg-danger-surface px-2.5 py-1 text-[13px] font-semibold text-danger-ink">
                Inactivo
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Cerrar el panel"
            onClick={onClose}
            className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {stockBajo && (
          <p
            role="note"
            className="mt-6 flex items-start gap-2 rounded-lg bg-warning-surface px-4 py-3 text-sm text-warning-ink"
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
            <span>
              <strong className="block">Stock bajo</strong>
              {obtenerTextoStock(producto.stockActual)}{" "}
              {producto.stockActual === 1 || producto.stockActual === -1 ? "unidad" : "unidades"} y
              el mínimo es {producto.stockMinimo}.
            </span>
          </p>
        )}

        {producto.estado === "Inactivo" && producto.motivoBaja && (
          <p className="mt-6 rounded-lg bg-danger-surface px-4 py-3 text-sm text-danger-ink">
            <strong className="block">Motivo de baja</strong>
            {producto.motivoBaja}
          </p>
        )}

        <dl className="mt-6 space-y-5">
          <div>
            <dt className="text-sm font-semibold text-ink-soft">Precio unitario sin IVA</dt>
            <dd className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
              {formatoPrecio(producto.precioUnitario)}
            </dd>
          </div>
          <div className="rounded-xl bg-canvas p-4">
            <dt className="text-sm font-semibold text-ink-soft">Stock actual</dt>
            <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
              {obtenerTextoStock(producto.stockActual)}{" "}
              {producto.stockActual === 1 || producto.stockActual === -1 ? "unidad" : "unidades"}
            </dd>
            <p className="mt-1 text-sm text-muted">Stock mínimo: {producto.stockMinimo} unidades</p>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink-soft">Ubicación en el depósito</dt>
            <dd className="mt-1 text-base text-ink">
              {producto.ubicacion
                ? `${producto.ubicacion.sector} · ${producto.ubicacion.estante}`
                : "Sin ubicación"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink-soft">
              {producto.codigosBarras.length === 1
                ? "Código de barras"
                : `Códigos de barras (${producto.codigosBarras.length})`}
            </dt>
            <dd>
              <ul className="mt-1 space-y-1">
                {producto.codigosBarras.map((codigo) => (
                  <li key={codigo} className="font-mono text-sm text-ink">
                    {codigo}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </aside>
    </>
  );
}
