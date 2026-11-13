import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useDocumentTitle } from "../../shared/hooks/useDocumentTitle";
import { ProductDetailPanel } from "./components/ProductDetailPanel";
import { ProductsTable } from "./components/ProductsTable";
import { useBusquedaProductos } from "./hooks/useBusquedaProductos";
import type { ProductoDTO } from "./models/ProductoDTO";
import { agruparPorFamilia, filtrarProductos, type FiltroProductos } from "./utils/productos.utils";

const filtrosDisponibles: FiltroProductos[] = ["Todos", "Stock bajo", "Inactivos"];

export const ProductsPage = () => {
  useDocumentTitle("Productos");

  const { busqueda, setBusqueda, productos, cargando, error } = useBusquedaProductos();
  const [familia, setFamilia] = useState("");
  const [filtro, setFiltro] = useState<FiltroProductos>("Todos");
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<number | null>(null);
  const [codigoCerrado, setCodigoCerrado] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activadorPanelRef = useRef<HTMLButtonElement | null>(null);
  const panelAbiertoRef = useRef(false);

  const familias = useMemo(
    () =>
      [...new Set(productos.map((producto) => producto.familia))].sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      ),
    [productos],
  );
  const productosVisibles = useMemo(
    () => filtrarProductos(productos, { familia, estado: filtro }),
    [familia, filtro, productos],
  );
  const grupos = useMemo(() => agruparPorFamilia(productosVisibles), [productosVisibles]);
  const codigoBuscado = busqueda.trim();
  const productoPorCodigo = productos.find((producto) =>
    producto.codigosBarras.includes(codigoBuscado),
  );
  const productoSeleccionado =
    (productoSeleccionadoId !== null
      ? productosVisibles.find((producto) => producto.id === productoSeleccionadoId)
      : undefined) ??
    (codigoCerrado !== codigoBuscado && codigoBuscado ? productoPorCodigo : undefined);
  const cantidadStockBajo = productos.filter(
    (producto) => producto.estado === "Activo" && producto.stockActual <= producto.stockMinimo,
  ).length;
  const cantidadInactivos = productos.filter((producto) => producto.estado === "Inactivo").length;

  useEffect(() => {
    if (productoSeleccionado) {
      panelAbiertoRef.current = true;
    } else if (panelAbiertoRef.current) {
      panelAbiertoRef.current = false;
      (activadorPanelRef.current ?? inputRef.current)?.focus();
    }
  }, [productoSeleccionado]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const cerrarPanel = useCallback(() => {
    if (productoPorCodigo?.id === productoSeleccionado?.id) {
      setCodigoCerrado(codigoBuscado);
    }
    setProductoSeleccionadoId(null);
  }, [codigoBuscado, productoPorCodigo, productoSeleccionado]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (productoSeleccionado && event.key === "Escape") {
        event.preventDefault();
        cerrarPanel();
      }
    };

    if (productoSeleccionado) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [cerrarPanel, productoSeleccionado]);

  const seleccionarProducto = (producto: ProductoDTO, activador: HTMLButtonElement) => {
    if (productoSeleccionado?.id === producto.id) {
      cerrarPanel();
      return;
    }
    activadorPanelRef.current = activador;
    setProductoSeleccionadoId(producto.id);
  };

  const cambiarFamilia = (nuevaFamilia: string) => {
    setFamilia(nuevaFamilia);
    if (
      productoSeleccionadoId !== null &&
      !filtrarProductos(productos, { familia: nuevaFamilia, estado: filtro }).some(
        (producto) => producto.id === productoSeleccionadoId,
      )
    ) {
      activadorPanelRef.current = null;
      setProductoSeleccionadoId(null);
    }
  };

  const cambiarFiltro = (nuevoFiltro: FiltroProductos) => {
    setFiltro(nuevoFiltro);
    if (
      productoSeleccionadoId !== null &&
      !filtrarProductos(productos, { familia, estado: nuevoFiltro }).some(
        (producto) => producto.id === productoSeleccionadoId,
      )
    ) {
      activadorPanelRef.current = null;
      setProductoSeleccionadoId(null);
    }
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFamilia("");
    setFiltro("Todos");
    setCodigoCerrado(null);
    setProductoSeleccionadoId(null);
    activadorPanelRef.current = null;
  };

  return (
    <div className="min-w-0 px-5 py-6 sm:px-8">
      <header className="mb-6 flex flex-col gap-4 min-[640px]:flex-row min-[640px]:items-start min-[640px]:justify-between">
        <div>
          <h1
            tabIndex={-1}
            className="font-display text-[28px] leading-tight font-semibold tracking-tight text-ink focus:outline-none"
          >
            Productos
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-soft">
            Revisá el precio, el stock y la ubicación de cada producto.
          </p>
        </div>
      </header>

      <div
        className={`grid min-w-0 gap-6 ${
          productoSeleccionado ? "min-[1100px]:grid-cols-[minmax(0,1fr)_24rem]" : "grid-cols-1"
        }`}
      >
        <section aria-label="Lista de productos" className="min-w-0 space-y-5">
          <div className="space-y-4 rounded-2xl bg-surface p-4 sm:p-5">
            <div className="flex flex-col gap-4 min-[700px]:flex-row min-[700px]:items-end min-[700px]:justify-between">
              <div className="min-w-0 flex-1">
                <label
                  htmlFor="buscar-producto"
                  className="mb-2 block text-sm font-semibold text-ink-soft"
                >
                  Buscar producto
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
                    size={19}
                    aria-hidden="true"
                  />
                  <input
                    ref={inputRef}
                    id="buscar-producto"
                    type="search"
                    value={busqueda}
                    onChange={(event) => {
                      setCodigoCerrado(null);
                      setProductoSeleccionadoId(null);
                      activadorPanelRef.current = null;
                      setBusqueda(event.target.value);
                    }}
                    placeholder="Nombre o código de barras"
                    className="min-h-12 w-full rounded-lg border border-line-control bg-surface py-3 pr-14 pl-11 text-base text-ink shadow-control outline-none transition placeholder:text-muted focus:border-focus focus:outline-2 focus:outline-offset-2 focus:outline-focus"
                  />
                  <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-canvas px-1.5 py-0.5 text-[13px] text-muted">
                    F2
                  </kbd>
                </div>
              </div>

              <div className="w-full min-[700px]:w-52">
                <label
                  htmlFor="familia-producto"
                  className="mb-2 block text-sm font-semibold text-ink-soft"
                >
                  Familia
                </label>
                <select
                  id="familia-producto"
                  value={familia}
                  onChange={(event) => cambiarFamilia(event.target.value)}
                  className="min-h-12 w-full cursor-pointer rounded-lg border border-line-control bg-surface px-3 text-base text-ink shadow-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <option value="">Todas las familias</option>
                  {familias.map((nombreFamilia) => (
                    <option key={nombreFamilia} value={nombreFamilia}>
                      {nombreFamilia}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-[700px]:flex-row min-[700px]:items-center min-[700px]:gap-4">
              <span className="text-sm font-semibold text-ink-soft">Mostrar</span>
              <div role="group" aria-label="Mostrar" className="flex flex-wrap gap-1.5">
                {filtrosDisponibles.map((opcion) => {
                  const cuenta =
                    opcion === "Todos"
                      ? productos.length
                      : opcion === "Stock bajo"
                        ? cantidadStockBajo
                        : cantidadInactivos;

                  return (
                    <button
                      key={opcion}
                      type="button"
                      aria-pressed={filtro === opcion}
                      onClick={() => cambiarFiltro(opcion)}
                      className={`min-h-11 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                        filtro === opcion ? "bg-brand text-white" : "text-ink-soft hover:bg-canvas"
                      }`}
                    >
                      {opcion} <span className="tabular-nums">{cuenta}</span>
                    </button>
                  );
                })}
              </div>
              <p
                className="text-sm text-muted min-[700px]:ml-auto"
                role="status"
                aria-live="polite"
              >
                {productosVisibles.length}{" "}
                {productosVisibles.length === 1 ? "producto" : "productos"}
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-danger-line bg-danger-surface px-4 py-3 text-sm text-danger-ink"
            >
              {error}
            </p>
          )}

          {cargando ? (
            <div
              role="status"
              aria-label="Cargando productos"
              className="space-y-2 rounded-2xl bg-surface p-5"
            >
              {Array.from({ length: 5 }, (_, index) => (
                <div
                  key={index}
                  aria-hidden="true"
                  className="flex h-14 items-center justify-between gap-5 border-b border-line last:border-0"
                >
                  <span className="h-4 w-2/5 rounded bg-canvas" />
                  <span className="h-4 w-1/5 rounded bg-canvas" />
                </div>
              ))}
            </div>
          ) : grupos.length > 0 ? (
            <ProductsTable
              grupos={grupos}
              productoSeleccionadoId={productoSeleccionadoId}
              onSelect={seleccionarProducto}
            />
          ) : (
            <div className="rounded-2xl bg-surface px-6 py-10 text-center">
              <h2 className="font-display text-lg font-semibold text-ink">
                No encontramos productos
              </h2>
              <p className="mt-2 text-base text-muted">
                Probá con otro nombre o código, o cambiá los filtros.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 min-h-11 cursor-pointer rounded-lg px-4 py-2 font-semibold text-primary hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Mostrar todos los productos
              </button>
            </div>
          )}
        </section>

        {productoSeleccionado && (
          <ProductDetailPanel producto={productoSeleccionado} onClose={cerrarPanel} />
        )}
      </div>
    </div>
  );
};
